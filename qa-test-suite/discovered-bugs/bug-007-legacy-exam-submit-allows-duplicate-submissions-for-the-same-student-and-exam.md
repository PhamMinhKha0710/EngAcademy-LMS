# BUG-007: Legacy exam submit allows duplicate submissions for the same student and exam

- Issue ID: BUG-007
- Severity: Critical
- Risk Level: Critical
- Module: Exam Submission
- Tested At: 2026-05-20T09:40:03.530Z

## Steps to Reproduce
1. Login as a student.
2. POST /api/v1/exams/submit?studentId=4 twice with examId=1.

## Expected Result
Second submit is rejected or idempotently returns the original result.

## Actual Result
Both submits succeeded: statuses 200, 200.

## Evidence
First={"success":true,"message":"Nộp bài kiểm tra thành công","data":{"id":2,"examId":1,"examTitle":"Kiểm tra 15 phút - Unit 1 & 2: School & House","studentId":4,"studentName":"Trần Minh Khoa","score":0,"correctCount":0,"totalQuestions":8,"percentage":0.0,"submittedAt":"2026-05-20T16:40:14.649083522","violationCount":0,"grade":"F"},"timestamp":"2026-05-20T16:40:14.655973861"}
Second={"success":true,"message":"Nộp bài kiểm tra thành công","data":{"id":3,"examId":1,"examTitle":"Kiểm tra 15 phút - Unit 1 & 2: School & House","studentId":4,"studentName":"Trần Minh Khoa","score":0,"correctCount":0,"totalQuestions":8,"percentage":0.0,"submittedAt":"2026-05-20T16:40:14.6917128","violationCount":0,"grade":"F"},"timestamp":"2026-05-20T16:40:14.701289688"}

## Root Cause Hypothesis
EXAM_RESULT has no unique constraint on (exam_id, student_id), and ExamService.submitExam only relies on catching DataIntegrityViolationException.

## Security Impact
Students can submit repeatedly and potentially manipulate attempts/quests/leaderboards.

## Production Impact
Duplicate exam results corrupt teacher reporting and analytics.

## DB Impact
Multiple EXAM_RESULT rows for one exam/student.

## Concurrency Impact
Parallel duplicate submits can create more duplicates under load.

## Logs
```text
{
  "legacy1": {
    "name": "legacy_submit_first_empty",
    "method": "POST",
    "path": "/api/v1/exams/submit?studentId=4",
    "status": 200,
    "ok": true,
    "ms": 26,
    "responseSnippet": "{\"success\":true,\"message\":\"Nộp bài kiểm tra thành công\",\"data\":{\"id\":2,\"examId\":1,\"examTitle\":\"Kiểm tra 15 phút - Unit 1 & 2: School & House\",\"studentId\":4,\"studentName\":\"Trần Minh Khoa\",\"score\":0,\"correctCount\":0,\"totalQuestions\":8,\"percentage\":0.0,\"submittedAt\":\"2026-05-20T16:40:14.649083522\",\"violationCount\":0,\"grade\":\"F\"},\"timestamp\":\"2026-05-20T16:40:14.655973861\"}",
    "error": null,
    "json": {
      "success": true,
      "message": "Nộp bài kiểm tra thành công",
      "data": {
        "id": 2,
        "examId": 1,
        "examTitle": "Kiểm tra 15 phút - Unit 1 & 2: School & House",
        "studentId": 4,
        "studentName": "Trần Minh Khoa",
        "score": 0,
        "correctCount": 0,
        "totalQuestions": 8,
        "percentage": 0,
        "submittedAt": "2026-05-20T16:40:14.649083522",
        "violationCount": 0,
        "grade": "F"
      },
      "timestamp": "2026-05-20T16:40:14.655973861"
    },
    "text": "{\"success\":true,\"message\":\"Nộp bài kiểm tra thành công\",\"data\":{\"id\":2,\"examId\":1,\"examTitle\":\"Kiểm tra 15 phút - Unit 1 & 2: School & House\",\"studentId\":4,\"studentName\":\"Trần Minh Khoa\",\"score\":0,\"correctCount\":0,\"totalQuestions\":8,\"percentage\":0.0,\"submittedAt\":\"2026-05-20T16:40:14.649083522\",\"violationCount\":0,\"grade\":\"F\"},\"timestamp\":\"2026-05-20T16:40:14.655973861\"}"
  },
  "legacy2": {
    "name": "legacy_submit_second_empty",
    "method": "POST",
    "path": "/api/v1/exams/submit?studentId=4",
    "status": 200,
    "ok": true,
    "ms": 45,
    "responseSnippet": "{\"success\":true,\"message\":\"Nộp bài kiểm tra thành công\",\"data\":{\"id\":3,\"examId\":1,\"examTitle\":\"Kiểm tra 15 phút - Unit 1 & 2: School & House\",\"studentId\":4,\"studentName\":\"Trần Minh Khoa\",\"score\":0,\"correctCount\":0,\"totalQuestions\":8,\"percentage\":0.0,\"submittedAt\":\"2026-05-20T16:40:14.6917128\",\"violationCount\":0,\"grade\":\"F\"},\"timestamp\":\"2026-05-20T16:40:14.701289688\"}",
    "error": null,
    "json": {
      "success": true,
      "message": "Nộp bài kiểm tra thành công",
      "data": {
        "id": 3,
        "examId": 1,
        "examTitle": "Kiểm tra 15 phút - Unit 1 & 2: School & House",
        "studentId": 4,
        "studentName": "Trần Minh Khoa",
        "score": 0,
        "correctCount": 0,
        "totalQuestions": 8,
        "percentage": 0,
        "submittedAt": "2026-05-20T16:40:14.6917128",
        "violationCount": 0,
        "grade": "F"
      },
      "timestamp": "2026-05-20T16:40:14.701289688"
    },
    "text": "{\"success\":true,\"message\":\"Nộp bài kiểm tra thành công\",\"data\":{\"id\":3,\"examId\":1,\"examTitle\":\"Kiểm tra 15 phút - Unit 1 & 2: School & House\",\"studentId\":4,\"studentName\":\"Trần Minh Khoa\",\"score\":0,\"correctCount\":0,\"totalQuestions\":8,\"percentage\":0.0,\"submittedAt\":\"2026-05-20T16:40:14.6917128\",\"violationCount\":0,\"grade\":\"F\"},\"timestamp\":\"2026-05-20T16:40:14.701289688\"}"
  }
}
```

## Screenshots
Placeholder: add browser/API screenshots when reproducing manually.

## Recommended Fix
Add an application pre-check plus DB unique/idempotency constraint for submitted results, with a separate in-progress row model if needed.

## Regression Risk
High; migration must handle existing duplicate rows first.
