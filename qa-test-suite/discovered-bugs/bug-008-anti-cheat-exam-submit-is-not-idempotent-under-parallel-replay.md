# BUG-008: Anti-cheat exam submit is not idempotent under parallel replay

- Issue ID: BUG-008
- Severity: Critical
- Risk Level: Critical
- Module: Exam Submission Concurrency
- Tested At: 2026-05-20T09:40:03.530Z

## Steps to Reproduce
1. Start an exam and capture one examResultId.
2. Send 12 parallel POST /submit-anticheat requests with the same examResultId.

## Expected Result
Only one request succeeds; all other concurrent replays receive duplicate/submitted response.

## Actual Result
7 of 12 concurrent submits succeeded.

## Evidence
anti_cheat_parallel_submit_1: 200
anti_cheat_parallel_submit_2: 200
anti_cheat_parallel_submit_3: 500
anti_cheat_parallel_submit_4: 200
anti_cheat_parallel_submit_5: 500
anti_cheat_parallel_submit_6: 500
anti_cheat_parallel_submit_7: 500
anti_cheat_parallel_submit_8: 500
anti_cheat_parallel_submit_9: 200
anti_cheat_parallel_submit_10: 200
anti_cheat_parallel_submit_11: 200
anti_cheat_parallel_submit_12: 200

## Root Cause Hypothesis
submitExamWithAntiCheat checks submittedAt before save without row-level lock, versioning, or idempotency key.

## Security Impact
Replay can double-count quests, notifications, analytics, or scoring side effects.

## Production Impact
Race-condition data corruption during high-latency/mobile retries.

## DB Impact
Same EXAM_RESULT row is updated multiple times and side effects can run repeatedly.

## Concurrency Impact
Confirmed parallel race vulnerability.

