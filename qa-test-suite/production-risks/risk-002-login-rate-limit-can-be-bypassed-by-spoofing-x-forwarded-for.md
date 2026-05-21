# RISK-002: Login rate limit can be bypassed by spoofing X-Forwarded-For

- Issue ID: RISK-002
- Severity: High
- Risk Level: High
- Module: Rate Limiting
- Tested At: 2026-05-21T09:06:17.860Z

## Steps to Reproduce
1. Send repeated failed login attempts with the same X-Forwarded-For value until 429.
2. Change X-Forwarded-For and retry the same login attack.

## Expected Result
Rate limiting uses trusted proxy configuration or remote address, not arbitrary client-supplied headers.

## Actual Result
Constant spoofed IP produced 429; changed X-Forwarded-For returned 401.

## Evidence
Statuses tail=401,401,401,401,401,429,429,429,429,429; bypass=401.

## Root Cause Hypothesis
RateLimitFilter trusts X-Forwarded-For directly without verifying the request came through a trusted proxy.

## Security Impact
Credential stuffing protections can be bypassed by rotating spoofed headers.

## Production Impact
High login CPU load and brute-force exposure.

## DB Impact
No direct DB writes, but authentication lookups increase.

## Concurrency Impact
Amplified by parallel credential stuffing.

## Logs
```text
{
  "statuses": [
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    401,
    429,
    429,
    429,
    429,
    429
  ],
  "bypass": {
    "name": "rate_limit_changed_xff",
    "method": "POST",
    "path": "/api/v1/auth/login",
    "status": 401,
    "ok": false,
    "ms": 124,
    "responseSnippet": "{\"success\":false,\"message\":\"Tên đăng nhập hoặc mật khẩu không đúng\",\"timestamp\":\"2026-05-21T16:06:34.216936643\"}",
    "error": null,
    "json": {
      "success": false,
      "message": "Tên đăng nhập hoặc mật khẩu không đúng",
      "timestamp": "2026-05-21T16:06:34.216936643"
    },
    "text": "{\"success\":false,\"message\":\"Tên đăng nhập hoặc mật khẩu không đúng\",\"timestamp\":\"2026-05-21T16:06:34.216936643\"}"
  }
}
```

## Screenshots
Placeholder: add browser/API screenshots when reproducing manually.

## Recommended Fix
Only trust forwarded headers from configured reverse proxies, or rate limit on a server-side resolved client identity.

## Regression Risk
Medium; deployments behind real proxies need tested header handling.
