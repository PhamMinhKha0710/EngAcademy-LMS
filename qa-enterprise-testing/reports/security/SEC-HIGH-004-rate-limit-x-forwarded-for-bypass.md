# SEC-HIGH-004: Login Rate Limit Bypass Via X-Forwarded-For

- Bug ID: SEC-HIGH-004
- Severity: High
- Priority: P1
- Module: Authentication / Rate Limiting
- Endpoint: `POST /api/v1/auth/login`
- Actor: Anonymous malicious user

## Preconditions

- Rate limiting enabled.

## Steps To Reproduce

1. Send repeated failed login requests with the same `X-Forwarded-For`.
2. Observe `429`.
3. Change `X-Forwarded-For`.
4. Retry login.

## Expected Behavior

Rate limiting uses a trusted proxy-derived client IP or server remote address, not arbitrary client headers.

## Actual Behavior

Constant spoofed IP produced `429`; changed `X-Forwarded-For` returned `401`, bypassing the bucket.

## Root Cause Hypothesis

`RateLimitFilter.getClientIp` trusts `X-Forwarded-For` and `X-Real-IP` directly.

## Security Impact

Credential stuffing and brute-force defenses are bypassable.

## Business Impact

Login endpoint can be abused at high volume and generate auth CPU/DB pressure.

## Logs

```text
Statuses tail=401,401,401,401,401,429,429,429,429,429; bypass=401
```

## Suggested Fix

Trust forwarded headers only from configured reverse proxies. Otherwise use `request.getRemoteAddr()` and edge-layer rate limiting.
