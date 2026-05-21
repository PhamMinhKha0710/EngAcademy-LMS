# BUG-004: Teacher class-by-student lookup lacks explicit teacher ownership check

- Issue ID: BUG-004
- Severity: Medium
- Risk Level: Medium
- Module: Teacher Authorization
- Tested At: 2026-05-21T09:02:02.052Z

## Steps to Reproduce
1. Login as teacher.
2. GET /api/v1/classes/student/5.

## Expected Result
Teacher can only query students they teach or that belong to an assigned class/school policy.

## Actual Result
Status 200; class list returned by student ID.

## Evidence
{"success":true,"message":"Lấy danh sách lớp học thành công","data":[{"id":1,"name":"Lớp 6A1","academicYear":"2025-2026","isActive":true,"schoolId":2,"schoolName":"Trường THCS Nguyễn Du","teacherId":3,"teacherName":"Nguyễn Thị Hương","studentCount":3,"createdAt":"2026-05-20T16:20:51.50122"},{"id":2,"name":"Lớp 6A2","academicYear":"2025-2026","isActive":true,"schoolId":2,"schoolName":"Trường THCS Nguyễn Du","teacherId":3,"teacherName":"Nguyễn Thị Hương","studentCount":2,"createdAt":"2026-05-20T16:20:51.505378"}],"timestamp":"2026-05-21T16:02:12.770247034"}

## Root Cause Hypothesis
ClassRoomController.getClassRoomsByStudent only restricts ROLE_STUDENT self-access; teacher/admin/school are not scoped in this method.

## Security Impact
Potential cross-class student membership discovery.

## Production Impact
Teacher accounts can enumerate student memberships by ID.

## DB Impact
Read exposure of STUDENT_CLASS and CLASS rows.

## Concurrency Impact
None.

## Logs
```text
{
  "name": "teacher_reads_student_classes_by_id",
  "method": "GET",
  "path": "/api/v1/classes/student/5",
  "status": 200,
  "ok": true,
  "ms": 27,
  "responseSnippet": "{\"success\":true,\"message\":\"Lấy danh sách lớp học thành công\",\"data\":[{\"id\":1,\"name\":\"Lớp 6A1\",\"academicYear\":\"2025-2026\",\"isActive\":true,\"schoolId\":2,\"schoolName\":\"Trường THCS Nguyễn Du\",\"teacherId\":3,\"teacherName\":\"Nguyễn Thị Hương\",\"studentCount\":3,\"createdAt\":\"2026-05-20T16:20:51.50122\"},{\"id\":2,\"name\":\"Lớp 6A2\",\"academicYear\":\"2025-2026\",\"isActive\":true,\"schoolId\":2,\"schoolName\":\"Trường THCS Nguyễn Du\",\"teacherId\":3,\"teacherName\":\"Nguyễn Thị Hương\",\"studentCount\":2,\"createdAt\":\"2026-05-20T16:20:51.505378\"}],\"timestamp\":\"2026-05-21T16:02:12.770247034\"}",
  "error": null,
  "json": {
    "success": true,
    "message": "Lấy danh sách lớp học thành công",
    "data": [
      {
        "id": 1,
        "name": "Lớp 6A1",
        "academicYear": "2025-2026",
        "isActive": true,
        "schoolId": 2,
        "schoolName": "Trường THCS Nguyễn Du",
        "teacherId": 3,
        "teacherName": "Nguyễn Thị Hương",
        "studentCount": 3,
        "createdAt": "2026-05-20T16:20:51.50122"
      },
      {
        "id": 2,
        "name": "Lớp 6A2",
        "academicYear": "2025-2026",
        "isActive": true,
        "schoolId": 2,
        "schoolName": "Trường THCS Nguyễn Du",
        "teacherId": 3,
        "teacherName": "Nguyễn Thị Hương",
        "studentCount": 2,
        "createdAt": "2026-05-20T16:20:51.505378"
      }
    ],
    "timestamp": "2026-05-21T16:02:12.770247034"
  },
  "text": "{\"success\":true,\"message\":\"Lấy danh sách lớp học thành công\",\"data\":[{\"id\":1,\"name\":\"Lớp 6A1\",\"academicYear\":\"2025-2026\",\"isActive\":true,\"schoolId\":2,\"schoolName\":\"Trường THCS Nguyễn Du\",\"teacherId\":3,\"teacherName\":\"Nguyễn Thị Hương\",\"studentCount\":3,\"createdAt\":\"2026-05-20T16:20:51.50122\"},{\"id\":2,\"name\":\"Lớp 6A2\",\"academicYear\":\"2025-2026\",\"isActive\":true,\"schoolId\":2,\"schoolName\":\"Trường THCS Nguyễn Du\",\"teacherId\":3,\"teacherName\":\"Nguyễn Thị Hương\",\"studentCount\":2,\"createdAt\":\"2026-05-20T16:20:51.505378\"}],\"timestamp\":\"2026-05-21T16:02:12.770247034\"}"
}
```

## Screenshots
Placeholder: add browser/API screenshots when reproducing manually.

## Recommended Fix
Add service-level scoping for teacher/school roles on student membership lookups.

## Regression Risk
Medium.
