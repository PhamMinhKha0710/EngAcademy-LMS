# Debugging Playbook – Quy trình debug chuẩn

Hướng dẫn debug có hệ thống cho project **weblearnenglish**, áp dụng cho backend (Java/Spring), frontend (React/TypeScript) và Admin.

---

## 1. Reproduce (Tái hiện lỗi)

### Bước 1.1: Xác định bối cảnh

- **Endpoint/Page**: URL, method (GET/POST/…).
- **User/Role**: ADMIN, SCHOOL, TEACHER, STUDENT.
- **Dữ liệu**: ID (schoolId, classId, userId, examResultId), body request.
- **Môi trường**: Local / CI / Staging.

### Bước 1.2: Tái hiện tối thiểu

- Cô lập bước gây lỗi: giảm số bước, bỏ step không liên quan.
- Ghi lại: request (curl/Postman), response, expected vs actual.

### Bước 1.3: Xác định loại lỗi

- **4xx/5xx**: Backend logic, validation, security.
- **UI sai/thiếu**: Frontend state, API response format, pagination.
- **Test fail**: Fixture, mock, assertion.
- **Build fail**: Dependency, version, config.

---

## 2. Debug Backend (Spring Boot)

### 2.1: Kiểm tra principal và quyền

Khi lỗi liên quan authorization (403, truy cập sai dữ liệu):

1. Xác định user đang gọi: `principal`, `SecurityContextHolder.getContext().getAuthentication()`.
2. Kiểm tra role: `principal.getAuthorities()`, có `ROLE_SCHOOL` không.
3. Kiểm tra schoolId: `principal` có `getSchoolId()` không, giá trị là gì.
4. So sánh với resource: `resource.getSchoolId()` vs `principal.getSchoolId()`.
5. Nếu SCHOOL: mọi resource phải có `schoolId == principal.schoolId`.

**Công cụ**: Breakpoint ở controller/service; log `principal`, `resource`.

### 2.2: Kiểm tra request/response

1. Log request: body, path variable, query param.
2. Log response: status, body (trước khi return).
3. Kiểm tra DTO mapping: entity → DTO có thiếu field không, có `@JsonIgnore` gây thiếu không.
4. Nếu merge conflict: kiểm tra `@JsonIgnore` trên entity (vd: ExamResult.exam) có bị xóa không.

### 2.3: Kiểm tra database

1. Query trực tiếp: xem dữ liệu có đúng không (school_id, user_id, …).
2. Transaction: có rollback bất ngờ không.
3. Migration: schema có khớp entity không.

### 2.4: Test

1. Viết unit test cho service logic.
2. Viết integration test: gọi API với token SCHOOL, resource trường khác → expect 403.
3. Chạy `mvn test` để verify.

---

## 3. Debug Frontend / Admin (React)

### 3.1: Kiểm tra API call

1. DevTools → Network: request có gửi đúng URL, method, body không.
2. Response: status, body. Có 401/403/500 không.
3. Pagination: request có `page`, `size` không; response có đủ data không.

### 3.2: Kiểm tra state

1. React DevTools: state component, props.
2. Redux/Zustand: store có đúng data không.
3. useEffect dependency: thiếu dep → stale closure; thừa dep → loop.

### 3.3: Kiểm tra type và lint

1. TypeScript: type có đúng không, `any` ẩn ở đâu.
2. ESLint: exhaustive-deps, no-explicit-any, react-refresh.
3. Fix type trước, tránh `as any` tạm thời.

### 3.4: Kiểm tra UI theo quyền

1. Đăng nhập với role khác (SCHOOL vs ADMIN).
2. Menu, form, dropdown: có hiển thị đúng theo role không.
3. SCHOOL: dropdown trường có bị ẩn/lock không.

---

## 4. Debug Test

### 4.1: Test fail sau merge

1. Đọc stack trace: `NoSuchMethodError`, `NullPointerException`, assertion fail.
2. Kiểm tra TestDataFactory: có method test đang gọi không.
3. Entity/DTO mới: thêm method tương ứng vào TestDataFactory.
4. Chạy từng test class: `mvn test -Dtest=ExamAntiCheatControllerTest`.

### 4.2: Fixture và mock

1. Test data: có đủ user, school, class, exam không.
2. Token: JWT cho đúng user (admin, school, teacher, student).
3. Order: setup (create data) → act (call API) → assert.

---

## 5. Debug Build / Environment

### 5.1: Java version

1. `java -version`, `mvn -v`.
2. `pom.xml`: `<java.version>`.
3. Không khớp → sửa pom hoặc cài đúng JDK.

### 5.2: Dependency

1. `mvn dependency:tree` (BackEnd); `npm ls` (Admin/FrontEnd).
2. Conflict: xem bản nào được resolve.
3. Clean: `mvn clean`, `rm -rf node_modules && npm install`.

### 5.3: Lint / format

1. `npm run lint`: fix từng lỗi, không disable hàng loạt.
2. `eslint-disable` phải có comment lý do.
3. Pre-commit: chạy lint trước khi commit.

---

## 6. Checklist tổng hợp

| Loại lỗi | Bước ưu tiên |
|----------|--------------|
| 403 Forbidden | Kiểm tra principal, role, schoolId, resource-scope |
| Data sai/thiếu | Kiểm tra API response, DTO mapping, pagination params |
| Test fail | Kiểm tra TestDataFactory, fixture, assertion |
| Build fail | Kiểm tra Java version, dependency, lint |
| UI sai | Kiểm tra Network, state, role-based render |

---

## 7. Tham khảo

- [bugs/](bugs/) – Chi tiết từng bug và cách fix.
- [security/](security/) – Pattern authorization.
- [lessons-learned.md](lessons-learned.md) – Bài học rút ra.
