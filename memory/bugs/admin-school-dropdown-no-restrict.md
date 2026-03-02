# [Admin] SCHOOL có thể chọn trường khác khi tạo lớp

## Mô tả vấn đề

Trong ClassRoomsPage, khi user SCHOOL mở dialog "Thêm lớp học", dropdown "Trường học" hiển thị tất cả trường (từ `GET /schools`). SCHOOL có thể chọn trường khác và tạo lớp cho trường đó. Đây là lỗi security + UX:
- Nếu backend chưa chặn: có thể tạo lớp cho trường khác.
- Nếu backend đã chặn: request 403 nhưng UX gây nhầm lẫn (dropdown cho phép chọn nhưng submit fail).

## Nguyên nhân

- ClassRoomsPage fetch dropdown trường cho mọi role, không phân biệt SCHOOL vs ADMIN.
- Form không lock `schoolId = me.schoolId` khi user là SCHOOL.
- UI không ẩn/disable dropdown trường cho SCHOOL.

## Cách debug

1. Đăng nhập với tài khoản SCHOOL.
2. Vào Lớp học → Thêm lớp học.
3. Kiểm tra dropdown "Trường học": có hiển thị nhiều trường không.
4. Chọn trường khác, submit → xem backend có chặn không.

## Giải pháp

1. Khi user có role SCHOOL: không hiển thị dropdown trường, tự set `form.schoolId = me.schoolId` và disable/ẩn field.
2. Hoặc: chỉ hiển thị 1 trường (trường của user) trong dropdown.
3. ADMIN: giữ nguyên dropdown tất cả trường.

Phụ thuộc: Backend Issue 2 (chặn SCHOOL tạo lớp cho trường khác) nên làm song song.

## Code mẫu (nếu có)

```tsx
// ClassRoomsPage - logic form
const { me, isSchool } = useAuth()

useEffect(() => {
  if (isSchool && me?.schoolId) {
    form.setValue('schoolId', me.schoolId)
  }
}, [isSchool, me?.schoolId])

// Render: ẩn dropdown cho SCHOOL
{!isSchool && (
  <Select
    value={form.watch('schoolId')}
    onValueChange={(v) => form.setValue('schoolId', v)}
    options={schools}
  />
)}
{isSchool && <p>Trường: {me?.schoolName}</p>}
```

## Bài học rút ra

- UI phải phản ánh quyền: không cho phép chọn option mà user không được dùng.
- Defense in depth: Frontend ẩn/lock + Backend validate.

## Cách phòng tránh sau này

1. Khi có role có scope (SCHOOL): kiểm tra tất cả form có field scope (schoolId) không.
2. Pattern: `isScopeRestricted ? lockField(scope) : showDropdown()`.
3. Xem thêm: [memory/security/school-scope-authorization.md](../security/school-scope-authorization.md)
