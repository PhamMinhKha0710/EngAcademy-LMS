# EngAcademy LMS QA System Mapping

- Docs read: `Docs/01` through `Docs/10`, plus `Docs/15-Go-No-Go-Release-Checklist.md`.
- Live OpenAPI: 165 REST operations across 25 tags.
- Runtime backend: `http://localhost:8080`.
- Runtime WebSocket: `ws://localhost:8080/ws/websocket`.
- Runtime frontend checked ports: `3000`, `3001`, `5173`, `80`; all refused connection.

## Business Logic Map

- Auth: JWT access token, refresh token, Redis blacklist on logout, rate-limit on login/register/reset-password.
- Roles: ADMIN global, SCHOOL tenant-scoped, TEACHER school/class/content-scoped, STUDENT self/enrollment-scoped.
- Multi-school: expected isolation by `schoolId`, classroom enrollment, exam class membership, and result ownership.
- Exam lifecycle: DRAFT -> PUBLISHED -> CLOSED -> scores published; student starts exam, gets shuffled questions, logs anti-cheat, submits result.
- Anti-cheat: allowed event types are `TAB_SWITCH`, `COPY`, `PASTE`, `BLUR`, `RIGHT_CLICK`, `DEV_TOOLS`; event timestamp should be server-trusted and result-owned.
- SM-2: quality must be 0..5, EF floor 1.3, interval/repetitions update, duplicate same-day review should return conflict.
- Realtime: STOMP over SockJS, docs claim `/user/queue/notifications`, `/topic/school/{schoolId}`, `/topic/class/{classId}`, `/topic/global`; code also sends notifications to `/topic/notifications/{username}`.

## Live Surface Map

- Authentication endpoints: `/api/v1/auth/login`, `/refresh-token`, `/logout`, `/register`, `/forgot-password`, `/reset-password`, `/google`, `/health`.
- Exam endpoints: `/api/v1/exams`, `/teacher/{teacherId}`, `/class/{classId}`, `/class/{classId}/active`, `/{id}`, `/{id}/take`, `/{examId}/start`, `/{examId}/anti-cheat-event`, `/{examId}/submit-anticheat`, `/{id}/results`, `/{id}/my-result`, `/results/{examResultId}/anti-cheat-events`.
- SRS endpoints: `/api/v1/srs/due-today`, `/api/v1/srs/review`.
- Realtime endpoints: `/ws/websocket` STOMP CONNECT/SUBSCRIBE.
- Tenant-sensitive APIs: users, schools, classes, exams, exam results, notifications, leaderboard, progress, mistakes, badges.

## DB Constraint Map

- `EXAM_RESULT`: unique constraint `uc_exam_student(exam_id, student_id)`.
- `FLASHCARD_REVIEW`: `@Version` optimistic locking plus unique user/vocab and user/grammar constraints.
- `PROGRESS`: unique `(user_id, lesson_id)`.
- `USER_LEARNING_PROFILE`: unique `user_id`.
- `USER_BADGE`: unique `(user_id, badge_id)`.
- Multi-school isolation depends on FK chain `EXAM -> CLASS -> SCHOOL`, `USERS.school_id`, and `STUDENT_CLASS`.

## Live Test Data Created

- School: `3` (`QA Isolation 1779423610`)
- Teacher: `8` (`qa_teacher_1779423610`)
- Class: `3`
- Student: `9` (`qa_student_1779423610`)
- Exam: `9`
- Legit school-3 exam result: `4`
- Cross-school result created by school-1 student: `5`
