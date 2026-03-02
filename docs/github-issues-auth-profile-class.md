# GitHub Issues - Auth, Profile & Class Students

Dùng nội dung dưới đây để tạo issues trên GitHub. Copy từng block vào **New Issue**.

---

## Issue 1: [Backend] Forgot Password / Reset Password (1.1)

**Title:** `feat(auth): implement forgot password and reset password API`

**Labels:** `backend`, `enhancement`, `auth`

**Description:**

```markdown
## Mô tả
Triển khai API quên mật khẩu và đặt lại mật khẩu cho người dùng.

## Hiện trạng
- `AuthController` hiện chỉ có `register`, `login`, `refresh-token`, `logout`
- Chưa có endpoint cho chức năng "quên mật khẩu"

## Yêu cầu

### Endpoint 1: `POST /api/v1/auth/forgot-password`
- Nhận email của người dùng
- Gửi link hoặc mã đặt lại mật khẩu đến email đó

### Endpoint 2: `POST /api/v1/auth/reset-password`
- Nhận token/mã đặt lại và mật khẩu mới
- Validate token, cập nhật mật khẩu

### Hạ tầng cần thêm
- **Email Service:** SMTP hoặc SendGrid/Mailgun để gửi link reset
- **Entity/DTO:** Bảng `password_reset_token` (hoặc tương đương) để lưu token, thời hạn, trạng thái đã dùng

## Checklist

- [ ] (1) Cấu hình email + EmailService
- [ ] (2) Entity `PasswordResetToken` + Repository
- [ ] (3) AuthService logic forgot/reset + 2 endpoint trong AuthController
```

---

## Issue 2: [Backend] Đổi mật khẩu (user đã đăng nhập) (1.2)

**Title:** `feat(api): add change password endpoint for logged-in users`

**Labels:** `backend`, `enhancement`, `auth`

**Description:**

```markdown
## Mô tả
Cho phép user đã đăng nhập đổi mật khẩu.

## Hiện trạng
- `UserController` có `PATCH /users/me` cho `fullName`, `avatarUrl`
- Không có chức năng đổi mật khẩu
- `userApi.ts`: "Backend chưa có API đổi mật khẩu"

## Yêu cầu

### Endpoint: `PATCH /api/v1/users/me/password` (hoặc PUT)
- Body: `currentPassword`, `newPassword`

### UserService logic
1. Kiểm tra `currentPassword` đúng
2. Mã hóa `newPassword`
3. Cập nhật mật khẩu user

### Phân quyền
- Chỉ user đã đăng nhập (có JWT hợp lệ)

## Checklist

- [ ] Endpoint PATCH /users/me/password
- [ ] UserService.changePassword với validation
- [ ] Security config (nếu cần)
```

---

## Issue 3: [Backend] API danh sách học sinh theo lớp (1.3)

**Title:** `feat(api): add GET /classes/{classId}/students endpoint`

**Labels:** `backend`, `enhancement`, `api`

**Description:**

```markdown
## Mô tả
Lấy danh sách học sinh của một lớp học.

## Hiện trạng
- `ClassRoomController` chỉ có POST/DELETE `/{classId}/students/{studentId}`
- Không có endpoint GET danh sách học sinh
- `StudentClassRepository` đã có `findActiveStudentsByClassId(Long classId)`

## Yêu cầu

### Endpoint: `GET /api/v1/classes/{classId}/students`
- Trả về danh sách học sinh: `id`, `username`, `fullName`, `email`, v.v.

### Service
- Gọi `findActiveStudentsByClassId`
- Map sang DTO (`StudentBasicResponse` hoặc `UserResponse`)

### Phân quyền
- `@PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL', 'TEACHER')")`

## Checklist

- [ ] Endpoint GET /classes/{classId}/students
- [ ] ClassRoomService logic + DTO mapping
- [ ] @PreAuthorize phù hợp
```

---

## Issue 4: [Frontend] Trang Quên mật khẩu (2.1)

**Title:** `feat(frontend): connect Forgot Password and Reset Password pages to backend`

**Labels:** `frontend`, `enhancement`, `auth`

**Description:**

```markdown
## Mô tả
Nối trang Quên mật khẩu và trang Đặt lại mật khẩu với API backend.

