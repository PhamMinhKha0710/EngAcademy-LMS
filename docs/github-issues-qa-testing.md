# GitHub Issues – Giao việc test (QA) – Admin & Frontend

Dùng nội dung dưới đây để tạo issues trên GitHub, giao cho người test toàn bộ giao diện Admin và Frontend (người dùng).

**Labels gợi ý:** `testing`, `QA`, `acceptance`

---

## Issue 1: [QA] Kiểm thử giao diện Admin (2 vai trò: Admin & Quản lý trường)

**Title:** `[QA] Test Admin panel – Admin và Quản lý trường học (SCHOOL)`

**Labels:** `testing`, `QA`, `acceptance`, `admin`

**Description:**

```markdown
## Mục đích
Kiểm thử toàn bộ giao diện ứng dụng Admin với 2 vai trò: **Quản trị hệ thống (ADMIN)** và **Quản lý trường học (SCHOOL)**. Đảm bảo đăng nhập, phân quyền, menu và chức năng từng trang hoạt động đúng.

## Phạm vi test

### 1. Đăng nhập & phân quyền
- [ ] Đăng nhập với tài khoản **ADMIN**: redirect đúng (ví dụ `/schools`), sidebar chỉ hiển thị menu dành cho ADMIN.
- [ ] Đăng nhập với tài khoản **SCHOOL**: redirect đúng (ví dụ `/students`), sidebar chỉ hiển thị menu dành cho SCHOOL (Lớp học, Giáo viên, Học sinh, Điểm).
- [ ] Truy cập trực tiếp URL của role khác (ví dụ SCHOOL truy cập `/schools`): bị chặn hoặc redirect phù hợp.

### 2. ADMIN – Các trang cần test
| Trang | Đường dẫn | Nội dung kiểm tra |
|-------|-----------|-------------------|
| Trường học | /schools | Xem danh sách, tìm kiếm, thêm/sửa/xóa trường (nếu có). |
| Tất cả người dùng | /users | Xem danh sách (phân trang), tạo user mới, xóa user. |
| Thông báo | /notifications | Gửi thông báo (nhập user, tiêu đề, nội dung). |
| Xếp hạng | /leaderboard | Xem bảng xếp hạng. |
| Huy hiệu | /badges | Xem/quản lý huy hiệu, gán huy hiệu cho user (nếu có). |

### 3. SCHOOL – Các trang cần test
| Trang | Đường dẫn | Nội dung kiểm tra |
|-------|-----------|-------------------|
| Lớp học | /classrooms | Xem danh sách lớp, thêm/sửa/xóa lớp, chọn trường và giáo viên. |
| Giáo viên | /teachers | Xem danh sách giáo viên, xóa (nếu có). |
| Học sinh | /students | Xem danh sách học sinh, xóa (nếu có). |
| Điểm | /grades | Xem danh sách điểm (hiện có thể dùng dữ liệu mẫu – ghi nhận trạng thái). |

### 4. Chung
- [ ] Đăng xuất: thoát đúng, redirect về `/login`.
- [ ] Responsive/trải nghiệm trên trình duyệt: không lỗi giao diện nghiêm trọng.

## Môi trường test
- Backend chạy (API sẵn sàng).
- Admin app chạy (ví dụ `npm run dev` trong thư mục Admin).
- Có ít nhất 1 tài khoản ADMIN và 1 tài khoản SCHOOL để test.

## Báo cáo
- Ghi lại lỗi (screenshot, bước tái hiện, mong đợi vs thực tế).
- Ghi nhận trang/chức năng chưa có hoặc chưa hoàn thiện (ví dụ Điểm đang mock).
```

---

## Issue 2: [QA] Kiểm thử giao diện Frontend (Học sinh & Giáo viên)

**Title:** `[QA] Test Frontend – Học sinh, Giáo viên và trang dùng chung`

**Labels:** `testing`, `QA`, `acceptance`, `frontend`

**Description:**

