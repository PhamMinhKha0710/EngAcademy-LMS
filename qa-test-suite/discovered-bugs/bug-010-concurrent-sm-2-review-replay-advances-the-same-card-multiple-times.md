# BUG-010: Concurrent SM-2 review replay advances the same card multiple times

- Issue ID: BUG-010
- Severity: High
- Risk Level: High
- Module: SRS Concurrency
- Tested At: 2026-05-21T08:58:25.590Z

## Steps to Reproduce
1. Login as a student.
2. Send 20 parallel POST /api/v1/srs/review requests for the same vocabularyId and quality=5.

## Expected Result
One review is accepted per card/session; duplicate concurrent replays are rejected or idempotent.

## Actual Result
20 of 20 parallel review submissions returned 2xx.

## Evidence
srs_parallel_review_1: 200
srs_parallel_review_2: 200
srs_parallel_review_3: 200
srs_parallel_review_4: 200
srs_parallel_review_5: 200
srs_parallel_review_6: 200
srs_parallel_review_7: 200
srs_parallel_review_8: 200
srs_parallel_review_9: 200
srs_parallel_review_10: 200
srs_parallel_review_11: 200
srs_parallel_review_12: 200
srs_parallel_review_13: 200
srs_parallel_review_14: 200
srs_parallel_review_15: 200
srs_parallel_review_16: 200
srs_parallel_review_17: 200
srs_parallel_review_18: 200
srs_parallel_review_19: 200
srs_parallel_review_20: 200

## Root Cause Hypothesis
SrsService retries optimistic conflicts and applies SM-2 again, but does not use an idempotency key or review session version supplied by the client.

## Security Impact
Users can fast-forward spaced repetition scheduling and gamification signals.

## Production Impact
Learning analytics become inaccurate under retries or automation.

## DB Impact
FLASHCARD_REVIEW repetitions, EF, intervalDays, and nextReviewAt can advance multiple times.

## Concurrency Impact
Confirmed duplicate concurrent state transition.

