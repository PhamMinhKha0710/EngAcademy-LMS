# Security – School Scope Authorization (SCHOOL vs ADMIN)

## Mô tả vấn đề

Hệ thống có 2 role liên quan trường học: **ADMIN** (toàn quyền) và **SCHOOL** (chỉ quản lý trường của mình). Cần đảm bảo SCHOOL không truy cập/sửa dữ liệu của trường khác.

Các tài nguyên có scope: User (schoolId), ClassRoom (schoolId), School (id), Exam (qua ClassRoom → school).

## Nguyên nhân

- `@PreAuthorize` chỉ kiểm tra role, không kiểm tra resource-scope.
- Controller/Service không validate `principal.getSchoolId()` vs resource.

## Cách debug

1. Đăng nhập SCHOOL (schoolId = X).
2. Gọi API với resource thuộc trường Y (Y ≠ X).
3. Nếu 200/201 → lỗi bảo mật.

## Giải pháp

**Pattern chung**: Với mọi endpoint mà SCHOOL được gọi:
- Lấy `principal` (UserDetails/User) → `principal.getSchoolId()`.
- Với resource cần kiểm tra: so sánh `resource.getSchoolId()` (hoặc qua relation) với `principal.getSchoolId()`.
- Nếu không khớp → `403 Forbidden` (AccessDeniedException).

**Checklist cho endpoint mới (SCHOOL)**:

| Endpoint type | Kiểm tra |
|---------------|----------|
| GET /resources/school/{schoolId} | schoolId == principal.schoolId |
| POST /resources (body có schoolId) | request.schoolId == principal.schoolId |
| PUT/DELETE /resources/{id} | resource.schoolId == principal.schoolId |
| DELETE /users/{id} | target.schoolId != null && target.schoolId == principal.schoolId |

**Lưu ý**: ADMIN bỏ qua các kiểm tra trên; SCHOOL luôn bị giới hạn.

## Code mẫu (nếu có)

```java
// Helper
private void requireSchoolOwnership(Long principalSchoolId, Long resourceSchoolId) {
    if (principalSchoolId != null && !principalSchoolId.equals(resourceSchoolId)) {
        throw new AccessDeniedException("Forbidden");
    }
}
```

## Bài học rút ra

- Role + resource-scope phải đi cùng khi có multi-tenant.
- Không tin request body: SCHOOL có thể gửi schoolId sai → ép từ principal.

## Cách phòng tránh sau này

1. Khi thêm endpoint cho SCHOOL: áp dụng checklist.
2. Integration test: SCHOOL gọi với resource trường khác → expect 403.
3. Liên quan: [memory/bugs/school-scope-security.md](../bugs/school-scope-security.md)
