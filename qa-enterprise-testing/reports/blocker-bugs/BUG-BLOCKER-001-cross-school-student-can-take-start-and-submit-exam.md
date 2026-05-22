# BUG-BLOCKER-001: Student Can Take, Start, And Submit Cross-School Exam

- Bug ID: BUG-BLOCKER-001
- Severity: Blocker
- Priority: P0
- Module: Exam / Multi-School Isolation
- Endpoint: `GET /api/v1/exams/class/{classId}/active`, `GET /api/v1/exams/{id}/take`, `POST /api/v1/exams/{examId}/start`, `POST /api/v1/exams/{examId}/submit-anticheat`
- Actor: `student1` from school 1

## Preconditions

- School 3 test tenant exists with class `3`, exam `9`, student `9`.
- `student1` belongs to school 1 and is not enrolled in class `3`.

## Steps To Reproduce

1. Login as `student1`.
2. Call `GET /api/v1/exams/class/3/active`.
3. Call `GET /api/v1/exams/9/take`.
4. Call `POST /api/v1/exams/9/start?studentId=4`.
5. Use returned `examResultId=5`.
6. Call `POST /api/v1/exams/9/anti-cheat-event` with `examResultId=5`.
7. Call `POST /api/v1/exams/9/submit-anticheat` with `examResultId=5`.

## Expected Behavior

Every cross-school/enrollment action is rejected with `403 Forbidden`. No `EXAM_RESULT` should be created for a student outside the exam class tenant.

## Actual Behavior

- Active exam list returned `200`.
- Full take payload returned `200`.
- Start exam returned `200` and created `examResultId=5`.
- Anti-cheat event returned `200`.
- Submit returned `200` with `status:"COMPLETED"`.

## Root Cause Hypothesis

`ExamController.getActiveExams` does not receive `@AuthenticationPrincipal` and does not validate enrollment. `ExamController.getExamForStudent` calls `examService.getExamForStudent(id)` without student context. `ExamService.takeExam` validates only student identity and exam status/time, not classroom enrollment or school boundary.

## Security Impact

Exam content, questions, schedules, and result rows can be accessed and written across tenants. This is IDOR plus cross-tenant data corruption.

## Business Impact

Students can take exams for other schools/classes, corrupt teacher dashboards, anti-cheat logs, reports, and score analytics.

## Logs

```text
student1_active_exams_cross_school status=200
student1_get_exam_take_cross_school status=200
student1_start_cross_school status=200 ... examResultId=5
student1_log_anticheat_cross_school status=200
student1_submit_anticheat_cross_school status=200 ... studentId=4 examId=9 status=COMPLETED
```

## Suggested Fix

Apply one shared exam-access guard before active/take/start/submit paths: student must have active `STUDENT_CLASS` membership for `exam.classId`; teacher/school must match `exam.class.schoolId`; never create an `ExamResult` before this guard passes.
