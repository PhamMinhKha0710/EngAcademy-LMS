# BUG-005: Anti-cheat event endpoint ignores path examId

- Issue ID: BUG-005
- Severity: High
- Risk Level: High
- Module: Anti-Cheat
- Tested At: 2026-05-20T09:40:03.530Z

## Steps to Reproduce
1. Start an exam and capture a valid examResultId.
2. POST /api/v1/exams/999999999/anti-cheat-event with that valid examResultId.

## Expected Result
Reject because the path examId does not match the examResultId exam.

## Actual Result
Status 200; event accepted.

## Evidence
{"success":true,"message":"Đã ghi nhận sự kiện","timestamp":"2026-05-20T16:40:14.61218152"}

## Root Cause Hypothesis
ExamController passes only the body DTO and userId to ExamService.logAntiCheatEvent; the path examId is not validated.

## Security Impact
Tampered anti-cheat packets can be replayed through unrelated exam paths, weakening audit integrity.

## Production Impact
Incident review cannot trust URL-level exam context.

## DB Impact
ANTI_CHEAT_EVENT row can be inserted through a mismatched route.

## Concurrency Impact
Replay/flood tools can mix paths while targeting the same result.

## Logs
```text
{
  "name": "anti_cheat_wrong_path_exam_id",
  "method": "POST",
  "path": "/api/v1/exams/999999999/anti-cheat-event",
  "status": 200,
  "ok": true,
  "ms": 32,
  "responseSnippet": "{\"success\":true,\"message\":\"Đã ghi nhận sự kiện\",\"timestamp\":\"2026-05-20T16:40:14.61218152\"}",
  "error": null,
  "json": {
    "success": true,
    "message": "Đã ghi nhận sự kiện",
    "timestamp": "2026-05-20T16:40:14.61218152"
  },
  "text": "{\"success\":true,\"message\":\"Đã ghi nhận sự kiện\",\"timestamp\":\"2026-05-20T16:40:14.61218152\"}"
}
```

## Screenshots
Placeholder: add browser/API screenshots when reproducing manually.

## Recommended Fix
Fetch examResult and verify examResult.exam.id equals path examId before saving the event.

## Regression Risk
Low.
