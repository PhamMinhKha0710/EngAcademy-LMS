#!/usr/bin/env node
const baseUrl = process.env.BASE_URL || 'http://localhost:8080';
const token = process.env.STUDENT_TOKEN;
const examResultId = process.env.EXAM_RESULT_ID;
if (!token || !examResultId) {
  console.error('Set STUDENT_TOKEN and EXAM_RESULT_ID before running.');
  process.exit(2);
}
const body = JSON.stringify({ examResultId: Number(examResultId), answers: [] });
const attempts = Number(process.env.ATTEMPTS || 20);
const responses = await Promise.all(Array.from({ length: attempts }, async (_, i) => {
  const startedAt = Date.now();
  const res = await fetch(`${baseUrl}/api/v1/exams/0/submit-anticheat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body,
  });
  return { attempt: i + 1, status: res.status, ms: Date.now() - startedAt, text: (await res.text()).slice(0, 300) };
}));
console.log(JSON.stringify({ attempts, successCount: responses.filter((r) => r.status >= 200 && r.status < 300).length, responses }, null, 2));
