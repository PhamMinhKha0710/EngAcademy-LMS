# GitHub Issue – Các bug phát hiện trên nhánh feature/admin-school-scope-and-grades

Dùng nội dung dưới đây để tạo issues trên GitHub. Copy từng block vào **New Issue**.

**Nhánh:** `feature/admin-school-scope-and-grades`

---

## Issue 1: [Security] SCHOOL có thể xem lớp của trường khác

**Title:** `fix(security): restrict SCHOOL to GET /classes/school/{schoolId} only for own school`

**Labels:** `backend`, `bug`, `security`

**Description:**

```markdown
## Mô tả
User có role SCHOOL có thể gọi `GET /classes/school/{schoolId}` với `schoolId` khác trường của mình và lấy danh sách lớp của trường đó.

## Vị trí
- `ClassRoomController.java` – endpoint `GET /classes/school/{schoolId}`

## Yêu cầu
- Khi principal có role SCHOOL: kiểm tra `schoolId.equals(principal.getSchoolId())`
- Nếu không khớp → trả về `403 Forbidden`
- ADMIN và TEACHER: giữ nguyên (có thể xem lớp mọi trường)

## Checklist
- [ ] Thêm UserDetails/principal vào method
- [ ] Kiểm tra role SCHOOL và so sánh schoolId
- [ ] Trả 403 khi không hợp lệ
```

---

## Issue 2: [Security] SCHOOL có thể tạo lớp cho trường khác

**Title:** `fix(security): restrict SCHOOL to create classes only for own school`

**Labels:** `backend`, `bug`, `security`

**Description:**

```markdown
## Mô tả
User có role SCHOOL có thể gọi `POST /classes` với `schoolId` khác trường của mình và tạo lớp cho trường khác.

## Vị trí
- `ClassRoomController.java` – `POST /classes`
- `ClassRoomService.createClassRoom()` – không kiểm tra quyền

## Yêu cầu
- Trong controller hoặc service: nếu principal có role SCHOOL, kiểm tra `request.getSchoolId().equals(principal.getSchoolId())`
- Nếu không khớp → `403 Forbidden`
- ADMIN: được tạo lớp cho mọi trường

## Checklist
- [ ] Lấy schoolId của principal
- [ ] Thêm kiểm tra trước khi gọi createClassRoom
- [ ] Trả 403 khi SCHOOL gửi schoolId khác
```

---

## Issue 3: [Security] SCHOOL có thể sửa/xóa lớp của trường khác

**Title:** `fix(security): restrict SCHOOL to update/delete only classes of own school`

**Labels:** `backend`, `bug`, `security`

**Description:**

```markdown
## Mô tả
User có role SCHOOL có thể gọi `PUT /classes/{id}` và `DELETE /classes/{id}` cho lớp thuộc trường khác.

## Vị trí
- `ClassRoomController.java` – `PUT /classes/{id}`, `DELETE /classes/{id}`

## Yêu cầu
- Với SCHOOL: lấy class theo id → kiểm tra `class.getSchool().getId().equals(principal.getSchoolId())`
- Nếu không khớp → `403 Forbidden`
- ADMIN: giữ nguyên (sửa/xóa mọi lớp)

## Checklist
- [ ] PUT: kiểm tra class.schoolId = principal.schoolId
- [ ] DELETE: kiểm tra tương tự
- [ ] Trả 403 khi không hợp lệ
```

---

## Issue 4: [Security] SCHOOL có thể xóa user của trường khác

**Title:** `fix(security): restrict SCHOOL to delete only users of own school`

**Labels:** `backend`, `bug`, `security`

**Description:**

```markdown
## Mô tả
User có role SCHOOL có thể gọi `DELETE /users/{id}` để xóa bất kỳ user nào, kể cả user thuộc trường khác hoặc ADMIN.

## Vị trí
- `UserController.java` – `DELETE /users/{id}`

## Hiện trạng
- Chỉ có `@PreAuthorize("hasRole('ADMIN') or hasRole('SCHOOL')")` – không kiểm tra schoolId

## Yêu cầu
- Nếu principal có role SCHOOL: lấy user cần xóa → kiểm tra `user.getSchoolId() != null && user.getSchoolId().equals(principal.getSchoolId())`
- Nếu user.schoolId = null (vd: ADMIN) hoặc khác trường → `403 Forbidden`
- ADMIN: giữ nguyên (xóa mọi user)

## Checklist
- [ ] Lấy currentUser và target user
- [ ] Thêm kiểm tra schoolId cho SCHOOL
- [ ] Trả 403 khi không hợp lệ
```

---

## Issue 5: [Backend] User do SCHOOL tạo thiếu school_id

**Title:** `fix(backend): set schoolId when SCHOOL creates user (student/teacher)`

**Labels:** `backend`, `bug`

**Description:**

