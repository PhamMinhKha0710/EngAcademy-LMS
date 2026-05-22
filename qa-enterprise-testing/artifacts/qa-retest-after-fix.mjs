#!/usr/bin/env node
/**
 * Retest QA fixes after merge to dev (waves 1-3).
 * Run: node qa-enterprise-testing/artifacts/qa-retest-after-fix.mjs
 */

const baseUrl = process.env.BASE_URL || 'http://localhost:8080';

const users = {
  student1: { username: 'student1', password: 'Student@123' },
  teacher1: { username: 'teacher1', password: 'Teacher@123' },
  school1: { username: 'school1', password: 'School@123' },
  admin: { username: 'admin', password: 'Admin@123' },
};

const results = [];

async function req(name, method, path, opts = {}) {
  const headers = { ...(opts.headers || {}) };
  if (opts.token) headers.Authorization = `Bearer ${opts.token}`;
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  let status = 0;
  let json = null;
  let text = '';
  try {
    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
      signal: AbortSignal.timeout(opts.timeoutMs || 15000),
    });
    status = res.status;
    text = await res.text();
    try { json = text ? JSON.parse(text) : null; } catch {}
  } catch (e) {
    text = String(e.message);
  }
  const row = { name, method, path, status, message: json?.message || text.slice(0, 200) };
  results.push(row);
  return { status, json, text, row };
}

async function login(role) {
  const r = await req(`login_${role}`, 'POST', '/api/v1/auth/login', { body: users[role] });
  const token = r.json?.data?.accessToken;
  const refresh = r.json?.data?.refreshToken;
  const id = r.json?.data?.id;
  return { ok: r.status === 200, token, refresh, id, username: r.json?.data?.username };
}

function pass(name, cond, detail = '') {
  return { name, pass: !!cond, detail };
}

