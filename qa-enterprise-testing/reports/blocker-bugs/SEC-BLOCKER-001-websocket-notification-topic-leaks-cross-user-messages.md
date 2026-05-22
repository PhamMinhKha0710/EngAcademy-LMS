# SEC-BLOCKER-001: WebSocket Notification Topic Leaks Cross-User Messages

- Bug ID: SEC-BLOCKER-001
- Severity: Blocker
- Priority: P0
- Module: WebSocket / Notifications
- Endpoint: `ws://localhost:8080/ws/websocket`, `/topic/notifications/{username}`, `POST /api/v1/notifications/send/{userId}`
- Actor: `student1` subscribing to `qa_student_1779423610`

## Preconditions

- `student1` is authenticated as school 1.
- `qa_student_1779423610` is user `9` in school 3.

## Steps To Reproduce

1. Login as `student1`.
2. Open STOMP WebSocket with `Authorization: Bearer <student1 token>`.
3. Subscribe to `/topic/notifications/qa_student_1779423610`.
4. Login as `admin`.
5. Send `POST /api/v1/notifications/send/9?title=<marker>&message=<message>`.

## Expected Behavior

The subscription is rejected, or notifications are sent only to a server-enforced user destination like `/user/queue/notifications`.

## Actual Behavior

`student1` received the message for `qa_student_1779423610`.

## Root Cause Hypothesis

`WebSocketConfig` validates STOMP `CONNECT` but does not authorize `SUBSCRIBE` destinations. `NotificationService.sendNotification` publishes to a guessable public topic `/topic/notifications/{username}` instead of `convertAndSendToUser`.

## Security Impact

Any authenticated user can subscribe to another user's notification topic if they know or guess the username.

## Business Impact

Private student/school notifications can leak across tenants in realtime.

## Logs

```text
destination=/topic/notifications/qa_student_1779423610
leaked=true
MESSAGE ... {"title":"QA-WS-LEAK-1779424334385","message":"Cross-user websocket notification probe"}
teacher1_send_notification_to_school3_user status=200
```

## Suggested Fix

Use `/user/queue/notifications` and `convertAndSendToUser` for private messages. Add a STOMP inbound interceptor for `SUBSCRIBE` that rejects `/topic/notifications/{username}` unless the username matches the authenticated principal, and add school/class topic authorization.
