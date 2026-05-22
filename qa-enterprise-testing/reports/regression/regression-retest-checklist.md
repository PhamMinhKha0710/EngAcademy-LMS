# Regression Retest Checklist

- Auth: invalid JWT returns 401; forged role/header stays forbidden; logout blacklists access token.
- Auth: refresh token replay is rejected; refresh after logout is rejected.
- Rate limit: changing client-supplied `X-Forwarded-For` does not bypass login bucket.
- Exam: unenrolled student receives 403 for class active exams, exam take, exam start, anti-cheat event, submit, and my-result.
- Exam: teacher and school roles cannot read exam/result/anti-cheat data outside their school/class ownership.
- Exam: duplicate submit returns 409 or idempotent 200, not 500.
- Anti-cheat: only whitelisted event types accepted; path `examId` must match result exam; result student must be enrolled in exam class.
- SM-2: quality outside 0..5 returns 400; same-day duplicate/concurrent review returns 409/idempotent response.
- WebSocket: anonymous CONNECT rejected; unauthorized SUBSCRIBE to school/class/user topics rejected; private notifications use `/user/queue/notifications`.
- Frontend: actual frontend URL reachable; browser exam flow anti-cheat events verified from UI.
- Performance: rerun controlled load and dedicated 10k-user load test in isolated environment.
