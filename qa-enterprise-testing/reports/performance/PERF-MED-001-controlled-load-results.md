# PERF-MED-001: Controlled API Load Results

- Bug ID: PERF-MED-001
- Severity: Medium
- Priority: P2
- Module: Performance
- Endpoint: Multiple
- Actor: Concurrent users

## Preconditions

- Backend running on `localhost:8080`.
- No service restart, dependency install, or DB reset performed.

## Steps To Reproduce

1. Run `qa-enterprise-testing/artifacts/api-load-probe.mjs`.
2. Use `REQUESTS=500` and `CONCURRENCY=50`.
3. Run `qa-enterprise-testing/artifacts/ws-auth-storm.mjs` with `CONNECTIONS=100`.

## Expected Behavior

No 5xx errors; p95/p99 should remain within acceptable API budget.

## Actual Behavior

- Health p99: 80 ms.
- `GET /users/me` p99: 211 ms.
- `GET /exams/class/1/active` p99: 474 ms.
- `GET /questions` p99: 1067 ms.
- WebSocket 100/100 connected; p95 connect latency 226 ms.

## Root Cause Hypothesis

Question listing likely performs heavier DB/object graph loading and lacks pagination or optimized DTO projection in the tested path.

## Security Impact

High-latency endpoints can be used for low-cost authenticated load amplification.

## Business Impact

Teacher question bank UX may degrade under concurrent classroom/exam preparation usage.

## Logs

```text
teacher_questions: 500 requests, concurrency=50, statuses={200:500}, p95=905ms, p99=1067ms, max=1277ms
ws-auth-storm: 100 opened, 100 connected, 0 errors, p95=226ms
```

## Suggested Fix

Paginate/limit question list, add query projections/indexes, and run a dedicated k6/JMeter 10k-user test in an isolated load environment. Full 10k was not executed here to avoid intentional DoS on the already-running shared stack.