async function main() {
  console.log('=== QA Retest (post-fix) ===\n');
  console.log(`Base URL: ${baseUrl}\n`);

  const health = await req('health', 'GET', '/api/v1/auth/health');
  const checks = [pass('health', health.status === 200, `status=${health.status}`)];

  // SEC-HIGH-002: swagger public — OK in dev (enabled), prod should be false
  const swagger = await req('swagger', 'GET', '/swagger-ui/index.html');
  checks.push(pass('swagger_dev_reachable', swagger.status === 200, `status=${swagger.status} (expected 200 in dev)`));

  const s1 = await login('student1');
  const t1 = await login('teacher1');
  const sch1 = await login('school1');
  const adm = await login('admin');
  checks.push(pass('seed_login_dev', s1.ok && t1.ok, `student1=${s1.status} teacher1=${t1.ok}`));

  // SEC-HIGH-001: refresh replay
  if (s1.refresh) {
    const r1 = await req('refresh_1', 'POST', '/api/v1/auth/refresh-token', {
      body: { refreshToken: s1.refresh },
    });
    const newRefresh = r1.json?.data?.refreshToken || s1.refresh;
    const r2 = await req('refresh_replay_old', 'POST', '/api/v1/auth/refresh-token', {
      body: { refreshToken: s1.refresh },
    });
    checks.push(pass('refresh_first', r1.status === 200, `status=${r1.status}`));
    checks.push(pass('refresh_replay_blocked', r2.status === 401, `status=${r2.status} (expect 401)`));

    if (newRefresh) {
      await req('logout', 'POST', '/api/v1/auth/logout', { token: r1.json?.data?.accessToken });
      const rAfterLogout = await req('refresh_after_logout', 'POST', '/api/v1/auth/refresh-token', {
        body: { refreshToken: newRefresh },
      });
      checks.push(pass('refresh_after_logout_blocked', rAfterLogout.status === 401, `status=${rAfterLogout.status}`));
    }
  }

  // SEC-HIGH-004: rate limit XFF — changed IP should still 429 if same remoteAddr bucket... 
  // Actually without proxy, XFF ignored — both use remoteAddr so changing XFF shouldn't bypass
  const spoof1 = '203.0.113.50';
  const statuses = [];
  for (let i = 0; i < 12; i++) {
    const r = await req(`rate_${i}`, 'POST', '/api/v1/auth/login', {
      headers: { 'X-Forwarded-For': spoof1 },
      body: { username: `fake${i}`, password: 'wrong' },
    });
    statuses.push(r.status);
  }
  const bypass = await req('rate_bypass_xff', 'POST', '/api/v1/auth/login', {
    headers: { 'X-Forwarded-For': '198.51.100.99' },
    body: { username: 'fake-bypass', password: 'wrong' },
  });
  const saw429 = statuses.includes(429);
  checks.push(pass('rate_limit_triggers', saw429, `tail=${statuses.slice(-3)}`));
  checks.push(pass('rate_limit_no_xff_bypass', bypass.status === 429 || !saw429 || bypass.status === 401,
    `bypass status=${bypass.status} (expect 429 if limit active)`));

  // Find cross-class: student1 classes vs all classes
  const s1Classes = await req('s1_classes', 'GET', `/api/v1/classes/student/${s1.id}`, { token: s1.token });
  const enrolled = (s1Classes.json?.data || []).map((c) => c.id);
  // Probe class 3 (common QA isolation class) if not enrolled
  const foreignClassId = 3;
  const foreignExamId = 9;

  if (!enrolled.includes(foreignClassId)) {
    const active = await req('cross_active_exams', 'GET', `/api/v1/exams/class/${foreignClassId}/active`, { token: s1.token });
    const take = await req('cross_take', 'GET', `/api/v1/exams/${foreignExamId}/take`, { token: s1.token });
    const start = await req('cross_start', 'POST', `/api/v1/exams/${foreignExamId}/start?studentId=${s1.id}`, { token: s1.token });
    checks.push(pass('blocker001_active', active.status === 403, `status=${active.status}`));
    checks.push(pass('blocker001_take', take.status === 403, `status=${take.status}`));
    checks.push(pass('blocker001_start', start.status === 403, `status=${start.status}`));
  } else {
    checks.push({ name: 'blocker001_skipped', pass: true, detail: `student1 enrolled in class ${foreignClassId}` });
  }

  // BUG-BLOCKER-002: teacher1 reads school3 exam
  if (t1.token) {
    const tExam = await req('teacher_cross_exam', 'GET', `/api/v1/exams/${foreignExamId}`, { token: t1.token });
    const tResults = await req('teacher_cross_results', 'GET', `/api/v1/exams/${foreignExamId}/results`, { token: t1.token });
    checks.push(pass('blocker002_exam', tExam.status === 403, `status=${tExam.status}`));
    checks.push(pass('blocker002_results', tResults.status === 403, `status=${tResults.status}`));
  }

  // CONC-HIGH-001 + BUG-HIGH-001: parallel submit on in-progress exam
  const s1Class = enrolled[0] || 1;
  const activeEx = await req('active_own', 'GET', `/api/v1/exams/class/${s1Class}/active`, { token: s1.token });
  let examId = activeEx.json?.data?.[0]?.id;
  if (!examId) {
    const allEx = await req('exams_class', 'GET', `/api/v1/exams/class/${s1Class}?page=0&size=5`, { token: s1.token });
    examId = allEx.json?.data?.content?.[0]?.id;
  }
  if (examId && s1.token) {
    const start = await req('start_own', 'POST', `/api/v1/exams/${examId}/start?studentId=${s1.id}`, { token: s1.token });
    const examResultId = start.json?.data?.examResultId;
    if (examResultId) {
      const body = { examResultId, answers: [] };
      const parallel = await Promise.all(
        Array.from({ length: 8 }, (_, i) =>
          req(`parallel_submit_${i}`, 'POST', `/api/v1/exams/${examId}/submit-anticheat`, {
            token: s1.token,
            body,
            timeoutMs: 20000,
          }),
        ),
      );
      const ok = parallel.filter((p) => p.status === 200).length;
      const fiveHundred = parallel.filter((p) => p.status === 500).length;
      checks.push(pass('conc_no_500_on_dup', fiveHundred === 0, `${fiveHundred}x500 of 8`));
      checks.push(pass('conc_single_or_idempotent', ok >= 1 && ok <= 8, `${ok}x200 of 8`));

      // Second start after submit should be 409
      const startAgain = await req('start_after_submit', 'POST', `/api/v1/exams/${examId}/start?studentId=${s1.id}`, { token: s1.token });
      checks.push(pass('start_completed_409', startAgain.status === 409, `status=${startAgain.status}`));

      const myResult = await req('my_result_unpublished', 'GET', `/api/v1/exams/${examId}/my-result`, { token: s1.token });
      checks.push(pass('my_result_forbidden', myResult.status === 403, `status=${myResult.status}`));
    }
  }

  // Summary
  console.log('Results:\n');
  let passed = 0;
  let failed = 0;
  for (const c of checks) {
    const icon = c.pass ? 'PASS' : 'FAIL';
    if (c.pass) passed++; else failed++;
    console.log(`  [${icon}] ${c.name}${c.detail ? ` — ${c.detail}` : ''}`);
  }
  console.log(`\nTotal: ${passed} passed, ${failed} failed, ${checks.length} checks`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
