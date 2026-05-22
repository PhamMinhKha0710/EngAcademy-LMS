# CONC-HIGH-001: Duplicate Submit Locking Works But Rejections Are HTTP 500

- Bug ID: CONC-HIGH-001
- Severity: High
- Priority: P1
- Module: Exam Submission Concurrency
- Endpoint: `POST /api/v1/exams/{examId}/submit-anticheat`
- Actor: Concurrent student clients

## Preconditions

- Exam `9`, result `4` in progress for legitimate school 3 student.

## Steps To Reproduce

1. Login as `qa_student_1779423610`.
2. Send 12 parallel `submit-anticheat` requests for `examResultId=4`.

## Expected Behavior

Exactly one request succeeds; all duplicate requests return `409 Conflict` or idempotent success with the original result.

## Actual Behavior

Exactly one request succeeded, but 11 duplicate requests returned `500`.

## Root Cause Hypothesis

The pessimistic lock prevents duplicate writes, but the already-submitted branch throws `IllegalStateException` that maps to `500`.

## Security Impact

Attackers can create high error rates with harmless duplicate submissions.

## Business Impact

Mobile retries/concurrent clicks produce server-error UX and possible retry storms.

## Logs

```text
1 500
2 200
3 500
4 500
5 500
6 500
7 500
8 500
9 500
10 500
11 500
12 500
```

## Suggested Fix

Keep the lock, but return `409 Conflict` for duplicates. Add an idempotency response path for repeated client retries.
