# GitHub Issues – Admin 2 role (School scope & Grades)

Dùng nội dung dưới đây để tạo issues trên GitHub. Copy từng block vào **New Issue**.

**Nhánh đề xuất:** `feature/admin-school-scope-and-grades` (tạo từ `dev`).

---

## Issue 1: [Backend] API danh sách học sinh theo lớp

**Title:** `feat(api): add GET /classes/{classId}/students endpoint`

**Labels:** `backend`, `enhancement`, `api`

**Description:**

```markdown
## Mô tả
Lấy danh sách học sinh của một lớp học. Phục vụ Admin (ClassManagement, Grades) và quản lý trường (SCHOOL).

## Hiện trạng
- ClassRoomController chỉ có POST/DELETE `/{classId}/students/{studentId}`
- Không có endpoint GET danh sách học sinh trong lớp
- StudentClassRepository đã có `findActiveStudentsByClassId(Long classId)`

## Yêu cầu

### Endpoint: `GET /api/v1/classes/{classId}/students`
- Trả về danh sách học sinh: id, username, fullName, email (hoặc DTO tương đương UserResponse/StudentBasicResponse)

### Service
- Gọi repository `findActiveStudentsByClassId(classId)`
- Map sang DTO phù hợp

### Phân quyền
- `@PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL', 'TEACHER')")`

## Checklist
- [ ] ClassRoomService method getStudentsByClassId(classId)
- [ ] Endpoint GET /classes/{classId}/students
- [ ] DTO (StudentBasicResponse hoặc dùng UserResponse)
```

---

## Issue 2: [Backend] Lọc dữ liệu theo trường cho role SCHOOL

**Title:** `feat(backend): filter users and classes by school for SCHOOL role`

**Labels:** `backend`, `enhancement`, `security`

**Description:**

```markdown
## Mô tả
User có role SCHOOL chỉ được xem/sửa dữ liệu thuộc trường của mình. Cần backend trả về dữ liệu đã lọc theo schoolId của user đăng nhập.

## Hiện trạng
- GET /users trả về toàn bộ user (ADMIN và SCHOOL đều thấy hết)
- GET /classes trả về toàn bộ lớp
- User entity có trường `school` (ManyToOne). ClassRoom có school.

## Yêu cầu

### 1. GET /users/me (hoặc response đăng nhập) trả về schoolId
- Đảm bảo UserResponse có field schoolId (hoặc school) để Admin frontend biết trường của user SCHOOL.

### 2. GET /users – lọc theo trường khi caller là SCHOOL
- Nếu principal có role SCHOOL: chỉ trả về user thuộc trường đó (user.schoolId = principal.schoolId) hoặc user là GV/học sinh thuộc lớp của trường (qua ClassRoom.school).
- ADMIN: giữ nguyên (xem tất cả).

### 3. GET /classes – lọc theo trường khi caller là SCHOOL
- Nếu principal là SCHOOL: chỉ trả về lớp thuộc trường của user (class.schoolId = principal.schoolId). Có thể thêm query `?schoolId=` và với SCHOOL thì bắt buộc schoolId = principal.schoolId.
- ADMIN: giữ nguyên (có thể lọc theo schoolId tùy chọn).

## Checklist
- [ ] UserResponse có schoolId (nếu chưa)
- [ ] UserService/UserController: GET /users lọc theo principal.schoolId khi role SCHOOL
- [ ] ClassRoomService/ClassRoomController: GET /classes lọc theo principal.schoolId khi role SCHOOL
```

---

## Issue 3: [Backend] SCHOOL chỉ được sửa đúng trường của mình

**Title:** `fix(backend): restrict SCHOOL to update only their own school`

**Labels:** `backend`, `fix`, `security`

**Description:**

```markdown
## Mô tả
User role SCHOOL chỉ được cập nhật (PUT) trường có id = schoolId của chính user đó.

## Hiện trạng
- PUT /schools/{id} dùng `@PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL')")` – SCHOOL có thể gửi request sửa bất kỳ trường nào.

## Yêu cầu
- Trong SchoolService.updateSchool (hoặc controller): nếu principal có role SCHOOL thì kiểm tra `id.equals(principal.getSchoolId())`. Nếu không khớp trả về 403 Forbidden.
- ADMIN: được sửa bất kỳ trường nào.

## Checklist
- [ ] Lấy schoolId của principal (từ UserDetails / User entity)
- [ ] Trong updateSchool: nếu là SCHOOL và id != principal.schoolId → 403
```

---

## Issue 4: [Admin] Trang Điểm (Grades) gọi API thật

**Title:** `feat(admin): Grades page use real API instead of mock data`

**Labels:** `frontend`, `admin`, `enhancement`

**Description:**

```markdown
## Mô tả
Trang Điểm (GradesPage) dành cho SCHOOL (và có thể ADMIN) hiện đang dùng mock data. Cần gọi API backend để hiển thị kết quả thi thật.

## Hiện trạng
- [Admin/src/features/grades/GradesPage.tsx](Admin/src/features/grades/GradesPage.tsx) dùng mảng mock `ExamResultResponse`.
- Backend đã có: GET /api/v1/exams (danh sách bài thi), GET /api/v1/exams/{id}/results (kết quả thi theo bài).

