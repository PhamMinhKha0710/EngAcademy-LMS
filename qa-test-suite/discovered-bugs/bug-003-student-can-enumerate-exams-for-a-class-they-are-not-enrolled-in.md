# BUG-003: Student can enumerate exams for a class they are not enrolled in

- Issue ID: BUG-003
- Severity: Critical
- Risk Level: Critical
- Module: Exam Authorization
- Tested At: 2026-05-20T09:40:03.530Z

## Steps to Reproduce
1. Login as student1.
2. GET /api/v1/exams/class/2.

## Expected Result
403 Forbidden unless the student is actively enrolled in the class.

## Actual Result
Status 200; endpoint accepted the request.

## Evidence
{"success":true,"message":"Lấy danh sách bài kiểm tra thành công","data":{"content":[],"pageable":{"pageNumber":0,"pageSize":20,"sort":{"sorted":false,"unsorted":true,"empty":true},"offset":0,"paged":true,"unpaged":false},"totalElements":0,"totalPages":0,"last":true,"size":20,"number":0,"sort":{"sorted":false,"unsorted":true,"empty":true},"numberOfElements":0,"first":true,"empty":true},"timestamp":"2026-05-20T16:40:14.41178325"}

## Root Cause Hypothesis
ExamController.getExamsByClass permits ROLE_STUDENT but performs no student membership or school check.

## Security Impact
Potential exam metadata and schedule leakage across classrooms.

## Production Impact
Students can discover exams outside their class and prepare attacks against exam IDs.

## DB Impact
Read exposure of EXAM rows.

## Concurrency Impact
None directly.

## Logs
```text
{
  "name": "student1_reads_unenrolled_class_exams",
  "method": "GET",
  "path": "/api/v1/exams/class/2",
  "status": 200,
  "ok": true,
  "ms": 36,
  "responseSnippet": "{\"success\":true,\"message\":\"Lấy danh sách bài kiểm tra thành công\",\"data\":{\"content\":[],\"pageable\":{\"pageNumber\":0,\"pageSize\":20,\"sort\":{\"sorted\":false,\"unsorted\":true,\"empty\":true},\"offset\":0,\"paged\":true,\"unpaged\":false},\"totalElements\":0,\"totalPages\":0,\"last\":true,\"size\":20,\"number\":0,\"sort\":{\"sorted\":false,\"unsorted\":true,\"empty\":true},\"numberOfElements\":0,\"first\":true,\"empty\":true},\"timestamp\":\"2026-05-20T16:40:14.41178325\"}",
  "error": null,
  "json": {
    "success": true,
    "message": "Lấy danh sách bài kiểm tra thành công",
    "data": {
      "content": [],
      "pageable": {
        "pageNumber": 0,
        "pageSize": 20,
        "sort": {
          "sorted": false,
          "unsorted": true,
          "empty": true
        },
        "offset": 0,
        "paged": true,
        "unpaged": false
      },
      "totalElements": 0,
      "totalPages": 0,
      "last": true,
      "size": 20,
      "number": 0,
      "sort": {
        "sorted": false,
        "unsorted": true,
        "empty": true
      },
      "numberOfElements": 0,
      "first": true,
      "empty": true
    },
    "timestamp": "2026-05-20T16:40:14.41178325"
  },
  "text": "{\"success\":true,\"message\":\"Lấy danh sách bài kiểm tra thành công\",\"data\":{\"content\":[],\"pageable\":{\"pageNumber\":0,\"pageSize\":20,\"sort\":{\"sorted\":false,\"unsorted\":true,\"empty\":true},\"offset\":0,\"paged\":true,\"unpaged\":false},\"totalElements\":0,\"totalPages\":0,\"last\":true,\"size\":20,\"number\":0,\"sort\":{\"sorted\":false,\"unsorted\":true,\"empty\":true},\"numberOfElements\":0,\"first\":true,\"empty\":true},\"timestamp\":\"2026-05-20T16:40:14.41178325\"}"
}
```

## Screenshots
Placeholder: add browser/API screenshots when reproducing manually.

## Recommended Fix
For students, require active StudentClass membership for classId before returning exams.

## Regression Risk
Medium.
