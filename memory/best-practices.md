# Best Practices – Chuẩn và quy ước dự án

Tổng hợp best practices từ project **weblearnenglish**, kết hợp với frontend-design-guide, git-conventional-commits và kinh nghiệm thực tế.

---

## 1. Git & Commit

### Conventional Commits

Format: `<type>[(scope)]: <description>`

- **Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `build`.
- **Scope**: `backend`, `frontend`, `admin`, `api`, `test`, `docs`.
- **Description**: Imperative mood, không dấu chấm cuối.

Ví dụ:

```
feat(admin): add CRUD page for schools
fix(backend): restrict SCHOOL to GET /classes only for own school
fix(test): add missing TestDataFactory methods for ExamAntiCheat
```

### Branch workflow

- Tạo branch từ `dev`: `feature/<feature-name>`.
- Không push commit có `Co-authored-by: Cursor` lên remote.

*Tham khảo: [.cursor/skills/git-conventional-commits/](.cursor/skills/git-conventional-commits/)*

---

## 2. Backend (Spring Boot)

### Authorization

- **Role + Resource-scope**: Với SCHOOL, luôn kiểm tra `principal.getSchoolId()` vs resource.
- **Ownership**: Exam result, user data – validate `resource.ownerId == principal.getId()`.
- **Không tin request**: Ép `schoolId` từ principal khi role có scope.

### Architecture (Hexagonal)

- **domain**: Entity, exception – không phụ thuộc framework.
- **application**: Service, DTO – business logic.
- **infrastructure**: Repository, config, security.
- **presentation**: Controller – thin layer, gọi service.

### Test

- TestDataFactory: Mỗi entity/DTO mới cần method tương ứng.
- Integration test: Kiểm tra authorization (SCHOOL với resource trường khác → 403).
- Chạy `mvn test` trước khi merge.

*Tham khảo: [architecture/hexagonal-clean-architecture.md](architecture/hexagonal-clean-architecture.md), [security/](security/)*

---

## 3. Frontend & Admin (React)

### Style Guide

- **Accessibility**: Screen reader, keyboard, contrast (WCAG).
- **Consistency**: Typography, color, component style thống nhất.
- **Responsiveness**: Grid, breakpoints, media queries.
- **Components**: Chuẩn hóa Button, Form, Dialog, Dropdown; mỗi component có spec padding, state.

### Typography & Color

- Font family, size, weight, line-height cho heading, body, caption.
- Palette: primary, secondary, accent; background, text, links.
- Đủ contrast giữa text và background.

### Code

- **TypeScript**: Tránh `any`; dùng type cụ thể cho API response.
- **React Hooks**: exhaustive-deps – thêm đúng dependency; disable phải comment lý do.
- **Naming**: camelCase (biến, hàm), PascalCase (component); BEM hoặc naming nhất quán cho CSS.

### Empty state & Fallback

- Không hardcode dữ liệu thật làm fallback (vd: tên trường).
- Dùng "—", "Không có", "N/A" cho empty.

*Tham khảo: [.cursor/skills/frontend-design-guide/](.cursor/skills/frontend-design-guide/)*

---

## 4. API & Data

### Pagination

- Luôn truyền `page` và `size` khi gọi list API.
- Định nghĩa `DEFAULT_PAGE_SIZE`; không dựa vào default mù mờ.
- Danh sách rất dài: implement pagination UI hoặc virtual scroll.

### Mock → Real API

- Khi dùng mock: đặt TODO "replace mock with API".
- API-first: OpenAPI/Swagger trước, mock từ contract.
- Integration test: verify UI gọi đúng endpoint.

---

## 5. Environment & Build

### Java

- Dùng LTS (17, 21); thống nhất version trong pom.xml.
- Document trong README: "JDK 17 required".
- CI: setup-java với version cố định.

### Lint

- Fix lint sớm; không disable hàng loạt.
- Pre-commit: chạy lint; block commit nếu fail.
- eslint-disable phải có comment lý do.

---

## 6. Security

- **SCHOOL**: Chỉ truy cập resource có `schoolId == principal.schoolId`.
- **Exam**: Student chỉ submit/xem result của chính mình.
- **Defense in depth**: Frontend ẩn/lock + Backend validate.

*Tham khảo: [security/school-scope-authorization.md](security/school-scope-authorization.md), [security/exam-ownership-validation.md](security/exam-ownership-validation.md)*

---

## 7. Checklist nhanh

| Khi thêm... | Cần kiểm tra |
|-------------|--------------|
| Endpoint cho SCHOOL | Principal schoolId vs resource schoolId |
| Endpoint exam result | Ownership (studentId == principalId) |
| Entity/DTO mới | TestDataFactory có method tương ứng |
| Form có schoolId (SCHOOL) | Lock/ẩn dropdown, ép từ principal |
| API list | Pagination params (page, size) |
| Mock data | TODO replace, plan chuyển API |
| Fallback UI | Dùng placeholder trung tính |
| eslint-disable | Comment lý do |

---

*Cập nhật theo project conventions. Bổ sung khi có quy ước mới.*
