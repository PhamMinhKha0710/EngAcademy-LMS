# Regression Backlog

## P0

- Exam submit duplicate protection for both `/api/v1/exams/submit` and `/api/v1/exams/{examId}/submit-anticheat`.
- Student class/exam IDOR prevention for direct class IDs and class exam lists.
- WebSocket JWT enforcement and destination-level authorization.

## P1

- Anti-cheat event enum validation and `examId`/`examResultId` binding.
- SM2 concurrent review idempotency and 409 conflict mapping.
- Swagger/OpenAPI/actuator production profile lock-down.
- Rate-limit trusted proxy handling.

## P2

- Teacher lookup scoping for student membership queries.
- API-wide pagination and limit caps.
- Consistent 4xx handling for business-rule duplicate/replay failures.
