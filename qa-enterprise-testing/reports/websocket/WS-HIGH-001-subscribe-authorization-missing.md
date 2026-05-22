# WS-HIGH-001: Authenticated Users Can Subscribe To Unauthorized Topics

- Bug ID: WS-HIGH-001
- Severity: High
- Priority: P1
- Module: WebSocket Authorization
- Endpoint: `ws://localhost:8080/ws/websocket`
- Actor: `student1`

## Preconditions

- `student1` has a valid JWT.
- School 3 and class 3 exist.

## Steps To Reproduce

1. Connect to STOMP with `student1` token.
2. Subscribe to `/topic/school/3`.
3. Subscribe to `/topic/class/3`.
4. Subscribe to `/topic/global`.
5. Subscribe to `/user/queue/notifications`.

## Expected Behavior

Unauthorized school/class topic subscriptions are rejected.

## Actual Behavior

Connection succeeded and no `ERROR` frame was returned for any subscription.

## Root Cause Hypothesis

`WebSocketConfig` validates `CONNECT` only. There is no destination-level authorization for `SUBSCRIBE`.

## Security Impact

If school/class/global topics are used, cross-tenant realtime leakage is possible.

## Business Impact

Realtime isolation does not match docs or multi-school requirements.

## Logs

```text
connected=true
destinations=/topic/school/3,/topic/class/3,/topic/global,/user/queue/notifications
subscribeErrors=0
```

## Suggested Fix

Add `SUBSCRIBE` authorization in the channel interceptor and reject school/class destinations unless the principal belongs to that school/class.
