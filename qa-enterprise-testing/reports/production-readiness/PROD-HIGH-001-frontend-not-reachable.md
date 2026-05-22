# PROD-HIGH-001: Frontend Runtime Not Reachable During QA

- Bug ID: PROD-HIGH-001
- Severity: High
- Priority: P1
- Module: Frontend Runtime / Production Readiness
- Endpoint: `http://localhost:3000`, `3001`, `5173`, `80`
- Actor: Anonymous browser user / QA runner

## Preconditions

- User stated frontend is running.

## Steps To Reproduce

1. Check listening ports with `ss -ltnp`.
2. Call `curl -I` against ports `3000`, `3001`, `5173`, and `80`.

## Expected Behavior

The frontend app responds on its configured Vite/runtime port.

## Actual Behavior

All checked frontend ports refused connection.

## Root Cause Hypothesis

Frontend service is not actually running in this workspace/runtime, or it is bound to an undocumented port/interface.

## Security Impact

No direct security exploit, but browser-level auth, XSS, anti-cheat UI, and WebSocket UX cannot be validated.

## Business Impact

End-to-end LMS flow QA is incomplete and production readiness cannot be signed off.

## Logs

```text
localhost:3000 connect refused
localhost:3001 connect refused
localhost:5173 connect refused
localhost:80 connect refused
ss output showed java:8080, redis:6379, mysql:3306, but no frontend listener.
```

## Suggested Fix

Provide the actual frontend URL/port or start the frontend in the target QA environment, then rerun UI/anti-cheat browser scenarios.
