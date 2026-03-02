# [Backend] User do SCHOOL tạo thiếu school_id

## Mô tả vấn đề

Khi user có role SCHOOL gọi `POST /users` để tạo học sinh hoặc giáo viên mới, user được tạo không có `school_id`. Kết quả:
- User không xuất hiện trong `GET /users` khi SCHOOL gọi (backend lọc theo `user.school`).
- Logic nghiệp vụ sai: học sinh/giáo viên phải thuộc trường, nhưng DB ghi null.

## Nguyên nhân

- `CreateUserRequest` không có trường `schoolId` (hoặc có nhưng không được xử lý).
- `UserController.createUser()` không ép `schoolId = principal.getSchoolId()` khi caller là SCHOOL.
- `UserService.createUser()` không set `user.setSchool(school)` từ schoolId trong request.

## Cách debug

1. Đăng nhập SCHOOL, gọi `POST /users` với body tạo student/teacher.
2. Kiểm tra DB: `SELECT id, username, school_id FROM user WHERE id = ?` → school_id = null.
3. Gọi `GET /users` với cùng token SCHOOL → user vừa tạo không xuất hiện.
4. Trace code: `UserService.createUser()` có gọi `user.setSchool(...)` không.

## Giải pháp

1. Thêm `schoolId` (optional) vào `CreateUserRequest`.
2. Trong `UserController.createUser()`: nếu principal có role SCHOOL thì ép `schoolId = principal.getSchoolId()` (bỏ qua giá trị từ request nếu có).
3. Trong `UserService.createUser()`: nếu request có schoolId thì `user.setSchool(schoolRepository.findById(schoolId).orElseThrow(...))`.
4. ADMIN: có thể truyền schoolId tùy ý hoặc null.

## Code mẫu (nếu có)

```java
// UserController
@PostMapping("/users")
public ResponseEntity<?> createUser(@RequestBody CreateUserRequest request, Principal principal) {
    if (hasRole(principal, "SCHOOL")) {
        request.setSchoolId(getPrincipalSchoolId(principal)); // ép schoolId
    }
    return ResponseEntity.ok(userService.createUser(request));
}

// UserService
public User createUser(CreateUserRequest request) {
    User user = new User();
    // ... set fields
    if (request.getSchoolId() != null) {
        School school = schoolRepository.findById(request.getSchoolId())
            .orElseThrow(() -> new ResourceNotFoundException("School", request.getSchoolId()));
        user.setSchool(school);
    }
    return userRepository.save(user);
}
```

## Bài học rút ra

- Khi role có scope (SCHOOL), mọi resource tạo bởi role đó phải gán scope (schoolId) tự động.
- Không dựa vào client gửi schoolId: client có thể gửi sai, cần override từ principal.

## Cách phòng tránh sau này

1. Khi thêm endpoint tạo resource cho SCHOOL: luôn set `schoolId = principal.getSchoolId()`.
2. Test: tạo user qua SCHOOL → verify `user.schoolId` trong DB.
3. Document trong spec: "SCHOOL tạo user → schoolId bắt buộc = trường của SCHOOL."