## Yêu cầu
1. Gọi GET /exams để lấy danh sách bài thi (có phân trang nếu cần).
2. Gọi GET /exams/{id}/results để lấy kết quả từng bài thi (hoặc chọn 1 bài để xem).
3. Hiển thị bảng: bài thi, học sinh, điểm, số câu đúng, tổng câu, phần trăm, grade, violationCount, submittedAt.
4. Giữ tìm kiếm/lọc (theo tên học sinh, bài thi) nếu đã có.
5. (Tùy chọn) SCHOOL: chỉ hiển thị bài thi thuộc lớp của trường mình – phụ thuộc backend lọc exam theo school/class.

## Phụ thuộc
- Backend GET /exams, GET /exams/{id}/results đã có và trả đúng format (ExamResultResponse).

## Checklist
- [ ] API client: getExams(), getExamResults(examId)
- [ ] GradesPage: fetch exams, chọn exam hoặc gộp tất cả results
- [ ] Bảng dữ liệu thật, bỏ mock
- [ ] Loading và xử lý lỗi
```

---

## Issue 5: [Admin] SCHOOL chỉ xem lớp/học sinh/giáo viên của trường mình

**Title:** `feat(admin): filter Classrooms/Students/Teachers by school for SCHOOL role`

**Labels:** `frontend`, `admin`, `enhancement`

**Description:**

```markdown
## Mô tả
Khi đăng nhập với role SCHOOL, các trang Lớp học, Học sinh, Giáo viên chỉ hiển thị dữ liệu thuộc trường của user.

## Hiện trạng
- ClassRoomsPage gọi GET /classes → hiện toàn bộ lớp.
- StudentsPage, TeachersPage gọi GET /users rồi filter theo role → hiện toàn bộ học sinh/giáo viên.

## Yêu cầu (sau khi Backend Issue 2 xong)
1. Lấy schoolId của user đăng nhập (từ GET /users/me hoặc auth store).
2. **ClassRoomsPage (SCHOOL):** Gọi GET /classes/school/{schoolId} thay vì GET /classes. Nếu backend đã tự lọc khi role SCHOOL thì có thể vẫn gọi GET /classes nhưng backend chỉ trả lớp của trường.
3. **StudentsPage (SCHOOL):** Dùng API đã lọc theo trường (GET /users?schoolId= hoặc backend tự lọc). Hoặc lấy học sinh qua GET /classes/{classId}/students cho từng lớp của trường.
4. **TeachersPage (SCHOOL):** Tương tự, chỉ hiển thị giáo viên thuộc trường (backend lọc hoặc lấy qua lớp của trường).
5. ADMIN: giữ hành vi hiện tại (xem tất cả).

## Phụ thuộc
- Backend trả schoolId trong profile/me.
- Backend lọc users/classes theo school cho SCHOOL (Issue 2).

## Checklist
- [ ] Auth store / API trả về schoolId cho user
- [ ] ClassRoomsPage: SCHOOL dùng schoolId khi gọi API lớp
- [ ] StudentsPage: SCHOOL chỉ thấy học sinh của trường
- [ ] TeachersPage: SCHOOL chỉ thấy giáo viên của trường
```

---

## Issue 6: [Admin] Hiển thị danh sách học sinh trong lớp (ClassRooms)

**Title:** `feat(admin): show student list per class in ClassRooms page`

**Labels:** `frontend`, `admin`, `enhancement`

**Description:**

```markdown
## Mô tả
Trong trang Quản lý lớp học (ClassRoomsPage), khi xem/sửa một lớp cần hiển thị danh sách học sinh trong lớp đó, có nút xóa khỏi lớp.

## Hiện trạng
- ClassRoomsPage có CRUD lớp, thêm/xóa học sinh (POST/DELETE) nhưng chưa gọi API lấy danh sách học sinh trong lớp để hiển thị.

## Yêu cầu (sau khi Backend có GET /classes/{classId}/students)
1. Thêm hàm getStudents(classId) trong API client (classroomApi hoặc tương đương).
2. Trong ClassRoomsPage: khi chọn/mở chi tiết một lớp, gọi GET /classes/{classId}/students.
3. Hiển thị bảng học sinh: id, tên, email (và nút xóa khỏi lớp nếu cần). Nút xóa gọi DELETE /classes/{classId}/students/{studentId}.

## Phụ thuộc
- Backend: GET /api/v1/classes/{classId}/students (Issue 1).

## Checklist
- [ ] classroomApi.getStudents(classId)
- [ ] ClassRoomsPage: fetch và hiển thị danh sách học sinh theo lớp
- [ ] Nút xóa khỏi lớp (đã có endpoint)
```

---

## Thứ tự đề xuất

1. **Backend:** Issue 1 (class students API) → Issue 2 (school filter) → Issue 3 (SCHOOL chỉ sửa đúng trường).
2. **Admin:** Issue 4 (Grades API) có thể làm song song khi backend exams/results sẵn; Issue 5 (SCHOOL filter UI) sau Issue 2; Issue 6 (student list trong lớp) sau Issue 1.

## Liên quan

- Kế hoạch: [Phân tích nghiệp vụ Admin 2 role](../../.cursor/plans/phân_tích_nghiệp_vụ_admin_2_role_b266c5d6.plan.md) (hoặc file plan tương ứng trong repo).
