# Lessons Learned – Tổng hợp bài học từ dự án

Tài liệu rút ra từ lịch sử bugs, features và refactor của project **weblearnenglish**.

---

## 1. Bảo mật & Phân quyền

### Role-based + Resource-scope phải đi cùng

- `@PreAuthorize("hasRole('SCHOOL')")` chỉ đủ để biết user là SCHOOL; **không đủ** để đảm bảo SCHOOL chỉ truy cập resource thuộc trường mình.
- **Bài học**: Với multi-tenant (multi-school), luôn kiểm tra `principal.getSchoolId()` vs `resource.schoolId` trước khi thực thi.
- **Áp dụng**: Mọi endpoint cho SCHOOL cần thêm logic resource-scope (xem [security/school-scope-authorization.md](security/school-scope-authorization.md)).

### Không tin request body

- SCHOOL có thể gửi `schoolId` khác trong body khi tạo user/lớp.
- **Bài học**: Khi role có scope, **ép** `schoolId = principal.getSchoolId()` thay vì dùng giá trị từ request.
- **Áp dụng**: UserController.createUser, ClassRoomController.createClassRoom.

### Ownership validation cho exam

- Học sinh có thể gửi examResultId của học sinh khác để submit/xem kết quả.
- **Bài học**: Luôn truyền `principal.getId()` xuống service, validate `examResult.studentId == principalId`.
- **Áp dụng**: ExamController, ExamService (xem [security/exam-ownership-validation.md](security/exam-ownership-validation.md)).

---

## 2. Merge & Test

### Merge feature branch cần cập nhật TestDataFactory

- Merge `feat/full/speech-realtime` thiếu method trong TestDataFactory → test fail.
- **Bài học**: Khi merge branch có test mới và entity/DTO mới, kiểm tra TestDataFactory đã có method tương ứng chưa.
- **Áp dụng**: Checklist merge: "TestDataFactory có method cho entity/DTO mới chưa?"; chạy full test trước khi merge.

### CI chạy test trước merge

- Phát hiện lỗi sớm, tránh đẩy code broken lên remote.
- **Bài học**: CI bắt buộc chạy `mvn test` (BackEnd), `npm run lint` + `npm run build` (Admin, FrontEnd).

---

## 3. Môi trường & Build

### Java version fix sớm

- Java 22 không tương thích một số môi trường; downgrade xuống 17.
- **Bài học**: Thống nhất Java version (LTS: 17, 21) ngay từ đầu; document trong README; CI dùng cùng version.
- **Áp dụng**: pom.xml, README, `.sdkmanrc` hoặc tương đương.

---

## 4. Frontend & UI

### Không hardcode dữ liệu thật làm fallback

- SettingsPage dùng `'Chu Van An High School'` khi schoolName rỗng → hiển thị sai.
- **Bài học**: Fallback phải trung tính: "—", "Không có", "N/A". Không dùng tên riêng, dữ liệu thật.
- **Áp dụng**: Mọi placeholder cho empty state.

### UI phản ánh quyền

- SCHOOL vẫn thấy dropdown chọn trường khác khi tạo lớp → UX gây nhầm lẫn, tiềm ẩn lỗi.
- **Bài học**: Ẩn/disable field mà user không được dùng; không chỉ dựa vào backend reject.
- **Áp dụng**: ClassRoomsPage, mọi form có scope (schoolId) cho SCHOOL.

### Luôn truyền pagination params

- GET /users, GET /classes không truyền size → Spring default 20 → thiếu dữ liệu.
- **Bài học**: Luôn chỉ rõ `page` và `size` khi gọi API phân trang; không dựa vào default mù mờ.
- **Áp dụng**: StudentsPage, TeachersPage, ClassRoomsPage; định nghĩa DEFAULT_PAGE_SIZE.

### Tránh `any`, fix ESLint sớm

- `ApiResponse<any>` và exhaustive-deps gây lint fail.
- **Bài học**: Dùng type cụ thể cho API response; fix lint ngay khi thêm code; eslint-disable phải có comment lý do.
- **Áp dụng**: Code review checklist; pre-commit hook chạy lint.

---

## 5. Kiến trúc & Code

### Hexagonal giúp maintain

- Domain không phụ thuộc Spring/JPA; dễ test, dễ thay đổi adapter.
- **Bài học**: Khi thêm feature mới, tuân thủ layer: controller → service → repository.
- **Áp dụng**: BackEnd structure; xem [architecture/hexagonal-clean-architecture.md](architecture/hexagonal-clean-architecture.md).

### Mock data cần plan chuyển sang API

- Admin/FrontEnd ban đầu dùng mock; khi API sẵn sàng cần chuyển sang gọi thật.
- **Bài học**: Đặt TODO "replace mock with API" khi dùng mock; ưu tiên API-first (OpenAPI trước, mock từ contract).
- **Áp dụng**: GradesPage, Dashboard; integration test verify API được gọi.

---

## 6. Tổng kết

| Lĩnh vực | Bài học cốt lõi |
|----------|------------------|
| Security | Role + resource-scope; không tin request; ownership validate |
| Merge/Test | Cập nhật TestDataFactory; chạy test trước merge |
| Environment | Java version thống nhất, document rõ |
| Frontend | Không hardcode fallback; UI phản ánh quyền; pagination params; tránh any |
| Architecture | Hexagonal; plan bỏ mock |

---

*Cập nhật theo lịch sử project. Bổ sung khi có bài học mới.*