## Hiện trạng
- `ForgotPassword.tsx` chỉ gửi form và hiển thị màn hình giả "Kiểm tra email"
- Comment: "Chưa có API backend hỗ trợ"

## Yêu cầu (sau khi Backend 1.1 xong)

1. Gọi API `POST /auth/forgot-password` từ form quên mật khẩu
2. Thêm route và trang **Reset password** (truy cập từ link trong email)
3. Gọi API `POST /auth/reset-password` từ trang reset
4. Hiển thị kết quả cho user

## Phụ thuộc
- **Blocked by:** Backend 1.1 (Forgot/Reset password API)

## Checklist

- [ ] Gọi forgot-password API từ ForgotPassword.tsx
- [ ] Trang ResetPassword.tsx + route
- [ ] Gọi reset-password API
- [ ] Xử lý lỗi và thông báo
```

---

## Issue 5: [Frontend] Trang Hồ sơ – Đổi mật khẩu (2.2)

**Title:** `feat(frontend): connect Profile change password to backend`

**Labels:** `frontend`, `enhancement`, `auth`

**Description:**

```markdown
## Mô tả
Kết nối chức năng đổi mật khẩu trên trang Hồ sơ với API backend.

## Hiện trạng
- `Profile.tsx` cập nhật fullName/avatarUrl qua `userApi.updateProfile` (đã có)
- Phần đổi mật khẩu: submit hiện hiển thị "Chức năng này hiện chưa có Backend hỗ trợ"

## Yêu cầu (sau khi Backend 1.2 xong)

1. Triển khai `userApi.changePassword(currentPassword, newPassword)`
2. Gọi `PATCH /users/me/password` (hoặc endpoint backend chọn)
3. Khi submit form đổi mật khẩu, gọi API thật (không còn mô phỏng)

## Phụ thuộc
- **Blocked by:** Backend 1.2 (Change password API)

## Checklist

- [ ] userApi.changePassword gọi PATCH /users/me/password
- [ ] Profile.tsx gọi changePassword khi submit
- [ ] Xử lý lỗi (sai mật khẩu hiện tại, v.v.)
```

---

## Issue 6: [Frontend] Quản lý lớp học – Danh sách học sinh (2.3)

**Title:** `feat(frontend): display student list in ClassManagement`

**Labels:** `frontend`, `enhancement`

**Description:**

```markdown
## Mô tả
Hiển thị danh sách học sinh trong trang Quản lý lớp học.

## Hiện trạng
- `ClassManagement.tsx` đã có thêm/xóa học sinh
- Khu vực "Danh sách học sinh" là placeholder: "Chưa có API từ Backend"

## Yêu cầu (sau khi Backend 1.3 xong)

1. Thêm `getStudents(classId)` vào `classroomApi.ts`
2. Gọi `GET /classes/:id/students`
3. Hiển thị bảng học sinh: `id`, `tên`, `email`, nút xóa khỏi lớp (nếu cần)

**Lưu ý:** `StudentProgressPage` đã gọi `/classes/${classId}/students` – dropdown sẽ có dữ liệu khi API sẵn sàng.

## Phụ thuộc
- **Blocked by:** Backend 1.3 (GET /classes/{classId}/students)

## Checklist

- [ ] classroomApi.getStudents(classId)
- [ ] ClassManagement fetch và hiển thị danh sách
- [ ] Bảng: id, tên, email, nút xóa (tùy chọn)
```

---

## Thứ tự đề xuất

1. **Backend:** 1.1 → 1.2 → 1.3 (có thể song song 1.2 và 1.3)
2. **Frontend:** 2.1, 2.2, 2.3 (sau khi backend tương ứng xong)

## Nhánh đề xuất

Tạo nhánh từ `dev`:
```
feature/auth-password-and-class-students
```
