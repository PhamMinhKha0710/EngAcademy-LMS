#!/usr/bin/env node
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const baseUrl = process.env.BASE_URL || 'http://localhost:8080';
const wsUrl = process.env.WS_URL || baseUrl.replace(/^http/, 'ws') + '/ws/websocket';
const now = new Date().toISOString();

const dirs = ['reports', 'discovered-bugs', 'security-findings', 'production-risks', 'regression'];
for (const dir of dirs) mkdirSync(join(root, dir), { recursive: true });

const users = {
  admin: { username: process.env.QA_ADMIN_USERNAME || 'admin', password: process.env.QA_ADMIN_PASSWORD || 'Admin@123' },
  school: { username: process.env.QA_SCHOOL_USERNAME || 'school1', password: process.env.QA_SCHOOL_PASSWORD || 'School@123' },
  teacher: { username: process.env.QA_TEACHER_USERNAME || 'teacher1', password: process.env.QA_TEACHER_PASSWORD || 'Teacher@123' },
  student1: { username: process.env.QA_STUDENT1_USERNAME || 'student1', password: process.env.QA_STUDENT1_PASSWORD || 'Student@123' },
  student2: { username: process.env.QA_STUDENT2_USERNAME || 'student2', password: process.env.QA_STUDENT2_PASSWORD || 'Student@123' },
};

const results = [];
const findings = [];
const context = { tokens: {}, identities: {}, qaExam: null };

