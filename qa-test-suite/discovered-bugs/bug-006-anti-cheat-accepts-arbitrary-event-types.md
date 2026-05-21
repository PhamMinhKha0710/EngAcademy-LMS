# BUG-006: Anti-cheat accepts arbitrary event types

- Issue ID: BUG-006
- Severity: Medium
- Risk Level: High
- Module: Anti-Cheat
- Tested At: 2026-05-20T09:40:03.530Z

## Steps to Reproduce
1. Start an active exam.
2. POST an eventType outside the documented set, for example RESET_VIOLATION_COUNT.

## Expected Result
400 validation error for non-whitelisted anti-cheat event types.

## Actual Result
Status 200; fake event accepted and counted.

## Evidence
{"success":true,"message":"Đã ghi nhận sự kiện","timestamp":"2026-05-20T16:40:14.630571849"}

## Root Cause Hypothesis
AntiCheatEventDTO only uses @NotBlank for eventType; no enum or whitelist validation.

## Security Impact
Attackers can pollute audit logs with fake event classes and confuse anti-cheat analytics.

## Production Impact
Teacher/admin review becomes noisy and less trustworthy.

## DB Impact
ANTI_CHEAT_EVENT stores arbitrary event_type values.

## Concurrency Impact
Flooding arbitrary types can amplify audit storage growth.

## Logs
```text
{
  "name": "anti_cheat_fake_event_type",
  "method": "POST",
  "path": "/api/v1/exams/1/anti-cheat-event",
  "status": 200,
  "ok": true,
  "ms": 18,
  "responseSnippet": "{\"success\":true,\"message\":\"Đã ghi nhận sự kiện\",\"timestamp\":\"2026-05-20T16:40:14.630571849\"}",
  "error": null,
  "json": {
    "success": true,
    "message": "Đã ghi nhận sự kiện",
    "timestamp": "2026-05-20T16:40:14.630571849"
  },
  "text": "{\"success\":true,\"message\":\"Đã ghi nhận sự kiện\",\"timestamp\":\"2026-05-20T16:40:14.630571849\"}"
}
```

## Screenshots
Placeholder: add browser/API screenshots when reproducing manually.

## Recommended Fix
Use an enum with validation and reject unknown event types before persistence.

## Regression Risk
Low.