```markdown
## Mục đích
Kiểm thử toàn bộ giao diện ứng dụng Frontend (người dùng cuối): học sinh (STUDENT), giáo viên (TEACHER), và các trang dùng chung (đăng nhập, đăng ký, hồ sơ, cài đặt). Đảm bảo luồng chính hoạt động đúng.

## Phạm vi test

### 1. Trang công khai (chưa đăng nhập)
- [ ] **Home** (/): Hiển thị trang chủ, có thể vào Login/Register.
- [ ] **Đăng ký** (/register): Nhập form, đăng ký thành công hoặc hiển thị lỗi rõ ràng.
- [ ] **Đăng nhập** (/login): Đăng nhập đúng role (STUDENT / TEACHER) → redirect đúng.
- [ ] **Quên mật khẩu** (/forgot-password): Form gửi (ghi nhận: backend chưa hỗ trợ thì chỉ kiểm tra giao diện).

### 2. Học sinh (STUDENT)
- [ ] **Dashboard** (/dashboard): Hiển thị tổng quan (quest, thống kê…).
- [ ] **Bài học** (/lessons): Danh sách bài học, vào chi tiết (/lessons/:id).
- [ ] **Từ vựng** (/vocabulary): Xem/tra cứu từ vựng.
- [ ] **Bài thi** (/exams): Danh sách bài thi, **Bắt đầu làm bài** (/exams/:id/take): làm bài, nộp bài (anti-cheat nếu có), xem kết quả (/exams/:id/result).
- [ ] **Xếp hạng** (/leaderboard): Bảng xếp hạng.
- [ ] **Sổ lỗi** (/mistakes): Xem lỗi đã lưu.
- [ ] **Huy hiệu** (/badges): Xem huy hiệu.

### 3. Giáo viên (TEACHER)
- [ ] **Dashboard** (/teacher/dashboard): Tổng quan giáo viên.
- [ ] **Quản lý lớp** (/teacher/management): Xem lớp, thêm/xóa học sinh (nếu API có).
- [ ] **Bài học** (/teacher/lessons): CRUD bài học (nếu có).
- [ ] **Câu hỏi** (/teacher/questions): CRUD câu hỏi.
- [ ] **Từ vựng** (/teacher/vocabulary): Quản lý từ vựng.
- [ ] **Bài thi** (/teacher/exams): Tạo/sửa bài thi, xem danh sách.
- [ ] **Kết quả thi** (/teacher/exams/:examId/results): Xem điểm, anti-cheat (nếu có).
- [ ] **Tiến độ học sinh** (/teacher/progress): Xem tiến độ.

### 4. Dùng chung (đã đăng nhập)
- [ ] **Hồ sơ** (/profile): Xem/sửa tên, avatar. Phần đổi mật khẩu (ghi nhận: backend chưa hỗ trợ thì chỉ kiểm tra giao diện).
- [ ] **Cài đặt** (/settings): Trang cài đặt hoạt động không lỗi.
- [ ] **Đăng xuất**: Thoát đúng, không truy cập lại route yêu cầu đăng nhập.

### 5. Phân quyền
- [ ] STUDENT truy cập URL giáo viên (ví dụ /teacher/dashboard): bị chặn hoặc redirect.
- [ ] TEACHER truy cập URL học sinh (ví dụ /exams/:id/take) nếu chỉ dành cho STUDENT: theo đúng thiết kế.

## Môi trường test
- Backend chạy, Frontend chạy (ví dụ `npm run dev` trong thư mục FrontEnd).
- Có tài khoản STUDENT và TEACHER (và dữ liệu mẫu: lớp, bài thi, bài học…).

## Báo cáo
- Ghi lại lỗi: screenshot, bước tái hiện, mong đợi vs thực tế.
- Ghi nhận chức năng chưa có backend (quên mật khẩu, đổi mật khẩu) để không tính là bug giao diện.
```

---

## Issue 3 (tùy chọn): [QA] Test E2E luồng thi (Học sinh làm bài – Anti-cheat)

**Title:** `[QA] Test E2E luồng thi – Học sinh làm bài và anti-cheat`

**Labels:** `testing`, `QA`, `E2E`, `frontend`

**Description:**

```markdown
## Mục đích
Kiểm thử end-to-end luồng thi từ phía học sinh: vào bài thi, làm bài, ghi nhận anti-cheat (đổi tab), nộp bài và xem kết quả.

## Các bước test
1. Đăng nhập **STUDENT**, vào **Bài thi** → chọn bài thi đang mở.
2. **Bắt đầu làm bài**: Kiểm tra đề hiển thị (shuffle câu/đáp án), không lộ đáp án đúng, có timer.
3. **Anti-cheat**: Đổi tab/ẩn cửa sổ vài giây → quay lại. Ghi nhận có cảnh báo hoặc event được gửi (không cần verify backend, chỉ UI/flow).
4. **Nộp bài**: Chọn đáp án, nộp bài. Kiểm tra thông báo thành công và redirect xem kết quả.
5. **Trang kết quả**: Hiển thị điểm, số câu đúng, grade, thời gian nộp.

## Ghi nhận
- Lỗi hiển thị, lỗi gửi request, lỗi sau nộp bài.
- Trường hợp: nộp trùng, hết giờ (nếu có xử lý).
```

---

## Cách dùng

1. Vào repo GitHub → **Issues** → **New issue**.
2. Copy **Title** và **Labels** của từng issue.
3. Copy toàn bộ nội dung trong **Description** (khối ```markdown ... ```) vào phần nội dung issue.
4. Gán assignee là người test (QA).
5. Tạo từng issue (Issue 1: Admin, Issue 2: Frontend, Issue 3: E2E thi – nếu cần).

## Ghi chú

- Có thể tách nhỏ hơn (ví dụ: 1 issue cho Admin – ADMIN role, 1 issue cho Admin – SCHOOL role) nếu giao nhiều người test.
- Sau khi test xong, người test comment checklist đã pass/fail và link bug (issue khác) nếu có.