## Logs
```text
[
  {
    "name": "anti_cheat_parallel_submit_1",
    "method": "POST",
    "path": "/api/v1/exams/1/submit-anticheat",
    "status": 200,
    "ok": true,
    "ms": 127,
    "responseSnippet": "{\"success\":true,\"message\":\"Nộp bài thành công\",\"data\":{\"id\":1,\"examId\":1,\"examTitle\":\"Kiểm tra 15 phút - Unit 1 & 2: School & House\",\"studentId\":4,\"studentName\":\"Trần Minh Khoa\",\"score\":0,\"correctCount\":0,\"totalQuestions\":8,\"percentage\":0.0,\"grade\":\"F\",\"submittedAt\":\"2026-05-20T16:40:14.791620852\",\"violationCount\":2,\"status\":\"LATE\"},\"timestamp\":\"2026-05-20T16:40:14.828402377\"}",
    "error": null,
    "json": {
      "success": true,
      "message": "Nộp bài thành công",
      "data": {
        "id": 1,
        "examId": 1,
        "examTitle": "Kiểm tra 15 phút - Unit 1 & 2: School & House",
        "studentId": 4,
        "studentName": "Trần Minh Khoa",
        "score": 0,
        "correctCount": 0,
        "totalQuestions": 8,
        "percentage": 0,
        "grade": "F",
        "submittedAt": "2026-05-20T16:40:14.791620852",
        "violationCount": 2,
        "status": "LATE"
      },
      "timestamp": "2026-05-20T16:40:14.828402377"
    },
    "text": "{\"success\":true,\"message\":\"Nộp bài thành công\",\"data\":{\"id\":1,\"examId\":1,\"examTitle\":\"Kiểm tra 15 phút - Unit 1 & 2: School & House\",\"studentId\":4,\"studentName\":\"Trần Minh Khoa\",\"score\":0,\"correctCount\":0,\"totalQuestions\":8,\"percentage\":0.0,\"grade\":\"F\",\"submittedAt\":\"2026-05-20T16:40:14.791620852\",\"violationCount\":2,\"status\":\"LATE\"},\"timestamp\":\"2026-05-20T16:40:14.828402377\"}"
  },
  {
    "name": "anti_cheat_parallel_submit_2",
    "method": "POST",
    "path": "/api/v1/exams/1/submit-anticheat",
    "status": 200,
    "ok": true,
    "ms": 115,
    "responseSnippet": "{\"success\":true,\"message\":\"Nộp bài thành công\",\"data\":{\"id\":1,\"examId\":1,\"examTitle\":\"Kiểm tra 15 phút - Unit 1 & 2: School & House\",\"studentId\":4,\"studentName\":\"Trần Minh Khoa\",\"score\":0,\"correctCount\":0,\"totalQuestions\":8,\"percentage\":0.0,\"grade\":\"F\",\"submittedAt\":\"2026-05-20T16:40:14.787671099\",\"violationCount\":2,\"status\":\"LATE\"},\"timestamp\":\"2026-05-20T16:40:14.818162132\"}",
    "error": null,
    "json": {
      "success": true,
      "message": "Nộp bài thành công",
      "data": {
        "id": 1,
        "examId": 1,
        "examTitle": "Kiểm tra 15 phút - Unit 1 & 2: School & House",
        "studentId": 4,
        "studentName": "Trần Minh Khoa",
        "score": 0,
        "correctCount": 0,
        "totalQuestions": 8,
        "percentage": 0,
        "grade": "F",
        "submittedAt": "2026-05-20T16:40:14.787671099",
        "violationCount": 2,
        "status": "LATE"
      },
      "timestamp": "2026-05-20T16:40:14.818162132"
    },
    "text": "{\"success\":true,\"message\":\"Nộp bài thành công\",\"data\":{\"id\":1,\"examId\":1,\"examTitle\":\"Kiểm tra 15 phút - Unit 1 & 2: School & House\",\"studentId\":4,\"studentName\":\"Trần Minh Khoa\",\"score\":0,\"correctCount\":0,\"totalQuestions\":8,\"percentage\":0.0,\"grade\":\"F\",\"submittedAt\":\"2026-05-20T16:40:14.787671099\",\"violationCount\":2,\"status\":\"LATE\"},\"timestamp\":\"2026-05-20T16:40:14.818162132\"}"
  },
  {
    "name": "anti_cheat_parallel_submit_3",
    "method": "POST",
    "path": "/api/v1/exams/1/submit-anticheat",
    "status": 500,
    "ok": false,
    "ms": 133,
    "responseSnippet": "{\"success\":false,\"message\":\"Bài thi đã được nộp trước đó\",\"timestamp\":\"2026-05-20T16:40:14.833908566\"}",
    "error": null,
    "json": {
      "success": false,
      "message": "Bài thi đã được nộp trước đó",
      "timestamp": "2026-05-20T16:40:14.833908566"
    },
    "text": "{\"success\":false,\"message\":\"Bài thi đã được nộp trước đó\",\"timestamp\":\"2026-05-20T16:40:14.833908566\"}"
  },
  {
    "name": "anti_cheat_parallel_submit_4",
    "method": "POST",
    "path": "/api/v1/exams/1/submit-anticheat",
    "status": 200,
    "ok": true,
    "ms": 112,
    "responseSnippet": "{\"success\":true,\"message\":\"Nộp bài thành công\",\"data\":{\"id\":1,\"examId\":1,\"examTitle\":\"Kiểm tra 15 phút - Unit 1 & 2: School & House\",\"studentId\":4,\"studentName\":\"Trần Minh Khoa\",\"score\":0,\"correctCount\":0,\"totalQuestions\":8,\"percentage\":0.0,\"grade\":\"F\",\"submittedAt\":\"2026-05-20T16:40:14.784454718\",\"violationCount\":2,\"status\":\"LATE\"},\"timestamp\":\"2026-05-20T16:40:14.813743688\"}",
    "error": null,
    "json": {
      "success": true,
      "message": "Nộp bài thành công",
      "data": {
        "id": 1,
        "examId": 1,
        "examTitle": "Kiểm tra 15 phút - Unit 1 & 2: School & House",
        "studentId": 4,
        "studentName": "Trần Minh Khoa",
        "score": 0,
        "correctCount": 0,
        "totalQuestions": 8,
        "percentage": 0,
        "grade": "F",
        "submittedAt": "2026-05-20T16:40:14.784454718",
        "violationCount": 2,
        "status": "LATE"
      },
      "timestamp": "2026-05-20T16:40:14.813743688"
    },
    "text": "{\"success\":true,\"message\":\"Nộp bài thành công\",\"data\":{\"id\":1,\"examId\":1,\"examTitle\":\"Kiểm tra 15 phút - Unit 1 & 2: School & House\",\"studentId\":4,\"studentName\":\"Trần Minh Khoa\",\"score\":0,\"correctCount\":0,\"totalQuestions\":8,\"percentage\":0.0,\"grade\":\"F\",\"submittedAt\":\"2026-05-20T16:40:14.784454718\",\"violationCount\":2,\"status\":\"LATE\"},\"timestamp\":\"2026-05-20T16:40:14.813743688\"}"
  },
  {
    "name": "anti_cheat_parallel_submit_5",
    "method": "POST",
    "path": "/api/v1/exams/1/submit-anticheat",
    "status": 500,
    "ok": false,
    "ms": 133,
    "responseSnippet": "{\"success\":false,\"message\":\"Bài thi đã được nộp trước đó\",\"timestamp\":\"2026-05-20T16:40:14.832439459\"}",
    "error": null,
    "json": {
      "success": false,
      "message": "Bài thi đã được nộp trước đó",
      "timestamp": "2026-05-20T16:40:14.832439459"
    },
    "text": "{\"success\":false,\"message\":\"Bài thi đã được nộp trước đó\",\"timestamp\":\"2026-05-20T16:40:14.832439459\"}"
  },
  {
    "name": "anti_cheat_parallel_submit_6",
    "method": "POST",
    "path": "/api/v1/exams/1/submit-anticheat",
    "status": 500,
    "ok": false,
    "ms": 134,
    "responseSnippet": "{\"success\":false,\"message\":\"Bài thi đã được nộp trước đó\",\"timestamp\":\"2026-05-20T16:40:14.834972381\"}",
    "error": null,
    "json": {
      "success": false,
      "message": "Bài thi đã được nộp trước đó",
      "timestamp": "2026-05-20T16:40:14.834972381"
    },
    "text": "{\"success\":false,\"message\":\"Bài thi đã được nộp trước đó\",\"timestamp\":\"2026-05-20T16:40:14.834972381\"}"
  },
  {
    "name": "anti_cheat_parallel_submit_7",
    "method": "POST",
    "path": "/api/v1/exams/1/submit-anticheat",
    "status": 500,
    "ok": false,
    "ms": 132,
    "responseSnippet": "{\"success\":false,\"message\":\"Bài thi đã được nộp trước đó\",\"timestamp\":\"2026-05-20T16:40:14.83364163\"}",
    "error": null,
    "json": {
      "success": false,
      "message": "Bài thi đã được nộp trước đó",
      "timestamp": "2026-05-20T16:40:14.83364163"
    },
    "text": "{\"success\":false,\"message\":\"Bài thi đã được nộp trước đó\",\"timestamp\":\"2026-05-20T16:40:14.83364163\"}"
  },
  {
    "name": "anti_cheat_parallel_submit_8",
    "method": "POST",
    "path": "/api/v1/exams/1/submit-anticheat",
    "status": 500,
    "ok": false,
    "ms": 135,
    "responseSnippet": "{\"success\":false,\"message\":\"Bài thi đã được nộp trước đó\",\"timestamp\":\"2026-05-20T16:40:14.836106956\"}",
    "error": null,
    "json": {
      "success": false,
      "message": "Bài thi đã được nộp trước đó",
      "timestamp": "2026-05-20T16:40:14.836106956"
    },
    "text": "{\"success\":false,\"message\":\"Bài thi đã được nộp trước đó\",\"timestamp\":\"2026-05-20T16:40:14.836106956\"}"
  },
  {
    "name": "anti_cheat_parallel_submit_9",
    "method": "POST",
    "path": "/api/v1/exams/1/submit-anticheat",
    "status": 200,
    "ok": true,
    "ms": 119,
    "responseSnippet": "{\"success\":true,\"message\":\"Nộp bài thành công\",\"data\":{\"id\":1,\"examId\":1,\"examTitle\":\"Kiểm tra 15 phút - Unit 1 & 2: School & House\",\"studentId\":4,\"studentName\":\"Trần Minh Khoa\",\"score\":0,\"correctCount\":0,\"totalQuestions\":8,\"percentage\":0.0,\"grade\":\"F\",\"submittedAt\":\"2026-05-20T16:40:14.794721697\",\"violationCount\":2,\"status\":\"LATE\"},\"timestamp\":\"2026-05-20T16:40:14.824049256\"}",
    "error": null,
    "json": {
      "success": true,
      "message": "Nộp bài thành công",
      "data": {
        "id": 1,
        "examId": 1,
        "examTitle": "Kiểm tra 15 phút - Unit 1 & 2: School & House",
        "studentId": 4,
        "studentName": "Trần Minh Khoa",
        "score": 0,
        "correctCount": 0,
        "totalQuestions": 8,
        "percentage": 0,
        "grade": "F",
        "submittedAt": "2026-05-20T16:40:14.794721697",
        "violationCount": 2,
        "status": "LATE"
      },
      "timestamp": "2026-05-20T16:40:14.824049256"
    },
    "text": "{\"success\":true,\"message\":\"Nộp bài thành công\",\"data\":{\"id\":1,\"examId\":1,\"examTitle\":\"Kiểm tra 15 phút - Unit 1 & 2: School & House\",\"studentId\":4,\"studentName\":\"Trần Minh Khoa\",\"score\":0,\"correctCount\":0,\"totalQuestions\":8,\"percentage\":0.0,\"grade\":\"F\",\"submittedAt\":\"2026-05-20T16:40:14.794721697\",\"violationCount\":2,\"status\":\"LATE\"},\"timestamp\":\"2026-05-20T16:40:14.824049256\"}"
  },
  {
    "name": "anti_cheat_parallel_submit_10",
    "method": "POST",
    "path": "/api/v1/exams/1/submit-anticheat",
    "status": 200,
    "ok": true,
    "ms": 109,
    "responseSnippet": "{\"success\":true,\"message\":\"Nộp bài thành công\",\"data\":{\"id\":1,\"examId\":1,\"examTitle\":\"Kiểm tra 15 phút - Unit 1 & 2: School & House\",\"studentId\":4,\"studentName\":\"Trần Minh Khoa\",\"score\":0,\"correctCount\":0,\"totalQuestions\":8,\"percentage\":0.0,\"grade\":\"F\",\"submittedAt\":\"2026-05-20T16:40:14.788362219\",\"violationCount\":2,\"status\":\"LATE\"},\"timestamp\":\"2026-05-20T16:40:14.811020519\"}",
    "error": null,
    "json": {
      "success": true,
      "message": "Nộp bài thành công",
      "data": {
        "id": 1,
        "examId": 1,
        "examTitle": "Kiểm tra 15 phút - Unit 1 & 2: School & House",
        "studentId": 4,
        "studentName": "Trần Minh Khoa",
        "score": 0,
        "correctCount": 0,
        "totalQuestions": 8,
        "percentage": 0,
        "grade": "F",
        "submittedAt": "2026-05-20T16:40:14.788362219",
        "violationCount": 2,
        "status": "LATE"
      },
      "timestamp": "2026-05-20T16:40:14.811020519"
    },
    "text": "{\"success\":true,\"message\":\"Nộp bài thành công\",\"data\":{\"id\":1,\"examId\":1,\"examTitle\":\"Kiểm tra 15 phút - Unit 1 & 2: School & House\",\"studentId\":4,\"studentName\":\"Trần Minh Khoa\",\"score\":0,\"correctCount\":0,\"totalQuestions\":8,\"percentage\":0.0,\"grade\":\"F\",\"submittedAt\":\"2026-05-20T16:40:14.788362219\",\"violationCount\":2,\"status\":\"LATE\"},\"timestamp\":\"2026-05-20T16:40:14.811020519\"}"
  },
  {
    "name": "anti_cheat_parallel_submit_11",
    "method": "POST",
    "path": "/api/v1/exams/1/submit-anticheat",
    "status": 200,
    "ok": true,
    "ms": 100,
    "responseSnippet": "{\"success\":true,\"message\":\"Nộp bài thành công\",\"data\":{\"id\":1,\"examId\":1,\"examTitle\":\"Kiểm tra 15 phút - Unit 1 & 2: School & House\",\"studentId\":4,\"studentName\":\"Trần Minh Khoa\",\"score\":0,\"correctCount\":0,\"totalQuestions\":8,\"percentage\":0.0,\"grade\":\"F\",\"submittedAt\":\"2026-05-20T16:40:14.780487403\",\"violationCount\":2,\"status\":\"LATE\"},\"timestamp\":\"2026-05-20T16:40:14.804873607\"}",
    "error": null,
    "json": {
      "success": true,
      "message": "Nộp bài thành công",
      "data": {
        "id": 1,
        "examId": 1,
        "examTitle": "Kiểm tra 15 phút - Unit 1 & 2: School & House",
        "studentId": 4,
        "studentName": "Trần Minh Khoa",
        "score": 0,
        "correctCount": 0,
        "totalQuestions": 8,
        "percentage": 0,
        "grade": "F",
        "submittedAt": "2026-05-20T16:40:14.780487403",
        "violationCount": 2,
        "status": "LATE"
      },
      "timestamp": "2026-05-20T16:40:14.804873607"
    },
    "text": "{\"success\":true,\"message\":\"Nộp bài thành công\",\"data\":{\"id\":1,\"examId\":1,\"examTitle\":\"Kiểm tra 15 phút - Unit 1 & 2: School & House\",\"studentId\":4,\"studentName\":\"Trần Minh Khoa\",\"score\":0,\"correctCount\":0,\"totalQuestions\":8,\"percentage\":0.0,\"grade\":\"F\",\"submittedAt\":\"2026-05-20T16:40:14.780487403\",\"violationCount\":2,\"status\":\"LATE\"},\"timestamp\":\"2026-05-20T16:40:14.804873607\"}"
  },
  {
    "name": "anti_cheat_parallel_submit_12",
    "method": "POST",
    "path": "/api/v1/exams/1/submit-anticheat",
    "status": 200,
    "ok": true,
    "ms": 98,
    "responseSnippet": "{\"success\":true,\"message\":\"Nộp bài thành công\",\"data\":{\"id\":1,\"examId\":1,\"examTitle\":\"Kiểm tra 15 phút - Unit 1 & 2: School & House\",\"studentId\":4,\"studentName\":\"Trần Minh Khoa\",\"score\":0,\"correctCount\":0,\"totalQuestions\":8,\"percentage\":0.0,\"grade\":\"F\",\"submittedAt\":\"2026-05-20T16:40:14.781260485\",\"violationCount\":2,\"status\":\"LATE\"},\"timestamp\":\"2026-05-20T16:40:14.800350529\"}",
    "error": null,
    "json": {
      "success": true,
      "message": "Nộp bài thành công",
      "data": {
        "id": 1,
        "examId": 1,
        "examTitle": "Kiểm tra 15 phút - Unit 1 & 2: School & House",
        "studentId": 4,
        "studentName": "Trần Minh Khoa",
        "score": 0,
        "correctCount": 0,
        "totalQuestions": 8,
        "percentage": 0,
        "grade": "F",
        "submittedAt": "2026-05-20T16:40:14.781260485",
        "violationCount": 2,
        "status": "LATE"
      },
      "timestamp": "2026-05-20T16:40:14.800350529"
    },
    "text": "{\"success\":true,\"message\":\"Nộp bài thành công\",\"data\":{\"id\":1,\"examId\":1,\"examTitle\":\"Kiểm tra 15 phút - Unit 1 & 2: School & House\",\"studentId\":4,\"studentName\":\"Trần Minh Khoa\",\"score\":0,\"correctCount\":0,\"totalQuestions\":8,\"percentage\":0.0,\"grade\":\"F\",\"submittedAt\":\"2026-05-20T16:40:14.781260485\",\"violationCount\":2,\"status\":\"LATE\"},\"timestamp\":\"2026-05-20T16:40:14.800350529\"}"
  }
]
```

## Screenshots
Placeholder: add browser/API screenshots when reproducing manually.

## Recommended Fix
Use pessimistic lock/optimistic @Version on ExamResult, idempotency keys, and side-effect guards.

## Regression Risk
Medium.
