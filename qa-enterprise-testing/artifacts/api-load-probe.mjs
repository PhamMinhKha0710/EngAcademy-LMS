#!/usr/bin/env node

const baseUrl = process.env.BASE_URL || 'http://localhost:8080';
const concurrency = Number(process.env.CONCURRENCY || 50);
const total = Number(process.env.REQUESTS || 500);

async function request(method, path, options = {}) {
  const startedAt = Date.now();
  const headers = { ...(options.headers || {}) };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  if (options.body !== undefined && !headers['Content-Type']) headers['Content-Type'] = 'application/json';

  try {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      signal: AbortSignal.timeout(options.timeoutMs || 10000),
    });
    await response.arrayBuffer();
    return { status: response.status, ms: Date.now() - startedAt };
  } catch (error) {
    return { status: 0, ms: Date.now() - startedAt, error: String(error.message || error) };
  }
}

async function login(username, password) {
  const response = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    signal: AbortSignal.timeout(10000),
  });
  const json = await response.json();
  return json.data.accessToken;
}

function percentile(values, q) {
  if (values.length === 0) return null;
  return values[Math.min(values.length - 1, Math.floor(values.length * q))];
}

function summarize(name, results) {
  const latencies = results.map((result) => result.ms).sort((a, b) => a - b);
  const statuses = results.reduce((acc, result) => {
    acc[result.status] = (acc[result.status] || 0) + 1;
    return acc;
  }, {});
  const errors = results.filter((result) => result.status === 0).slice(0, 5).map((result) => result.error);
  return {
    name,
    total: results.length,
    statuses,
    errors,
    latencyMs: {
      min: latencies[0] ?? null,
      p50: percentile(latencies, 0.50),
      p95: percentile(latencies, 0.95),
      p99: percentile(latencies, 0.99),
      max: latencies[latencies.length - 1] ?? null,
    },
  };
}

async function runScenario(name, method, path, options = {}) {
  const results = [];
  let next = 0;

  async function worker() {
    for (;;) {
      const index = next;
      next += 1;
      if (index >= total) return;
      results.push(await request(method, path, options));
    }
  }

  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return summarize(name, results);
}

const studentToken = await login('student1', 'Student@123');
const teacherToken = await login('teacher1', 'Teacher@123');

const scenarios = [
  await runScenario('health_public', 'GET', '/api/v1/auth/health'),
  await runScenario('student_me', 'GET', '/api/v1/users/me', { token: studentToken }),
  await runScenario('student_active_exams_class_1', 'GET', '/api/v1/exams/class/1/active', { token: studentToken }),
  await runScenario('teacher_questions', 'GET', '/api/v1/questions', { token: teacherToken }),
];

console.log(JSON.stringify({
  baseUrl,
  totalPerScenario: total,
  concurrency,
  scenarios,
}, null, 2));
