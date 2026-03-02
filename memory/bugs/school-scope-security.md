# [Security] SCHOOL có thể truy cập dữ liệu của trường khác

## Mô tả vấn đề

User có role SCHOOL có thể thực hiện các thao tác vượt quyền trên dữ liệu của trường khác:

1. **GET /classes/school/{schoolId}**: Xem danh sách lớp của trường khác
2. **POST /classes**: Tạo lớp cho trường khác (gửi schoolId bất kỳ)
3. **PUT /classes/{id}**, **DELETE /classes/{id}**: Sửa/xóa lớp thuộc trường khác
4. **DELETE /users/{id}**: Xóa user của trường khác hoặc ADMIN

Hậu quả: lộ thông tin nhạy cảm, phá hoại dữ liệu cross-school.

## Nguyên nhân

- `@PreAuthorize("hasRole('ADMIN') or hasRole('SCHOOL')")` chỉ kiểm tra **role**, không kiểm tra **schoolId** của resource.
- Controller/Service không validate `principal.getSchoolId().equals(resourceSchoolId)` trước khi thực thi.
- Authorization ở tầng method thiếu logic resource-scope.

## Cách debug

1. Đăng nhập với tài khoản SCHOOL (có schoolId = X).
2. Gọi API với schoolId hoặc resourceId thuộc trường khác (Y):
   - `GET /classes/school/Y`
   - `POST /classes` body: `{ "schoolId": Y, ... }`
   - `DELETE /users/{userId}` với user thuộc trường Y
3. Nếu request thành công (200/201) → bug tồn tại.
4. Kiểm tra controller: tìm `@PreAuthorize` và xem có kiểm tra schoolId không.

## Giải pháp

Thêm kiểm tra school-scope trong controller hoặc service:

**GET /classes/school/{schoolId}:**
```java
if (principal has role SCHOOL && !schoolId.equals(principal.getSchoolId())) {
    throw new AccessDeniedException("Forbidden");
}
```

**POST /classes:**
```java
if (principal has role SCHOOL && !request.getSchoolId().equals(principal.getSchoolId())) {
    return ResponseEntity.status(403).build();
}
```

**PUT/DELETE /classes/{id}:**
```java
ClassRoom classRoom = classRoomService.findById(id);
if (principal has role SCHOOL && !classRoom.getSchool().getId().equals(principal.getSchoolId())) {
    return ResponseEntity.status(403).build();
}
```

**DELETE /users/{id}:**
```java
User target = userService.findById(id);
if (principal has role SCHOOL) {
    if (target.getSchoolId() == null || !target.getSchoolId().equals(principal.getSchoolId())) {
        return ResponseEntity.status(403).build();
    }
}
```

## Code mẫu (nếu có)

Vị trí: `BackEnd/.../ClassRoomController.java`, `UserController.java`

Pattern chung:
```java
@PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL')")
public ResponseEntity<?> deleteUser(@PathVariable Long id, Principal principal) {
    User principalUser = getCurrentUser(principal);
    if (principalUser.getRole() == Role.SCHOOL) {
        User target = userService.findById(id);
        if (target.getSchool() == null || !target.getSchool().getId().equals(principalUser.getSchool().getId())) {
            throw new AccessDeniedException("Cannot delete user of another school");
        }
    }
    // ... proceed
}
```

## Bài học rút ra

- Role-based + resource-scope phải đi cùng nhau khi có multi-tenant (multi-school).
- Không tin request body: SCHOOL có thể gửi schoolId khác, cần ép `schoolId = principal.getSchoolId()` khi tạo resource.

## Cách phòng tránh sau này

1. Khi thêm endpoint mới cho role SCHOOL: luôn kiểm tra `principal.getSchoolId()` vs resource.
2. Tạo checklist: "SCHOOL chỉ được thao tác resource có schoolId = principal.schoolId".
3. Viết integration test: SCHOOL gọi API với resource trường khác → expect 403.
4. Xem thêm: [memory/security/school-scope-authorization.md](../security/school-scope-authorization.md)