function sanitize(value) {
  return String(value ?? '')
    .replace(/[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g, '[JWT_REDACTED]')
    .replace(/"password"\s*:\s*"[^"]+"/g, '"password":"[REDACTED]"')
    .replace(/Bearer\s+[A-Za-z0-9_.-]+/g, 'Bearer [JWT_REDACTED]');
}

function writeJson(relativePath, value) {
  writeFileSync(join(root, relativePath), `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(relativePath, value) {
  writeFileSync(join(root, relativePath), value);
}

async function request(name, method, path, options = {}) {
  const startedAt = Date.now();
  const headers = { ...(options.headers || {}) };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  if (options.body !== undefined && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
  let status = 0;
  let text = '';
  let json = null;
  let error = null;
  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: options.body === undefined ? undefined : typeof options.body === 'string' ? options.body : JSON.stringify(options.body),
      signal: AbortSignal.timeout(options.timeoutMs || 10000),
    });
    status = response.status;
    text = await response.text();
    try { json = text ? JSON.parse(text) : null; } catch {}
  } catch (e) {
    error = String(e.message || e);
  }
  const result = {
    name,
    method,
    path,
    status,
    ok: status >= 200 && status < 300,
    ms: Date.now() - startedAt,
    responseSnippet: sanitize(text).slice(0, 1000),
    error,
  };
  results.push(result);
  return { ...result, json, text };
}

async function login(roleName, credential) {
  const res = await request(`login_${roleName}`, 'POST', '/api/v1/auth/login', {
    body: credential,
    headers: { 'Content-Type': 'application/json' },
  });
  const data = res.json?.data;
  if (res.ok && data?.accessToken) {
    context.tokens[roleName] = data.accessToken;
    context.identities[roleName] = { id: data.id, username: data.username, email: data.email, roles: data.roles };
  }
  return res;
}

function addFinding({ id, kind, severity, riskLevel, module, title, evidence, steps, expected, actual, rootCause, securityImpact, productionImpact, dbImpact, concurrencyImpact, logs, recommendedFix, regressionRisk }) {
  const directory = kind === 'security' ? 'security-findings' : kind === 'risk' ? 'production-risks' : 'discovered-bugs';
  const filename = `${directory}/${id.toLowerCase()}-${slug(title)}.md`;
  const body = `# ${id}: ${title}

- Issue ID: ${id}
- Severity: ${severity}
- Risk Level: ${riskLevel}
- Module: ${module}
- Tested At: ${now}

## Steps to Reproduce
${steps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

## Expected Result
${expected}

## Actual Result
${actual}

## Evidence
${evidence}

## Root Cause Hypothesis
${rootCause}

## Security Impact
${securityImpact}

## Production Impact
${productionImpact}

## DB Impact
${dbImpact}

## Concurrency Impact
${concurrencyImpact}

## Logs
\`\`\`text
${sanitize(logs || 'See qa-test-suite/reports/live-probe-results.json')}
\`\`\`

## Screenshots
Placeholder: add browser/API screenshots when reproducing manually.

## Recommended Fix
${recommendedFix}

## Regression Risk
${regressionRisk}
`;
  writeText(filename, body);
  findings.push({ id, kind, severity, riskLevel, module, title, file: filename, actual, evidence });
}

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 80);
}

function is2xx(result) {
  return result.status >= 200 && result.status < 300;
}

async function runSurfaceAndSecurityProbes() {
  const health = await request('health_public', 'GET', '/api/v1/auth/health');
  const openapi = await request('openapi_public', 'GET', '/v3/api-docs');
  const swagger = await request('swagger_ui_public', 'GET', '/swagger-ui/index.html');
  const actuator = await request('actuator_root_public', 'GET', '/actuator');
  const actuatorHealth = await request('actuator_health_public', 'GET', '/actuator/health');

  if (is2xx(openapi) || is2xx(swagger)) {
    addFinding({
      id: 'SEC-001',
      kind: 'security',
      severity: 'High',
      riskLevel: 'High',
      module: 'API Documentation Exposure',
      title: 'OpenAPI and Swagger are publicly accessible',
      steps: ['Do not send an Authorization header.', 'GET /v3/api-docs and /swagger-ui/index.html.'],
      expected: 'API documentation is disabled or restricted outside trusted QA/admin networks.',
      actual: `/v3/api-docs status=${openapi.status}; /swagger-ui/index.html status=${swagger.status}.`,
      evidence: `OpenAPI bytes observed: ${openapi.responseSnippet.length}; Swagger status: ${swagger.status}.`,
      rootCause: 'SecurityConfig permits /swagger-ui/** and /v3/api-docs/** for all requests.',
      securityImpact: 'Attackers can enumerate endpoints, schemas, request bodies, tags, and auth expectations.',
      productionImpact: 'Increases exploit speed and endpoint discovery in production.',
      dbImpact: 'Indirect; schema names and DTO fields can guide data tampering attacks.',
      concurrencyImpact: 'Indirect; exposed workflows reveal race targets such as exam submit and SRS review.',
      logs: JSON.stringify({ openapi, swagger }, null, 2),
      recommendedFix: 'Gate Swagger/OpenAPI behind a dev profile, admin auth, IP allowlist, or remove it from production builds.',
      regressionRisk: 'Low if profile-gated; update QA docs to use an authenticated docs route.',
    });
  }

  if (is2xx(actuator) || is2xx(actuatorHealth)) {
    addFinding({
      id: 'SEC-002',
      kind: 'security',
      severity: 'Medium',
      riskLevel: 'High',
      module: 'Actuator',
      title: 'Actuator endpoint is publicly reachable',
      steps: ['Do not send an Authorization header.', 'GET /actuator and /actuator/health.'],
      expected: 'Actuator endpoints require admin/service authentication or are bound to an internal interface.',
      actual: `/actuator status=${actuator.status}; /actuator/health status=${actuatorHealth.status}.`,
      evidence: `Response snippets: actuator=${actuator.responseSnippet}; health=${actuatorHealth.responseSnippet}`,
      rootCause: 'SecurityConfig permits /actuator/** for all requests.',
      securityImpact: 'Health/info/env endpoints can disclose operational state if enabled.',
      productionImpact: 'Public monitoring endpoints increase reconnaissance surface.',
      dbImpact: 'Potential indirect leakage of datasource or migration health if more actuator endpoints are enabled.',
      concurrencyImpact: 'None directly.',
      logs: JSON.stringify({ actuator, actuatorHealth }, null, 2),
      recommendedFix: 'Restrict actuator with management exposure settings plus Spring Security authorization.',
      regressionRisk: 'Medium; external health checks may need a dedicated unauthenticated liveness endpoint.',
    });
  }

  const unauthUsersMe = await request('unauth_users_me', 'GET', '/api/v1/users/me');
  const protectedWorks = unauthUsersMe.status === 401 || unauthUsersMe.status === 403;
  if (!protectedWorks) {
    addFinding({
      id: 'SEC-003',
      kind: 'security',
      severity: 'Critical',
      riskLevel: 'Critical',
      module: 'Authentication',
      title: 'Protected user profile endpoint is accessible without authentication',
      steps: ['Do not send an Authorization header.', 'GET /api/v1/users/me.'],
      expected: '401 Unauthorized.',
      actual: `Status ${unauthUsersMe.status}.`,
      evidence: unauthUsersMe.responseSnippet,
      rootCause: 'Security filter chain or endpoint authorization mismatch.',
      securityImpact: 'Unauthenticated user data access.',
      productionImpact: 'Immediate account privacy breach.',
      dbImpact: 'Reads user records without identity.',
      concurrencyImpact: 'None.',
      logs: JSON.stringify(unauthUsersMe, null, 2),
      recommendedFix: 'Require authentication for all /api/v1/users/** except explicitly public auth routes.',
      regressionRisk: 'Low.',
    });
  }

  const publicLeaderboard = await request('public_leaderboard_top', 'GET', '/api/v1/leaderboard/top?limit=20');
  if (is2xx(publicLeaderboard) && /userId|username|fullName/.test(publicLeaderboard.responseSnippet)) {
    addFinding({
      id: 'SEC-004',
      kind: 'security',
      severity: 'High',
      riskLevel: 'High',
      module: 'Leaderboard',
      title: 'Leaderboard exposes user identity data without authentication',
      steps: ['Do not send an Authorization header.', 'GET /api/v1/leaderboard/top?limit=20.'],
      expected: 'Unauthenticated clients should not receive identifiable student records unless intentionally public and privacy-reviewed.',
      actual: `Status ${publicLeaderboard.status}; response includes user identifiers/names.`,
      evidence: publicLeaderboard.responseSnippet,
      rootCause: 'LeaderboardController top/coins/streak/global endpoints lack @PreAuthorize.',
      securityImpact: 'Student names/user IDs can be enumerated by anonymous users.',
      productionImpact: 'Privacy and tenant data exposure risk, especially in school deployments.',
      dbImpact: 'Read exposure of user and score fields.',
      concurrencyImpact: 'None directly, but public high-limit queries can amplify load.',
      logs: JSON.stringify(publicLeaderboard, null, 2),
      recommendedFix: 'Require authentication and tenant scoping, or return anonymized public leaderboard data only.',
      regressionRisk: 'Medium; public homepage widgets may need a separate anonymized endpoint.',
    });
  }

  const hugeLeaderboard = await request('leaderboard_huge_limit', 'GET', '/api/v1/leaderboard/top?limit=100000', { timeoutMs: 15000 });
  if (hugeLeaderboard.status >= 500 || hugeLeaderboard.ms > 3000 || is2xx(hugeLeaderboard)) {
    addFinding({
      id: 'RISK-001',
      kind: 'risk',
      severity: hugeLeaderboard.status >= 500 ? 'High' : 'Medium',
      riskLevel: 'High',
      module: 'Leaderboard Performance',
      title: 'Leaderboard limit parameter is not bounded at the API edge',
      steps: ['GET /api/v1/leaderboard/top?limit=100000 without auth.', 'Observe response time and status.'],
      expected: 'Reject or clamp excessive limits to a safe maximum such as 100.',
      actual: `Status ${hugeLeaderboard.status}; duration ${hugeLeaderboard.ms}ms.`,
      evidence: hugeLeaderboard.responseSnippet,
      rootCause: 'Controller accepts arbitrary int limit and passes it to PageRequest.of(0, limit).',
      securityImpact: 'Anonymous users can trigger expensive leaderboard queries.',
      productionImpact: 'Potential DB/CPU pressure under repeated requests.',
      dbImpact: 'Large ORDER BY/LIMIT queries against user table.',
      concurrencyImpact: 'Can combine with concurrent requests for load amplification.',
      logs: JSON.stringify(hugeLeaderboard, null, 2),
      recommendedFix: 'Validate limit with @Min/@Max and enforce tenant/auth boundaries.',
      regressionRisk: 'Low.',
    });
  }

  return { health, openapi, swagger, actuator, actuatorHealth };
}

async function runLoginAndTokenProbes() {
  const loginResults = {};
  for (const [role, credential] of Object.entries(users)) {
    loginResults[role] = await login(role, credential);
  }

  const successfulSeedLogins = Object.entries(loginResults).filter(([, result]) => result.ok);
  if (successfulSeedLogins.length >= 3) {
    addFinding({
      id: 'SEC-005',
      kind: 'security',
      severity: 'High',
      riskLevel: 'Critical in production',
      module: 'Authentication',
      title: 'Documented seed credentials are valid on the running system',
      steps: ['Use the dev seed accounts from DevDataSeeder.', 'POST /api/v1/auth/login for admin, school, teacher, and student roles.'],
      expected: 'Seed/demo credentials are disabled outside disposable dev databases.',
      actual: `${successfulSeedLogins.length} seeded role logins succeeded.`,
      evidence: successfulSeedLogins.map(([role, result]) => `${role}: status=${result.status}`).join('\n'),
      rootCause: 'DevDataSeeder creates predictable accounts and the running database contains them.',
      securityImpact: 'If deployed with the same seed data, attackers gain valid admin/school/teacher/student sessions.',
      productionImpact: 'Full administrative takeover if admin seed remains valid.',
      dbImpact: 'All tenant and student data can be modified by seed admin credentials.',
      concurrencyImpact: 'Valid credentials allow high-volume authenticated abuse.',
      logs: JSON.stringify(Object.fromEntries(Object.entries(loginResults).map(([role, result]) => [role, { status: result.status, ok: result.ok, identity: context.identities[role] }])), null, 2),
      recommendedFix: 'Never seed predictable users in production; force randomized secrets or one-time bootstrap admin rotation.',
      regressionRisk: 'Medium; dev/test scripts should read credentials from explicit QA env vars.',
    });
  }

  const adminToken = context.tokens.admin;
  if (adminToken) {
    const tampered = adminToken.slice(0, -1) + (adminToken.endsWith('a') ? 'b' : 'a');
    const tamperedResult = await request('jwt_tamper_users_me', 'GET', '/api/v1/users/me', { token: tampered });
    if (tamperedResult.status !== 401 && tamperedResult.status !== 403) {
      addFinding({
        id: 'SEC-006',
        kind: 'security',
        severity: 'Critical',
        riskLevel: 'Critical',
        module: 'JWT',
        title: 'Tampered JWT was accepted',
        steps: ['Login as admin.', 'Modify one character in the JWT signature.', 'GET /api/v1/users/me.'],
        expected: '401 Unauthorized.',
        actual: `Status ${tamperedResult.status}.`,
        evidence: tamperedResult.responseSnippet,
        rootCause: 'JWT signature validation failure or filter bypass.',
        securityImpact: 'Token forgery and account impersonation.',
        productionImpact: 'Complete auth compromise.',
        dbImpact: 'Unauthorized data access/modification.',
        concurrencyImpact: 'None directly.',
        logs: JSON.stringify(tamperedResult, null, 2),
        recommendedFix: 'Reject invalid signatures and add regression tests for token tampering.',
        regressionRisk: 'Low.',
      });
    }
  }
}

async function runRateLimitProbe() {
  const statuses = [];
  const spoofedIp = `203.0.113.${Math.floor(Math.random() * 80) + 10}`;
  for (let i = 0; i < 105; i++) {
    const result = await request(`rate_limit_constant_xff_${i + 1}`, 'POST', '/api/v1/auth/login', {
      headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': spoofedIp },
      body: { username: `missing-${i}`, password: 'wrong-password' },
      timeoutMs: 5000,
    });
    statuses.push(result.status);
  }
  const bypass = await request('rate_limit_changed_xff', 'POST', '/api/v1/auth/login', {
    headers: { 'Content-Type': 'application/json', 'X-Forwarded-For': `198.51.100.${Math.floor(Math.random() * 80) + 10}` },
    body: { username: 'missing-bypass', password: 'wrong-password' },
    timeoutMs: 5000,
  });
  const saw429 = statuses.includes(429);
  if (saw429 && bypass.status !== 429) {
    addFinding({
      id: 'RISK-002',
      kind: 'risk',
      severity: 'High',
      riskLevel: 'High',
      module: 'Rate Limiting',
      title: 'Login rate limit can be bypassed by spoofing X-Forwarded-For',
      steps: [
        'Send repeated failed login attempts with the same X-Forwarded-For value until 429.',
        'Change X-Forwarded-For and retry the same login attack.',
      ],
      expected: 'Rate limiting uses trusted proxy configuration or remote address, not arbitrary client-supplied headers.',
      actual: `Constant spoofed IP produced 429; changed X-Forwarded-For returned ${bypass.status}.`,
      evidence: `Statuses tail=${statuses.slice(-10).join(',')}; bypass=${bypass.status}.`,
      rootCause: 'RateLimitFilter trusts X-Forwarded-For directly without verifying the request came through a trusted proxy.',
      securityImpact: 'Credential stuffing protections can be bypassed by rotating spoofed headers.',
      productionImpact: 'High login CPU load and brute-force exposure.',
      dbImpact: 'No direct DB writes, but authentication lookups increase.',
      concurrencyImpact: 'Amplified by parallel credential stuffing.',
      logs: JSON.stringify({ statuses, bypass }, null, 2),
      recommendedFix: 'Only trust forwarded headers from configured reverse proxies, or rate limit on a server-side resolved client identity.',
      regressionRisk: 'Medium; deployments behind real proxies need tested header handling.',
    });
  }
}

async function runAuthorizationAndTenantProbes() {
  const student1 = context.identities.student1;
  const student2 = context.identities.student2;
  const teacherToken = context.tokens.teacher;
  const studentToken = context.tokens.student1;
  const schoolToken = context.tokens.school;
  if (!student1 || !student2 || !studentToken) return;

  const student1Classes = await request('student1_classes', 'GET', `/api/v1/classes/student/${student1.id}`, { token: studentToken });
  const student2AsStudent1 = await request('student1_reads_student2_classes', 'GET', `/api/v1/classes/student/${student2.id}`, { token: studentToken });
  if (student2AsStudent1.status !== 403) {
    addFinding({
      id: 'BUG-001',
      kind: 'bug',
      severity: 'High',
      riskLevel: 'High',
      module: 'Classroom Authorization',
      title: 'Student can read another student class list',
      steps: ['Login as student1.', `GET /api/v1/classes/student/${student2.id}.`],
      expected: '403 Forbidden for peer student data.',
      actual: `Status ${student2AsStudent1.status}.`,
      evidence: student2AsStudent1.responseSnippet,
      rootCause: 'ClassRoomController ownership check did not block this peer access path.',
      securityImpact: 'Student membership privacy exposure.',
      productionImpact: 'Students can enumerate peer classes by ID.',
      dbImpact: 'Read exposure of STUDENT_CLASS and CLASS data.',
      concurrencyImpact: 'None.',
      logs: JSON.stringify(student2AsStudent1, null, 2),
      recommendedFix: 'Require current student id to match path studentId unless teacher/admin/school has scoped authority.',
      regressionRisk: 'Low.',
    });
  }

  const classIds1 = extractArray(student1Classes.json?.data).map((c) => c.id).filter(Boolean);
  const student2Classes = await request('student2_classes_as_student2', 'GET', `/api/v1/classes/student/${student2.id}`, { token: context.tokens.student2 });
  const classIds2 = extractArray(student2Classes.json?.data).map((c) => c.id).filter(Boolean);
  const classNotInStudent1 = classIds2.find((id) => !classIds1.includes(id)) || classIds2[0] || 2;

  const directClass = await request('student1_reads_unenrolled_class', 'GET', `/api/v1/classes/${classNotInStudent1}`, { token: studentToken });
  if (is2xx(directClass) && classNotInStudent1 && !classIds1.includes(classNotInStudent1)) {
    addFinding({
      id: 'BUG-002',
      kind: 'bug',
      severity: 'High',
      riskLevel: 'High',
      module: 'Classroom Authorization',
      title: 'Student can read classroom details for a class they are not enrolled in',
      steps: ['Login as student1.', `GET /api/v1/classes/${classNotInStudent1} where student1 is not enrolled.`],
      expected: '403 Forbidden or 404 tenant-filtered response.',
      actual: `Status ${directClass.status}; class details returned.`,
      evidence: directClass.responseSnippet,
      rootCause: 'ClassRoomController.getClassRoomById checks ROLE_SCHOOL tenant only and does not verify student membership.',
      securityImpact: 'IDOR exposing class name, school, teacher, and student count.',
      productionImpact: 'Students can enumerate classrooms and metadata.',
      dbImpact: 'Read exposure of CLASS data.',
      concurrencyImpact: 'None.',
      logs: JSON.stringify({ student1Classes, student2Classes, directClass }, null, 2),
      recommendedFix: 'For ROLE_STUDENT, verify active enrollment before returning classroom details.',
      regressionRisk: 'Medium; frontend may currently rely on broad class reads.',
    });
  }

  const classExams = await request('student1_reads_unenrolled_class_exams', 'GET', `/api/v1/exams/class/${classNotInStudent1}`, { token: studentToken });
  if (is2xx(classExams) && classNotInStudent1 && !classIds1.includes(classNotInStudent1)) {
    addFinding({
      id: 'BUG-003',
      kind: 'bug',
      severity: 'Critical',
      riskLevel: 'Critical',
      module: 'Exam Authorization',
      title: 'Student can enumerate exams for a class they are not enrolled in',
      steps: ['Login as student1.', `GET /api/v1/exams/class/${classNotInStudent1}.`],
      expected: '403 Forbidden unless the student is actively enrolled in the class.',
      actual: `Status ${classExams.status}; endpoint accepted the request.`,
      evidence: classExams.responseSnippet,
      rootCause: 'ExamController.getExamsByClass permits ROLE_STUDENT but performs no student membership or school check.',
      securityImpact: 'Potential exam metadata and schedule leakage across classrooms.',
      productionImpact: 'Students can discover exams outside their class and prepare attacks against exam IDs.',
      dbImpact: 'Read exposure of EXAM rows.',
      concurrencyImpact: 'None directly.',
      logs: JSON.stringify(classExams, null, 2),
      recommendedFix: 'For students, require active StudentClass membership for classId before returning exams.',
      regressionRisk: 'Medium.',
    });
  }

  if (teacherToken && student2) {
    const teacherReadsStudent = await request('teacher_reads_student_classes_by_id', 'GET', `/api/v1/classes/student/${student2.id}`, { token: teacherToken });
    const teacherId = context.identities.teacher?.id;
    const hasUnauthorizedClass = teacherReadsStudent.json?.data?.some(c => c.teacherId !== teacherId);
    if (is2xx(teacherReadsStudent) && hasUnauthorizedClass) {
      addFinding({
        id: 'BUG-004',
        kind: 'bug',
        severity: 'Medium',
        riskLevel: 'Medium',
        module: 'Teacher Authorization',
        title: 'Teacher class-by-student lookup lacks explicit teacher ownership check',
        steps: ['Login as teacher.', `GET /api/v1/classes/student/${student2.id}.`],
        expected: 'Teacher can only query students they teach or that belong to an assigned class/school policy.',
        actual: `Status ${teacherReadsStudent.status}; class list returned by student ID.`,
        evidence: teacherReadsStudent.responseSnippet,
        rootCause: 'ClassRoomController.getClassRoomsByStudent only restricts ROLE_STUDENT self-access; teacher/admin/school are not scoped in this method.',
        securityImpact: 'Potential cross-class student membership discovery.',
        productionImpact: 'Teacher accounts can enumerate student memberships by ID.',
        dbImpact: 'Read exposure of STUDENT_CLASS and CLASS rows.',
        concurrencyImpact: 'None.',
        logs: JSON.stringify(teacherReadsStudent, null, 2),
        recommendedFix: 'Add service-level scoping for teacher/school roles on student membership lookups.',
        regressionRisk: 'Medium.',
      });
    }
  }

  if (schoolToken) {
    await request('school_other_school_forbidden_probe', 'GET', '/api/v1/classes/school/999999', { token: schoolToken });
  }
}

function extractArray(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  return [];
}

async function ensureQaExam() {
  const student = context.identities.student1;
  const teacher = context.identities.teacher;
  const studentToken = context.tokens.student1;
  const teacherToken = context.tokens.teacher;
  if (!student || !teacher || !studentToken || !teacherToken) return null;

  const classesRes = await request('qa_student_classes_for_exam', 'GET', `/api/v1/classes/student/${student.id}`, { token: studentToken });
  const classes = extractArray(classesRes.json?.data);
  const classId = classes[0]?.id || 1;

  let active = await request('qa_active_exams_for_class', 'GET', `/api/v1/exams/class/${classId}/active`, { token: studentToken });
  let activeExams = extractArray(active.json?.data);
  let exam = activeExams[0] || null;

  if (!exam) {
    const questionsRes = await request('qa_teacher_question_list', 'GET', '/api/v1/questions', { token: teacherToken });
    const questions = extractArray(questionsRes.json?.data);
    const questionIds = questions.slice(0, 5).map((q) => q.id).filter(Boolean);
    if (questionIds.length === 0) return null;
    const start = new Date(Date.now() - 60_000).toISOString().slice(0, 19);
    const end = new Date(Date.now() + 2 * 60 * 60_000).toISOString().slice(0, 19);
    const create = await request('qa_create_exam', 'POST', `/api/v1/exams?teacherId=${teacher.id}`, {
      token: teacherToken,
      body: {
        title: `QA Auto Exam ${Date.now()}`,
        classId,
        startTime: start,
        endTime: end,
        durationMinutes: 90,
        questionIds,
        shuffleQuestions: true,
        shuffleAnswers: true,
        antiCheatEnabled: true,
      },
    });
    if (!is2xx(create)) return null;
    exam = create.json?.data;
    await request('qa_publish_exam', 'POST', `/api/v1/exams/${exam.id}/publish`, { token: teacherToken });
  }

  const started = await request('qa_start_exam_student1', 'POST', `/api/v1/exams/${exam.id}/start?studentId=${student.id}`, { token: studentToken });
  if (!is2xx(started)) {
    context.qaExam = { exam, startError: started };
    return context.qaExam;
  }
  context.qaExam = { exam, take: started.json?.data };
  return context.qaExam;
}

async function runExamAndAntiCheatProbes() {
  const qaExam = await ensureQaExam();
  if (!qaExam?.take?.examResultId) return;
  const studentToken = context.tokens.student1;
  const studentId = context.identities.student1.id;
  const examId = qaExam.exam.id;
  const examResultId = qaExam.take.examResultId;

  const wrongPath = await request('anti_cheat_wrong_path_exam_id', 'POST', `/api/v1/exams/999999999/anti-cheat-event`, {
    token: studentToken,
    body: { examResultId, eventType: 'TAB_SWITCH', timestamp: new Date().toISOString().slice(0, 19), details: 'QA wrong path examId probe' },
  });
  if (is2xx(wrongPath)) {
    addFinding({
      id: 'BUG-005',
      kind: 'bug',
      severity: 'High',
      riskLevel: 'High',
      module: 'Anti-Cheat',
      title: 'Anti-cheat event endpoint ignores path examId',
      steps: ['Start an exam and capture a valid examResultId.', 'POST /api/v1/exams/999999999/anti-cheat-event with that valid examResultId.'],
      expected: 'Reject because the path examId does not match the examResultId exam.',
      actual: `Status ${wrongPath.status}; event accepted.`,
      evidence: wrongPath.responseSnippet,
      rootCause: 'ExamController passes only the body DTO and userId to ExamService.logAntiCheatEvent; the path examId is not validated.',
      securityImpact: 'Tampered anti-cheat packets can be replayed through unrelated exam paths, weakening audit integrity.',
      productionImpact: 'Incident review cannot trust URL-level exam context.',
      dbImpact: 'ANTI_CHEAT_EVENT row can be inserted through a mismatched route.',
      concurrencyImpact: 'Replay/flood tools can mix paths while targeting the same result.',
      logs: JSON.stringify(wrongPath, null, 2),
      recommendedFix: 'Fetch examResult and verify examResult.exam.id equals path examId before saving the event.',
      regressionRisk: 'Low.',
    });
  }

  const fakeEvent = await request('anti_cheat_fake_event_type', 'POST', `/api/v1/exams/${examId}/anti-cheat-event`, {
    token: studentToken,
    body: { examResultId, eventType: 'RESET_VIOLATION_COUNT', timestamp: new Date().toISOString().slice(0, 19), details: 'QA fake event type' },
  });
  if (is2xx(fakeEvent)) {
    addFinding({
      id: 'BUG-006',
      kind: 'bug',
      severity: 'Medium',
      riskLevel: 'High',
      module: 'Anti-Cheat',
      title: 'Anti-cheat accepts arbitrary event types',
      steps: ['Start an active exam.', 'POST an eventType outside the documented set, for example RESET_VIOLATION_COUNT.'],
      expected: '400 validation error for non-whitelisted anti-cheat event types.',
      actual: `Status ${fakeEvent.status}; fake event accepted and counted.`,
      evidence: fakeEvent.responseSnippet,
      rootCause: 'AntiCheatEventDTO only uses @NotBlank for eventType; no enum or whitelist validation.',
      securityImpact: 'Attackers can pollute audit logs with fake event classes and confuse anti-cheat analytics.',
      productionImpact: 'Teacher/admin review becomes noisy and less trustworthy.',
      dbImpact: 'ANTI_CHEAT_EVENT stores arbitrary event_type values.',
      concurrencyImpact: 'Flooding arbitrary types can amplify audit storage growth.',
      logs: JSON.stringify(fakeEvent, null, 2),
      recommendedFix: 'Use an enum with validation and reject unknown event types before persistence.',
      regressionRisk: 'Low.',
    });
  }

  const legacyBody = { examId, answers: [] };
  const legacy1 = await request('legacy_submit_first_empty', 'POST', `/api/v1/exams/submit?studentId=${studentId}`, { token: studentToken, body: legacyBody });
  const legacy2 = await request('legacy_submit_second_empty', 'POST', `/api/v1/exams/submit?studentId=${studentId}`, { token: studentToken, body: legacyBody });
  if (is2xx(legacy1) && is2xx(legacy2)) {
    addFinding({
      id: 'BUG-007',
      kind: 'bug',
      severity: 'Critical',
      riskLevel: 'Critical',
      module: 'Exam Submission',
      title: 'Legacy exam submit allows duplicate submissions for the same student and exam',
      steps: ['Login as a student.', `POST /api/v1/exams/submit?studentId=${studentId} twice with examId=${examId}.`],
      expected: 'Second submit is rejected or idempotently returns the original result.',
      actual: `Both submits succeeded: statuses ${legacy1.status}, ${legacy2.status}.`,
      evidence: `First=${legacy1.responseSnippet}\nSecond=${legacy2.responseSnippet}`,
      rootCause: 'EXAM_RESULT has no unique constraint on (exam_id, student_id), and ExamService.submitExam only relies on catching DataIntegrityViolationException.',
      securityImpact: 'Students can submit repeatedly and potentially manipulate attempts/quests/leaderboards.',
      productionImpact: 'Duplicate exam results corrupt teacher reporting and analytics.',
      dbImpact: 'Multiple EXAM_RESULT rows for one exam/student.',
      concurrencyImpact: 'Parallel duplicate submits can create more duplicates under load.',
      logs: JSON.stringify({ legacy1, legacy2 }, null, 2),
      recommendedFix: 'Add an application pre-check plus DB unique/idempotency constraint for submitted results, with a separate in-progress row model if needed.',
      regressionRisk: 'High; migration must handle existing duplicate rows first.',
    });
  }

  const submitBody = { examResultId, answers: [] };
  const parallel = await Promise.all(Array.from({ length: 12 }, (_, i) =>
    request(`anti_cheat_parallel_submit_${i + 1}`, 'POST', `/api/v1/exams/${examId}/submit-anticheat`, { token: studentToken, body: submitBody, timeoutMs: 15000 }),
  ));
  const successCount = parallel.filter(is2xx).length;
  if (successCount > 1) {
    addFinding({
      id: 'BUG-008',
      kind: 'bug',
      severity: 'Critical',
      riskLevel: 'Critical',
      module: 'Exam Submission Concurrency',
      title: 'Anti-cheat exam submit is not idempotent under parallel replay',
      steps: ['Start an exam and capture one examResultId.', 'Send 12 parallel POST /submit-anticheat requests with the same examResultId.'],
      expected: 'Only one request succeeds; all other concurrent replays receive duplicate/submitted response.',
      actual: `${successCount} of 12 concurrent submits succeeded.`,
      evidence: parallel.map((r) => `${r.name}: ${r.status}`).join('\n'),
      rootCause: 'submitExamWithAntiCheat checks submittedAt before save without row-level lock, versioning, or idempotency key.',
      securityImpact: 'Replay can double-count quests, notifications, analytics, or scoring side effects.',
      productionImpact: 'Race-condition data corruption during high-latency/mobile retries.',
      dbImpact: 'Same EXAM_RESULT row is updated multiple times and side effects can run repeatedly.',
      concurrencyImpact: 'Confirmed parallel race vulnerability.',
      logs: JSON.stringify(parallel, null, 2),
      recommendedFix: 'Use pessimistic lock/optimistic @Version on ExamResult, idempotency keys, and side-effect guards.',
      regressionRisk: 'Medium.',
    });
  }
}

async function runSrsProbes() {
  const token = context.tokens.student2 || context.tokens.student1;
  if (!token) return;

  const invalidLow = await request('srs_invalid_quality_low', 'POST', '/api/v1/srs/review', { token, body: { vocabularyId: 1, quality: -1 } });
  const invalidHigh = await request('srs_invalid_quality_high', 'POST', '/api/v1/srs/review', { token, body: { vocabularyId: 1, quality: 6 } });
  const validOnce = await request('srs_valid_review_once', 'POST', '/api/v1/srs/review', { token, body: { vocabularyId: 1, quality: 5 } });

  if (is2xx(invalidLow) || is2xx(invalidHigh)) {
    addFinding({
      id: 'BUG-009',
      kind: 'bug',
      severity: 'High',
      riskLevel: 'High',
      module: 'SRS',
      title: 'SRS accepts invalid SM-2 quality values',
      steps: ['Login as student.', 'POST /api/v1/srs/review with quality=-1 and quality=6.'],
      expected: '400 validation errors for quality outside 0..5.',
      actual: `quality=-1 status=${invalidLow.status}; quality=6 status=${invalidHigh.status}.`,
      evidence: `${invalidLow.responseSnippet}\n${invalidHigh.responseSnippet}`,
      rootCause: 'Validation annotations not enforced or endpoint binding misconfigured.',
      securityImpact: 'Schedule corruption via invalid review quality.',
      productionImpact: 'Learning schedule integrity failure.',
      dbImpact: 'FLASHCARD_REVIEW EF/interval can corrupt.',
      concurrencyImpact: 'Replay of invalid values worsens corruption.',
      logs: JSON.stringify({ invalidLow, invalidHigh }, null, 2),
      recommendedFix: 'Ensure @Valid is applied and validation exceptions are mapped to 400.',
      regressionRisk: 'Low.',
    });
  }

  const parallel = await Promise.all(Array.from({ length: 20 }, (_, i) =>
    request(`srs_parallel_review_${i + 1}`, 'POST', '/api/v1/srs/review', { token, body: { vocabularyId: 1, quality: 5 }, timeoutMs: 15000 }),
  ));
  const successCount = parallel.filter(is2xx).length;
  if (successCount > 1) {
    addFinding({
      id: 'BUG-010',
      kind: 'bug',
      severity: 'High',
      riskLevel: 'High',
      module: 'SRS Concurrency',
      title: 'Concurrent SM-2 review replay advances the same card multiple times',
      steps: ['Login as a student.', 'Send 20 parallel POST /api/v1/srs/review requests for the same vocabularyId and quality=5.'],
      expected: 'One review is accepted per card/session; duplicate concurrent replays are rejected or idempotent.',
      actual: `${successCount} of 20 parallel review submissions returned 2xx.`,
      evidence: parallel.map((r) => `${r.name}: ${r.status}`).join('\n'),
      rootCause: 'SrsService retries optimistic conflicts and applies SM-2 again, but does not use an idempotency key or review session version supplied by the client.',
      securityImpact: 'Users can fast-forward spaced repetition scheduling and gamification signals.',
      productionImpact: 'Learning analytics become inaccurate under retries or automation.',
      dbImpact: 'FLASHCARD_REVIEW repetitions, EF, intervalDays, and nextReviewAt can advance multiple times.',
      concurrencyImpact: 'Confirmed duplicate concurrent state transition.',
      logs: JSON.stringify({ validOnce, parallel }, null, 2),
      recommendedFix: 'Add client-visible review version/idempotency key and reject stale duplicate review submissions.',
      regressionRisk: 'Medium; frontend review flow must include the version/idempotency field.',
    });
  }
}

async function runWebSocketProbe() {
  if (typeof WebSocket === 'undefined') {
    results.push({ name: 'websocket_global_missing', status: 0, ok: false, error: 'Node WebSocket global unavailable' });
    return;
  }
  const probe = await new Promise((resolve) => {
    const messages = [];
    let opened = false;
    let connected = false;
    const timeout = setTimeout(() => {
      try { ws.close(); } catch {}
      resolve({ opened, connected, messages });
    }, 5000);
    const ws = new WebSocket(wsUrl);
    const frame = (command, headers = {}, body = '') => [command, ...Object.entries(headers).map(([k, v]) => `${k}:${v}`), '', body].join('\n') + '\0';
    ws.addEventListener('open', () => {
      opened = true;
      ws.send(frame('CONNECT', { 'accept-version': '1.2', host: 'localhost' }));
      ws.send(frame('SUBSCRIBE', { id: 'anon-sub', destination: '/topic/notifications' }));
    });
    ws.addEventListener('message', (event) => {
      const data = String(event.data);
      messages.push(sanitize(data).slice(0, 300));
      if (data.includes('CONNECTED')) connected = true;
    });
    ws.addEventListener('error', (event) => {
      messages.push(`error:${String(event.message || event.type)}`);
    });
    ws.addEventListener('close', () => {
      clearTimeout(timeout);
      resolve({ opened, connected, messages });
    });
  });
  results.push({ name: 'websocket_anonymous_stomp', method: 'STOMP', path: '/ws/websocket', status: probe.connected ? 101 : probe.opened ? 100 : 0, ok: probe.connected, ms: 0, responseSnippet: probe.messages.join('\n') });
  if (probe.connected) {
    addFinding({
      id: 'SEC-007',
      kind: 'security',
      severity: 'High',
      riskLevel: 'High',
      module: 'WebSocket',
      title: 'Anonymous STOMP clients can connect and subscribe to broker topics',
      steps: ['Open ws://localhost:8080/ws/websocket without a JWT.', 'Send STOMP CONNECT.', 'SUBSCRIBE to /topic/notifications.'],
      expected: 'WebSocket handshake or STOMP CONNECT/SUBSCRIBE requires authentication and destination authorization.',
      actual: 'Anonymous STOMP CONNECTED frame observed.',
      evidence: probe.messages.join('\n'),
      rootCause: 'SecurityConfig permits /ws/** and WebSocketConfig has no message-level security/interceptor validating JWT.',
      securityImpact: 'Unauthenticated clients may subscribe to realtime topics and receive sensitive events if topics are used broadly.',
      productionImpact: 'Realtime privacy leak and connection-flood risk.',
      dbImpact: 'No direct DB write, but notifications can leak DB-backed data.',
      concurrencyImpact: 'Anonymous reconnect storms can saturate WebSocket resources.',
      logs: JSON.stringify(probe, null, 2),
      recommendedFix: 'Require JWT during STOMP CONNECT, validate user destinations, and add authorization rules for topic/queue subscriptions.',
      regressionRisk: 'High; frontend WebSocket client must send auth token during connect.',
    });
  }
}

async function main() {
  await runSurfaceAndSecurityProbes();
  await runLoginAndTokenProbes();
  await runRateLimitProbe();
  await runAuthorizationAndTenantProbes();
  await runExamAndAntiCheatProbes();
  await runSrsProbes();
  await runWebSocketProbe();

  const summary = {
    testedAt: now,
    baseUrl,
    resultCount: results.length,
    findingCount: findings.length,
    findingsBySeverity: countBy(findings, 'severity'),
    findingsByKind: countBy(findings, 'kind'),
    identities: context.identities,
    qaExam: context.qaExam ? {
      examId: context.qaExam.exam?.id,
      examResultId: context.qaExam.take?.examResultId,
      startErrorStatus: context.qaExam.startError?.status,
    } : null,
  };

  writeJson('reports/live-probe-results.json', { summary, results, findings });
  writeText('reports/live-probe-summary.md', `# Live Probe Summary

- Tested at: ${now}
- Base URL: ${baseUrl}
- Probe results: ${results.length}
- Findings: ${findings.length}

## Findings
${findings.map((f) => `- ${f.id} [${f.severity}] ${f.module}: ${f.title} (${f.file})`).join('\n') || '- No findings generated by active probes.'}

## Notes

- Tokens and passwords are redacted from probe logs.
- Tests did not restart services, reinstall dependencies, or alter DB schema.
- Active workflow probes may have inserted QA exam attempts, SRS reviews, and anti-cheat events.
`);

  console.log(JSON.stringify(summary, null, 2));
}

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || 'unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
