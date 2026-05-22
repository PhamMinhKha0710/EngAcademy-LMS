# ANTI-CHEAT-HIGH-001: Anti-Cheat Scope Depends On Broken Exam Access Guard

- Bug ID: ANTI-CHEAT-HIGH-001
- Severity: High
- Priority: P1
- Module: Anti-Cheat
- Endpoint: `POST /api/v1/exams/{examId}/anti-cheat-event`
- Actor: Cross-school student after unauthorized exam start

## Preconditions

- `student1` from school 1 has already started school 3 exam `9`, creating result `5`.

## Steps To Reproduce

1. Login as `student1`.
2. Start school 3 exam `9`.
3. Log `COPY` anti-cheat event against result `5`.

## Expected Behavior

The student cannot start the exam, so no anti-cheat event can be written.

## Actual Behavior

Anti-cheat event returned `200` because the result row had already been created for the wrong tenant.

## Root Cause Hypothesis

`logAntiCheatEvent` validates result ownership and path exam ID, but it inherits the earlier broken exam enrollment guard.

## Security Impact

Cross-tenant exam sessions can write anti-cheat audit data.

## Business Impact

Teacher/admin anti-cheat review becomes polluted by unauthorized sessions.

## Logs

```text
student1_start_cross_school status=200 examResultId=5
student1_log_anticheat_cross_school status=200
```

## Suggested Fix

Fix start/take exam enrollment first; additionally validate `examResult.student` active membership in `exam.classRoom` before accepting anti-cheat events.