## Logs
```text
{
  "validOnce": {
    "name": "srs_valid_review_once",
    "method": "POST",
    "path": "/api/v1/srs/review",
    "status": 200,
    "ok": true,
    "ms": 22,
    "responseSnippet": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:34.991500136\"}",
    "error": null,
    "json": {
      "success": true,
      "message": "Đã ghi nhận review",
      "data": {
        "vocabularyId": null,
        "grammarId": null,
        "contentType": null,
        "word": null,
        "pronunciation": null,
        "meaning": null,
        "exampleSentence": null,
        "audioUrl": null,
        "easinessFactor": 2.5,
        "intervalDays": 0,
        "repetitions": 0,
        "nextReviewAt": "2026-05-21",
        "lastReviewedAt": null,
        "overdueDays": null,
        "totalDue": 0,
        "totalReviewedToday": 0,
        "items": []
      },
      "timestamp": "2026-05-21T15:58:34.991500136"
    },
    "text": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:34.991500136\"}"
  },
  "parallel": [
    {
      "name": "srs_parallel_review_1",
      "method": "POST",
      "path": "/api/v1/srs/review",
      "status": 200,
      "ok": true,
      "ms": 72,
      "responseSnippet": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.063501127\"}",
      "error": null,
      "json": {
        "success": true,
        "message": "Đã ghi nhận review",
        "data": {
          "vocabularyId": null,
          "grammarId": null,
          "contentType": null,
          "word": null,
          "pronunciation": null,
          "meaning": null,
          "exampleSentence": null,
          "audioUrl": null,
          "easinessFactor": 2.5,
          "intervalDays": 0,
          "repetitions": 0,
          "nextReviewAt": "2026-05-21",
          "lastReviewedAt": null,
          "overdueDays": null,
          "totalDue": 0,
          "totalReviewedToday": 0,
          "items": []
        },
        "timestamp": "2026-05-21T15:58:35.063501127"
      },
      "text": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.063501127\"}"
    },
    {
      "name": "srs_parallel_review_2",
      "method": "POST",
      "path": "/api/v1/srs/review",
      "status": 200,
      "ok": true,
      "ms": 92,
      "responseSnippet": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.082256387\"}",
      "error": null,
      "json": {
        "success": true,
        "message": "Đã ghi nhận review",
        "data": {
          "vocabularyId": null,
          "grammarId": null,
          "contentType": null,
          "word": null,
          "pronunciation": null,
          "meaning": null,
          "exampleSentence": null,
          "audioUrl": null,
          "easinessFactor": 2.5,
          "intervalDays": 0,
          "repetitions": 0,
          "nextReviewAt": "2026-05-21",
          "lastReviewedAt": null,
          "overdueDays": null,
          "totalDue": 0,
          "totalReviewedToday": 0,
          "items": []
        },
        "timestamp": "2026-05-21T15:58:35.082256387"
      },
      "text": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.082256387\"}"
    },
    {
      "name": "srs_parallel_review_3",
      "method": "POST",
      "path": "/api/v1/srs/review",
      "status": 200,
      "ok": true,
      "ms": 56,
      "responseSnippet": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.047139506\"}",
      "error": null,
      "json": {
        "success": true,
        "message": "Đã ghi nhận review",
        "data": {
          "vocabularyId": null,
          "grammarId": null,
          "contentType": null,
          "word": null,
          "pronunciation": null,
          "meaning": null,
          "exampleSentence": null,
          "audioUrl": null,
          "easinessFactor": 2.5,
          "intervalDays": 0,
          "repetitions": 0,
          "nextReviewAt": "2026-05-21",
          "lastReviewedAt": null,
          "overdueDays": null,
          "totalDue": 0,
          "totalReviewedToday": 0,
          "items": []
        },
        "timestamp": "2026-05-21T15:58:35.047139506"
      },
      "text": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.047139506\"}"
    },
    {
      "name": "srs_parallel_review_4",
      "method": "POST",
      "path": "/api/v1/srs/review",
      "status": 200,
      "ok": true,
      "ms": 78,
      "responseSnippet": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.069261683\"}",
      "error": null,
      "json": {
        "success": true,
        "message": "Đã ghi nhận review",
        "data": {
          "vocabularyId": null,
          "grammarId": null,
          "contentType": null,
          "word": null,
          "pronunciation": null,
          "meaning": null,
          "exampleSentence": null,
          "audioUrl": null,
          "easinessFactor": 2.5,
          "intervalDays": 0,
          "repetitions": 0,
          "nextReviewAt": "2026-05-21",
          "lastReviewedAt": null,
          "overdueDays": null,
          "totalDue": 0,
          "totalReviewedToday": 0,
          "items": []
        },
        "timestamp": "2026-05-21T15:58:35.069261683"
      },
      "text": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.069261683\"}"
    },
    {
      "name": "srs_parallel_review_5",
      "method": "POST",
      "path": "/api/v1/srs/review",
      "status": 200,
      "ok": true,
      "ms": 143,
      "responseSnippet": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.134528763\"}",
      "error": null,
      "json": {
        "success": true,
        "message": "Đã ghi nhận review",
        "data": {
          "vocabularyId": null,
          "grammarId": null,
          "contentType": null,
          "word": null,
          "pronunciation": null,
          "meaning": null,
          "exampleSentence": null,
          "audioUrl": null,
          "easinessFactor": 2.5,
          "intervalDays": 0,
          "repetitions": 0,
          "nextReviewAt": "2026-05-21",
          "lastReviewedAt": null,
          "overdueDays": null,
          "totalDue": 0,
          "totalReviewedToday": 0,
          "items": []
        },
        "timestamp": "2026-05-21T15:58:35.134528763"
      },
      "text": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.134528763\"}"
    },
    {
      "name": "srs_parallel_review_6",
      "method": "POST",
      "path": "/api/v1/srs/review",
      "status": 200,
      "ok": true,
      "ms": 138,
      "responseSnippet": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.128732206\"}",
      "error": null,
      "json": {
        "success": true,
        "message": "Đã ghi nhận review",
        "data": {
          "vocabularyId": null,
          "grammarId": null,
          "contentType": null,
          "word": null,
          "pronunciation": null,
          "meaning": null,
          "exampleSentence": null,
          "audioUrl": null,
          "easinessFactor": 2.5,
          "intervalDays": 0,
          "repetitions": 0,
          "nextReviewAt": "2026-05-21",
          "lastReviewedAt": null,
          "overdueDays": null,
          "totalDue": 0,
          "totalReviewedToday": 0,
          "items": []
        },
        "timestamp": "2026-05-21T15:58:35.128732206"
      },
      "text": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.128732206\"}"
    },
    {
      "name": "srs_parallel_review_7",
      "method": "POST",
      "path": "/api/v1/srs/review",
      "status": 200,
      "ok": true,
      "ms": 144,
      "responseSnippet": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.135812208\"}",
      "error": null,
      "json": {
        "success": true,
        "message": "Đã ghi nhận review",
        "data": {
          "vocabularyId": null,
          "grammarId": null,
          "contentType": null,
          "word": null,
          "pronunciation": null,
          "meaning": null,
          "exampleSentence": null,
          "audioUrl": null,
          "easinessFactor": 2.5,
          "intervalDays": 0,
          "repetitions": 0,
          "nextReviewAt": "2026-05-21",
          "lastReviewedAt": null,
          "overdueDays": null,
          "totalDue": 0,
          "totalReviewedToday": 0,
          "items": []
        },
        "timestamp": "2026-05-21T15:58:35.135812208"
      },
      "text": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.135812208\"}"
    },
    {
      "name": "srs_parallel_review_8",
      "method": "POST",
      "path": "/api/v1/srs/review",
      "status": 200,
      "ok": true,
      "ms": 149,
      "responseSnippet": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.140488065\"}",
      "error": null,
      "json": {
        "success": true,
        "message": "Đã ghi nhận review",
        "data": {
          "vocabularyId": null,
          "grammarId": null,
          "contentType": null,
          "word": null,
          "pronunciation": null,
          "meaning": null,
          "exampleSentence": null,
          "audioUrl": null,
          "easinessFactor": 2.5,
          "intervalDays": 0,
          "repetitions": 0,
          "nextReviewAt": "2026-05-21",
          "lastReviewedAt": null,
          "overdueDays": null,
          "totalDue": 0,
          "totalReviewedToday": 0,
          "items": []
        },
        "timestamp": "2026-05-21T15:58:35.140488065"
      },
      "text": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.140488065\"}"
    },
    {
      "name": "srs_parallel_review_9",
      "method": "POST",
      "path": "/api/v1/srs/review",
      "status": 200,
      "ok": true,
      "ms": 100,
      "responseSnippet": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.091147062\"}",
      "error": null,
      "json": {
        "success": true,
        "message": "Đã ghi nhận review",
        "data": {
          "vocabularyId": null,
          "grammarId": null,
          "contentType": null,
          "word": null,
          "pronunciation": null,
          "meaning": null,
          "exampleSentence": null,
          "audioUrl": null,
          "easinessFactor": 2.5,
          "intervalDays": 0,
          "repetitions": 0,
          "nextReviewAt": "2026-05-21",
          "lastReviewedAt": null,
          "overdueDays": null,
          "totalDue": 0,
          "totalReviewedToday": 0,
          "items": []
        },
        "timestamp": "2026-05-21T15:58:35.091147062"
      },
      "text": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.091147062\"}"
    },
    {
      "name": "srs_parallel_review_10",
      "method": "POST",
      "path": "/api/v1/srs/review",
      "status": 200,
      "ok": true,
      "ms": 101,
      "responseSnippet": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.092410026\"}",
      "error": null,
      "json": {
        "success": true,
        "message": "Đã ghi nhận review",
        "data": {
          "vocabularyId": null,
          "grammarId": null,
          "contentType": null,
          "word": null,
          "pronunciation": null,
          "meaning": null,
          "exampleSentence": null,
          "audioUrl": null,
          "easinessFactor": 2.5,
          "intervalDays": 0,
          "repetitions": 0,
          "nextReviewAt": "2026-05-21",
          "lastReviewedAt": null,
          "overdueDays": null,
          "totalDue": 0,
          "totalReviewedToday": 0,
          "items": []
        },
        "timestamp": "2026-05-21T15:58:35.092410026"
      },
      "text": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.092410026\"}"
    },
    {
      "name": "srs_parallel_review_11",
      "method": "POST",
      "path": "/api/v1/srs/review",
      "status": 200,
      "ok": true,
      "ms": 110,
      "responseSnippet": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.09939619\"}",
      "error": null,
      "json": {
        "success": true,
        "message": "Đã ghi nhận review",
        "data": {
          "vocabularyId": null,
          "grammarId": null,
          "contentType": null,
          "word": null,
          "pronunciation": null,
          "meaning": null,
          "exampleSentence": null,
          "audioUrl": null,
          "easinessFactor": 2.5,
          "intervalDays": 0,
          "repetitions": 0,
          "nextReviewAt": "2026-05-21",
          "lastReviewedAt": null,
          "overdueDays": null,
          "totalDue": 0,
          "totalReviewedToday": 0,
          "items": []
        },
        "timestamp": "2026-05-21T15:58:35.09939619"
      },
      "text": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.09939619\"}"
    },
    {
      "name": "srs_parallel_review_12",
      "method": "POST",
      "path": "/api/v1/srs/review",
      "status": 200,
      "ok": true,
      "ms": 132,
      "responseSnippet": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.124062215\"}",
      "error": null,
      "json": {
        "success": true,
        "message": "Đã ghi nhận review",
        "data": {
          "vocabularyId": null,
          "grammarId": null,
          "contentType": null,
          "word": null,
          "pronunciation": null,
          "meaning": null,
          "exampleSentence": null,
          "audioUrl": null,
          "easinessFactor": 2.5,
          "intervalDays": 0,
          "repetitions": 0,
          "nextReviewAt": "2026-05-21",
          "lastReviewedAt": null,
          "overdueDays": null,
          "totalDue": 0,
          "totalReviewedToday": 0,
          "items": []
        },
        "timestamp": "2026-05-21T15:58:35.124062215"
      },
      "text": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.124062215\"}"
    },
    {
      "name": "srs_parallel_review_13",
      "method": "POST",
      "path": "/api/v1/srs/review",
      "status": 200,
      "ok": true,
      "ms": 101,
      "responseSnippet": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.091467956\"}",
      "error": null,
      "json": {
        "success": true,
        "message": "Đã ghi nhận review",
        "data": {
          "vocabularyId": null,
          "grammarId": null,
          "contentType": null,
          "word": null,
          "pronunciation": null,
          "meaning": null,
          "exampleSentence": null,
          "audioUrl": null,
          "easinessFactor": 2.5,
          "intervalDays": 0,
          "repetitions": 0,
          "nextReviewAt": "2026-05-21",
          "lastReviewedAt": null,
          "overdueDays": null,
          "totalDue": 0,
          "totalReviewedToday": 0,
          "items": []
        },
        "timestamp": "2026-05-21T15:58:35.091467956"
      },
      "text": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.091467956\"}"
    },
    {
      "name": "srs_parallel_review_14",
      "method": "POST",
      "path": "/api/v1/srs/review",
      "status": 200,
      "ok": true,
      "ms": 111,
      "responseSnippet": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.103117682\"}",
      "error": null,
      "json": {
        "success": true,
        "message": "Đã ghi nhận review",
        "data": {
          "vocabularyId": null,
          "grammarId": null,
          "contentType": null,
          "word": null,
          "pronunciation": null,
          "meaning": null,
          "exampleSentence": null,
          "audioUrl": null,
          "easinessFactor": 2.5,
          "intervalDays": 0,
          "repetitions": 0,
          "nextReviewAt": "2026-05-21",
          "lastReviewedAt": null,
          "overdueDays": null,
          "totalDue": 0,
          "totalReviewedToday": 0,
          "items": []
        },
        "timestamp": "2026-05-21T15:58:35.103117682"
      },
      "text": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.103117682\"}"
    },
    {
      "name": "srs_parallel_review_15",
      "method": "POST",
      "path": "/api/v1/srs/review",
      "status": 200,
      "ok": true,
      "ms": 99,
      "responseSnippet": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.090387326\"}",
      "error": null,
      "json": {
        "success": true,
        "message": "Đã ghi nhận review",
        "data": {
          "vocabularyId": null,
          "grammarId": null,
          "contentType": null,
          "word": null,
          "pronunciation": null,
          "meaning": null,
          "exampleSentence": null,
          "audioUrl": null,
          "easinessFactor": 2.5,
          "intervalDays": 0,
          "repetitions": 0,
          "nextReviewAt": "2026-05-21",
          "lastReviewedAt": null,
          "overdueDays": null,
          "totalDue": 0,
          "totalReviewedToday": 0,
          "items": []
        },
        "timestamp": "2026-05-21T15:58:35.090387326"
      },
      "text": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.090387326\"}"
    },
    {
      "name": "srs_parallel_review_16",
      "method": "POST",
      "path": "/api/v1/srs/review",
      "status": 200,
      "ok": true,
      "ms": 143,
      "responseSnippet": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.135787137\"}",
      "error": null,
      "json": {
        "success": true,
        "message": "Đã ghi nhận review",
        "data": {
          "vocabularyId": null,
          "grammarId": null,
          "contentType": null,
          "word": null,
          "pronunciation": null,
          "meaning": null,
          "exampleSentence": null,
          "audioUrl": null,
          "easinessFactor": 2.5,
          "intervalDays": 0,
          "repetitions": 0,
          "nextReviewAt": "2026-05-21",
          "lastReviewedAt": null,
          "overdueDays": null,
          "totalDue": 0,
          "totalReviewedToday": 0,
          "items": []
        },
        "timestamp": "2026-05-21T15:58:35.135787137"
      },
      "text": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.135787137\"}"
    },
    {
      "name": "srs_parallel_review_17",
      "method": "POST",
      "path": "/api/v1/srs/review",
      "status": 200,
      "ok": true,
      "ms": 144,
      "responseSnippet": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.136503255\"}",
      "error": null,
      "json": {
        "success": true,
        "message": "Đã ghi nhận review",
        "data": {
          "vocabularyId": null,
          "grammarId": null,
          "contentType": null,
          "word": null,
          "pronunciation": null,
          "meaning": null,
          "exampleSentence": null,
          "audioUrl": null,
          "easinessFactor": 2.5,
          "intervalDays": 0,
          "repetitions": 0,
          "nextReviewAt": "2026-05-21",
          "lastReviewedAt": null,
          "overdueDays": null,
          "totalDue": 0,
          "totalReviewedToday": 0,
          "items": []
        },
        "timestamp": "2026-05-21T15:58:35.136503255"
      },
      "text": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.136503255\"}"
    },
    {
      "name": "srs_parallel_review_18",
      "method": "POST",
      "path": "/api/v1/srs/review",
      "status": 200,
      "ok": true,
      "ms": 133,
      "responseSnippet": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.124950419\"}",
      "error": null,
      "json": {
        "success": true,
        "message": "Đã ghi nhận review",
        "data": {
          "vocabularyId": null,
          "grammarId": null,
          "contentType": null,
          "word": null,
          "pronunciation": null,
          "meaning": null,
          "exampleSentence": null,
          "audioUrl": null,
          "easinessFactor": 2.5,
          "intervalDays": 0,
          "repetitions": 0,
          "nextReviewAt": "2026-05-21",
          "lastReviewedAt": null,
          "overdueDays": null,
          "totalDue": 0,
          "totalReviewedToday": 0,
          "items": []
        },
        "timestamp": "2026-05-21T15:58:35.124950419"
      },
      "text": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.124950419\"}"
    },
    {
      "name": "srs_parallel_review_19",
      "method": "POST",
      "path": "/api/v1/srs/review",
      "status": 200,
      "ok": true,
      "ms": 145,
      "responseSnippet": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.138513594\"}",
      "error": null,
      "json": {
        "success": true,
        "message": "Đã ghi nhận review",
        "data": {
          "vocabularyId": null,
          "grammarId": null,
          "contentType": null,
          "word": null,
          "pronunciation": null,
          "meaning": null,
          "exampleSentence": null,
          "audioUrl": null,
          "easinessFactor": 2.5,
          "intervalDays": 0,
          "repetitions": 0,
          "nextReviewAt": "2026-05-21",
          "lastReviewedAt": null,
          "overdueDays": null,
          "totalDue": 0,
          "totalReviewedToday": 0,
          "items": []
        },
        "timestamp": "2026-05-21T15:58:35.138513594"
      },
      "text": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.138513594\"}"
    },
    {
      "name": "srs_parallel_review_20",
      "method": "POST",
      "path": "/api/v1/srs/review",
      "status": 200,
      "ok": true,
      "ms": 147,
      "responseSnippet": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.140152825\"}",
      "error": null,
      "json": {
        "success": true,
        "message": "Đã ghi nhận review",
        "data": {
          "vocabularyId": null,
          "grammarId": null,
          "contentType": null,
          "word": null,
          "pronunciation": null,
          "meaning": null,
          "exampleSentence": null,
          "audioUrl": null,
          "easinessFactor": 2.5,
          "intervalDays": 0,
          "repetitions": 0,
          "nextReviewAt": "2026-05-21",
          "lastReviewedAt": null,
          "overdueDays": null,
          "totalDue": 0,
          "totalReviewedToday": 0,
          "items": []
        },
        "timestamp": "2026-05-21T15:58:35.140152825"
      },
      "text": "{\"success\":true,\"message\":\"Đã ghi nhận review\",\"data\":{\"vocabularyId\":null,\"grammarId\":null,\"contentType\":null,\"word\":null,\"pronunciation\":null,\"meaning\":null,\"exampleSentence\":null,\"audioUrl\":null,\"easinessFactor\":2.5,\"intervalDays\":0,\"repetitions\":0,\"nextReviewAt\":\"2026-05-21\",\"lastReviewedAt\":null,\"overdueDays\":null,\"totalDue\":0,\"totalReviewedToday\":0,\"items\":[]},\"timestamp\":\"2026-05-21T15:58:35.140152825\"}"
    }
  ]
}
```

## Screenshots
Placeholder: add browser/API screenshots when reproducing manually.

## Recommended Fix
Add client-visible review version/idempotency key and reject stale duplicate review submissions.

## Regression Risk
Medium; frontend review flow must include the version/idempotency field.
