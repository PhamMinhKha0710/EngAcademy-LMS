# Multi-School Blocker Summary

## Result

NO-GO. The live tenant-isolation retest found confirmed cross-school read and write paths.

## Failed Invariants

- Student must only see active exams for enrolled classes.
- Student must only fetch/take/start exams for enrolled classes.
- Student must never create `EXAM_RESULT` for another school's class.
- Teacher must not read exam details/results outside their school/classes.
- School manager must not read anti-cheat events outside their school.
- WebSocket private notifications must not be delivered through guessable public topics.

## Passing Invariants Observed

- `GET /api/v1/exams/class/3` returned `403` for unenrolled `student1`.
- `GET /api/v1/classes/3` returned `403` for unenrolled `student1`.
- `school1` could not read `GET /api/v1/exams/9`.
- `school1` could not read `GET /api/v1/classes/3`.
- `teacher1` could not read `GET /api/v1/classes/student/9`.

## Blocker Bug Files

- `reports/blocker-bugs/BUG-BLOCKER-001-cross-school-student-can-take-start-and-submit-exam.md`
- `reports/blocker-bugs/BUG-BLOCKER-002-cross-school-teacher-school-can-read-exam-results-and-anticheat.md`
- `reports/blocker-bugs/SEC-BLOCKER-001-websocket-notification-topic-leaks-cross-user-messages.md`
