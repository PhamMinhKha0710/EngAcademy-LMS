# BUG-BLOCKER-002: Cross-School Roles Can Read Exam Results And Anti-Cheat Events

- Bug ID: BUG-BLOCKER-002
- Severity: Blocker
- Priority: P0
- Module: Exam Results / Anti-Cheat / Multi-School Isolation
- Endpoint: `GET /api/v1/exams/{id}`, `GET /api/v1/exams/{id}/results`, `GET /api/v1/exams/results/{resultId}/anti-cheat-events`
- Actor: `teacher1` and `school1` from school 1

## Preconditions

- School 3 test tenant exists.
- Exam `9`, result `4`, and anti-cheat event `3` belong to school 3.

## Steps To Reproduce

1. Login as `teacher1` from school 1.
2. Call `GET /api/v1/exams/9`.
3. Call `GET /api/v1/exams/9/results`.
4. Login as `school1`.
5. Call `GET /api/v1/exams/results/4/anti-cheat-events`.
6. Login as `teacher1`.
7. Call `GET /api/v1/exams/results/4/anti-cheat-events`.

## Expected Behavior

All requests from school 1 against school 3 exam/result data return `403`.

## Actual Behavior

- `teacher1_get_exam_with_answers_cross_school` returned `200`.
- `teacher1_results_cross_school` returned `200`.
- `school1_anti_cheat_events_cross_school` returned `200`.
- `teacher1_anti_cheat_events_cross_school` returned `200`.

## Root Cause Hypothesis

`ExamController.getExamById` checks `ROLE_SCHOOL` only and does not scope `ROLE_TEACHER`. `getAntiCheatEvents` contains a TODO-style comment for school ownership but still calls `examService.getAntiCheatEvents(examResultId)` directly. `ExamService.getAntiCheatEvents` only queries by result ID.

## Security Impact

Teachers/school managers can enumerate exam content, results, student names, scores, and anti-cheat events from another tenant.

## Business Impact

Breaks the "ZERO cross-school data access" requirement and makes the release unsafe for multi-school production.

## Logs

```text
teacher1_get_exam_with_answers_cross_school status=200
teacher1_results_cross_school status=200 ... studentId=4 studentName="Tran Minh Khoa"
school1_anti_cheat_events_cross_school status=200 ... eventType="TAB_SWITCH"
teacher1_anti_cheat_events_cross_school status=200 ... eventType="TAB_SWITCH"
```

## Suggested Fix

Centralize exam/result authorization by resolving `examResult.exam.classRoom.school.id` and checking the current role before returning any exam, result, or anti-cheat data. Add regression tests for teacher and school cross-tenant reads.
