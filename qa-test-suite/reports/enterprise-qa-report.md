# EngAcademy LMS Enterprise QA Report

- Test date: 2026-05-20
- Target: `http://localhost:8080`, `http://localhost:3000`
- Scenario catalog: 34,853 scenarios from 165 live OpenAPI operations
- Active probes executed: 170
- Active findings: 12
- Service restarts/reinstalls/schema edits: none

## Executive Summary

The strongest issues are in exam integrity, realtime authorization, and predictable seed access. The active probes confirmed duplicate exam submission paths, a race condition in anti-cheat submission, anonymous WebSocket/STOMP connection, public Swagger/OpenAPI exposure, X-Forwarded-For rate-limit bypass, classroom IDOR, anti-cheat payload tampering, and SM2 concurrency instability.

## Critical Findings

- `BUG-003`: Student can enumerate exams for a class they are not enrolled in.
- `BUG-007`: Legacy exam submit allows duplicate submitted results for the same student/exam.
- `BUG-008`: Anti-cheat submit is not idempotent under parallel replay; 7 of 12 concurrent submits succeeded.

## High Findings

- `SEC-001`: OpenAPI and Swagger are publicly accessible.
- `SEC-005`: Seed credentials are valid on the running system.
- `SEC-007`: Anonymous STOMP clients can connect and subscribe.
- `RISK-002`: Login rate limit can be bypassed by spoofing `X-Forwarded-For`.
- `BUG-002`: Student can read details for a class they are not enrolled in.
- `BUG-005`: Anti-cheat endpoint ignores path `examId`.
- `BUG-010`: Concurrent SM2 review replay produces multiple successful updates and optimistic-lock 500s.

## Medium Findings

- `BUG-004`: Teacher class-by-student lookup lacks explicit ownership scoping.
- `BUG-006`: Anti-cheat accepts arbitrary event types.

## Production Risk Themes

- Authorization is too controller-local; school/student/teacher ownership checks are incomplete across class and exam routes.
- Exam result persistence lacks a reliable uniqueness/idempotency boundary.
- Realtime WebSocket auth is not enforced at connect/subscribe time.
- SM2 optimistic locking is present but not converted into clean client-facing conflict handling or idempotent review semantics.
- Rate limiting trusts spoofable forwarding headers.

## Recommended Fix Order

1. Lock down exam submit: unique/idempotent result model, row locking or optimistic version on `ExamResult`, and one accepted submit per active exam session.
2. Add service-level authorization guards for class/exam resources: student enrollment, teacher assignment, school tenant, and admin override.
3. Require JWT validation and destination authorization for STOMP `CONNECT`/`SUBSCRIBE`.
4. Disable or secure Swagger/OpenAPI and all actuator endpoints outside dev-only profiles.
5. Replace arbitrary anti-cheat event strings with a validated enum and bind path `examId` to body `examResultId`.
6. Make SM2 review submissions idempotent with a review session/version key and map optimistic conflicts to 409.
7. Rate limit using a trusted proxy model instead of arbitrary `X-Forwarded-For`.

## Generated Evidence

- Scenario counts: `reports/scenario-summary.json`
- Active probe raw evidence: `reports/live-probe-results.json`
- Individual issue reports: `discovered-bugs/`, `security-findings/`, `production-risks/`
- Regression assets: `regression/ci-regression-template.yml`, `api/postman-collection.json`, `performance/k6-load-test.js`