```markdown
## Mô tả
Khi user có role SCHOOL gọi `POST /users` để tạo học sinh hoặc giáo viên mới, user được tạo không có `school_id`. Kết quả: không xuất hiện trong `GET /users` khi SCHOOL gọi (vì backend lọc theo `user.school`).

## Vị trí
- `UserService.createUser()`
- `CreateUserRequest` – không có trường `schoolId`

## Yêu cầu
1. Thêm `schoolId` (optional) vào `CreateUserRequest`
2. Trong `UserController.createUser()`: nếu principal có role SCHOOL thì ép `schoolId = principal.getSchoolId()` (bỏ qua giá trị từ request nếu có)
3. Trong `UserService.createUser()`: nếu request có schoolId thì set `user.setSchool(school)` tương ứng
4. ADMIN: có thể truyền schoolId tùy ý hoặc null

## Checklist
- [ ] CreateUserRequest có schoolId (optional)
- [ ] Controller: SCHOOL luôn dùng schoolId của mình
- [ ] Service: set user.school khi có schoolId
```

---

## Issue 6: [Frontend] SettingsPage hiển thị tên trường hardcode

**Title:** `fix(admin): remove hardcoded school name fallback in SettingsPage`

**Labels:** `frontend`, `admin`, `bug`

**Description:**

```markdown
## Mô tả
Trong trang Cài đặt, khi hiển thị trường học liên kết, code dùng fallback `'Chu Van An High School'` nếu `user.schoolName` rỗng. Điều này hiển thị sai tên trường.

## Vị trí
- `Admin/src/features/settings/SettingsPage.tsx` dòng ~181

## Mã hiện tại
```tsx
{user.schoolName || 'Chu Van An High School'}
```

## Yêu cầu
- Thay bằng `user.schoolName || '—'` hoặc `user.schoolName || 'Không có'`
- Không hardcode tên trường

## Checklist
- [ ] Xóa fallback 'Chu Van An High School'
- [ ] Dùng giá trị mặc định trung tính (— hoặc Không có)
```

---

## Issue 7: [Frontend] SCHOOL có thể chọn trường khác khi tạo lớp

**Title:** `fix(admin): restrict school dropdown for SCHOOL role when creating class`

**Labels:** `frontend`, `admin`, `bug`, `security`

**Description:**

```markdown
## Mô tả
Trong ClassRoomsPage, khi user SCHOOL mở dialog "Thêm lớp học", dropdown "Trường học" hiển thị tất cả trường (từ `GET /schools`). SCHOOL có thể chọn trường khác và tạo lớp cho trường đó (nếu backend chưa chặn).

## Vị trí
- `Admin/src/features/classrooms/ClassRoomsPage.tsx` – fetchDropdownData(), form tạo/sửa lớp

## Yêu cầu
1. Khi user có role SCHOOL: không hiển thị dropdown trường, tự set `form.schoolId = me.schoolId` và disable/ẩn field
2. Hoặc: chỉ hiển thị 1 trường (trường của user) trong dropdown
3. ADMIN: giữ nguyên dropdown tất cả trường

## Phụ thuộc
- Backend Issue 2 (chặn SCHOOL tạo lớp cho trường khác) nên làm song song

## Checklist
- [ ] Phát hiện role SCHOOL trong ClassRoomsPage
- [ ] Lock schoolId = me.schoolId khi SCHOOL
- [ ] Ẩn hoặc disable dropdown trường cho SCHOOL
```

---

## Issue 8: [Frontend] Thiếu phân trang/size khi gọi API danh sách

**Title:** `fix(admin): add pagination params when fetching users and classes`

**Labels:** `frontend`, `admin`, `bug`

**Description:**

```markdown
## Mô tả
Các trang StudentsPage, TeachersPage gọi `GET /users` không truyền `size`; ClassRoomsPage khi SCHOOL gọi `GET /classes/school/{schoolId}` cũng không truyền `size`. Spring mặc định `size=20` nên chỉ trả về 20 bản ghi đầu → thiếu dữ liệu khi có nhiều user/lớp.

## Vị trí
- `StudentsPage.tsx` – fetchStudents()
- `TeachersPage.tsx` – fetchTeachers()
- `ClassRoomsPage.tsx` – fetchRooms() (khi dùng `/classes/school/{id}`)

## Yêu cầu
1. StudentsPage, TeachersPage: thêm `params: { page: 0, size: 200 }` (hoặc giá trị phù hợp)
2. ClassRoomsPage: khi gọi `/classes/school/{schoolId}` thêm `params: { size: 200 }` nếu cần lấy hết
3. (Tùy chọn) Triển khai phân trang phía UI nếu danh sách rất dài

## Checklist
- [ ] GET /users: thêm size
- [ ] GET /classes/school/{id}: thêm size
- [ ] Test với >20 bản ghi
```

---

## Thứ tự đề xuất

1. **Bảo mật (ưu tiên cao):** Issue 1, 2, 3, 4, 7  
2. **Logic/Data:** Issue 5  
3. **UI/UX:** Issue 6, 8  

## Liên quan

- Spec: [docs/github-issues-admin-school-scope-grades.md](./github-issues-admin-school-scope-grades.md)
