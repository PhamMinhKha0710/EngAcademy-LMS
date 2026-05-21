# BUG-002: Student can read classroom details for a class they are not enrolled in

- Issue ID: BUG-002
- Severity: High
- Risk Level: High
- Module: Classroom Authorization
- Tested At: 2026-05-20T09:40:03.530Z

## Steps to Reproduce
1. Login as student1.
2. GET /api/v1/classes/2 where student1 is not enrolled.

## Expected Result
403 Forbidden or 404 tenant-filtered response.

## Actual Result
Status 200; class details returned.

## Evidence
{"success":true,"message":"Lấy thông tin lớp học thành công","data":{"id":2,"name":"Lớp 6A2","academicYear":"2025-2026","isActive":true,"schoolId":2,"schoolName":"Trường THCS Nguyễn Du","teacherId":3,"teacherName":"Nguyễn Thị Hương","studentCount":2,"createdAt":"2026-05-20T16:20:51.505378"},"timestamp":"2026-05-20T16:40:14.378506745"}

## Root Cause Hypothesis
ClassRoomController.getClassRoomById checks ROLE_SCHOOL tenant only and does not verify student membership.

## Security Impact
IDOR exposing class name, school, teacher, and student count.

## Production Impact
Students can enumerate classrooms and metadata.

## DB Impact
Read exposure of CLASS data.

## Concurrency Impact
None.

## Logs
```text
{
  "student1Classes": {
    "name": "student1_classes",
    "method": "GET",
    "path": "/api/v1/classes/student/4",
    "status": 200,
    "ok": true,
    "ms": 449,
    "responseSnippet": "{\"success\":true,\"message\":\"Lấy danh sách lớp học thành công\",\"data\":[{\"id\":1,\"name\":\"Lớp 6A1\",\"academicYear\":\"2025-2026\",\"isActive\":true,\"schoolId\":2,\"schoolName\":\"Trường THCS Nguyễn Du\",\"teacherId\":3,\"teacherName\":\"Nguyễn Thị Hương\",\"studentCount\":3,\"createdAt\":\"2026-05-20T16:20:51.50122\"}],\"timestamp\":\"2026-05-20T16:40:14.259628464\"}",
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
        }
      ],
      "timestamp": "2026-05-20T16:40:14.259628464"
    },
    "text": "{\"success\":true,\"message\":\"Lấy danh sách lớp học thành công\",\"data\":[{\"id\":1,\"name\":\"Lớp 6A1\",\"academicYear\":\"2025-2026\",\"isActive\":true,\"schoolId\":2,\"schoolName\":\"Trường THCS Nguyễn Du\",\"teacherId\":3,\"teacherName\":\"Nguyễn Thị Hương\",\"studentCount\":3,\"createdAt\":\"2026-05-20T16:20:51.50122\"}],\"timestamp\":\"2026-05-20T16:40:14.259628464\"}"
  },
  "student2Classes": {
    "name": "student2_classes_as_student2",
    "method": "GET",
    "path": "/api/v1/classes/student/5",
    "status": 200,
    "ok": true,
    "ms": 32,
    "responseSnippet": "{\"success\":true,\"message\":\"Lấy danh sách lớp học thành công\",\"data\":[{\"id\":1,\"name\":\"Lớp 6A1\",\"academicYear\":\"2025-2026\",\"isActive\":true,\"schoolId\":2,\"schoolName\":\"Trường THCS Nguyễn Du\",\"teacherId\":3,\"teacherName\":\"Nguyễn Thị Hương\",\"studentCount\":3,\"createdAt\":\"2026-05-20T16:20:51.50122\"},{\"id\":2,\"name\":\"Lớp 6A2\",\"academicYear\":\"2025-2026\",\"isActive\":true,\"schoolId\":2,\"schoolName\":\"Trường THCS Nguyễn Du\",\"teacherId\":3,\"teacherName\":\"Nguyễn Thị Hương\",\"studentCount\":2,\"createdAt\":\"2026-05-20T16:20:51.505378\"}],\"timestamp\":\"2026-05-20T16:40:14.354316413\"}",
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
      "timestamp": "2026-05-20T16:40:14.354316413"
    },
    "text": "{\"success\":true,\"message\":\"Lấy danh sách lớp học thành công\",\"data\":[{\"id\":1,\"name\":\"Lớp 6A1\",\"academicYear\":\"2025-2026\",\"isActive\":true,\"schoolId\":2,\"schoolName\":\"Trường THCS Nguyễn Du\",\"teacherId\":3,\"teacherName\":\"Nguyễn Thị Hương\",\"studentCount\":3,\"createdAt\":\"2026-05-20T16:20:51.50122\"},{\"id\":2,\"name\":\"Lớp 6A2\",\"academicYear\":\"2025-2026\",\"isActive\":true,\"schoolId\":2,\"schoolName\":\"Trường THCS Nguyễn Du\",\"teacherId\":3,\"teacherName\":\"Nguyễn Thị Hương\",\"studentCount\":2,\"createdAt\":\"2026-05-20T16:20:51.505378\"}],\"timestamp\":\"2026-05-20T16:40:14.354316413\"}"
  },
  "directClass": {
    "name": "student1_reads_unenrolled_class",
    "method": "GET",
    "path": "/api/v1/classes/2",
    "status": 200,
    "ok": true,
    "ms": 24,
    "responseSnippet": "{\"success\":true,\"message\":\"Lấy thông tin lớp học thành công\",\"data\":{\"id\":2,\"name\":\"Lớp 6A2\",\"academicYear\":\"2025-2026\",\"isActive\":true,\"schoolId\":2,\"schoolName\":\"Trường THCS Nguyễn Du\",\"teacherId\":3,\"teacherName\":\"Nguyễn Thị Hương\",\"studentCount\":2,\"createdAt\":\"2026-05-20T16:20:51.505378\"},\"timestamp\":\"2026-05-20T16:40:14.378506745\"}",
    "error": null,
    "json": {
      "success": true,
      "message": "Lấy thông tin lớp học thành công",
      "data": {
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
      },
      "timestamp": "2026-05-20T16:40:14.378506745"
    },
    "text": "{\"success\":true,\"message\":\"Lấy thông tin lớp học thành công\",\"data\":{\"id\":2,\"name\":\"Lớp 6A2\",\"academicYear\":\"2025-2026\",\"isActive\":true,\"schoolId\":2,\"schoolName\":\"Trường THCS Nguyễn Du\",\"teacherId\":3,\"teacherName\":\"Nguyễn Thị Hương\",\"studentCount\":2,\"createdAt\":\"2026-05-20T16:20:51.505378\"},\"timestamp\":\"2026-05-20T16:40:14.378506745\"}"
  }
}
```

## Screenshots
Placeholder: add browser/API screenshots when reproducing manually.

## Recommended Fix
For ROLE_STUDENT, verify active enrollment before returning classroom details.

## Regression Risk
Medium; frontend may currently rely on broad class reads.
