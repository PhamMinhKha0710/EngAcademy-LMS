# Architecture – Hexagonal / Clean Architecture

## Mô tả vấn đề

Backend cần cấu trúc rõ ràng để:
- Tách domain logic khỏi framework (Spring, JPA).
- Dễ test (mock repository, mock adapter).
- Dễ thay đổi DB, API (adapter có thể swap).
- Đồng bộ với các module mới (anti-cheat, mistake-notebook).

## Nguyên nhân

- Yêu cầu maintainability, testability.
- Feature branch (anti-cheat, mistake-notebook) đã implement theo hexagonal, cần merge vào cấu trúc chung.

## Cách debug

N/A – architecture document.

## Giải pháp

**Cấu trúc thư mục BackEnd**:

```
src/main/java/com/englishlearn/
├── domain/                 # Core business
│   ├── entity/             # User, Exam, ClassRoom, ...
│   └── exception/          # ResourceNotFoundException, ApiException, ...
├── application/            # Use cases
│   ├── dto/request/
│   ├── dto/response/
│   └── service/            # ExamService, UserService, ...
├── infrastructure/         # Adapters
│   ├── persistence/        # JPA Repository, Entity mapping
│   ├── config/             # SecurityConfig, ...
│   └── security/           # JWT, UserDetails, ...
└── presentation/           # REST API
    └── controller/         # ExamController, UserController, ...
```

**Luồng**:
- Controller (presentation) nhận HTTP request → gọi Service (application).
- Service gọi Repository (infrastructure) để lấy/lưu dữ liệu.
- Entity (domain) không phụ thuộc framework; DTO (application) chuyển đổi qua lại.
- Exception (domain) được map sang HTTP status ở controller/exception handler.

**Nguyên tắc**:
- Domain không import Spring, JPA.
- Application service không biết chi tiết HTTP, chỉ nhận DTO.
- Infrastructure implement interface (nếu dùng port) hoặc Repository trực tiếp.

## Code mẫu (nếu có)

```
Request → Controller → Service → Repository → DB
                ↓
            Entity/DTO
```

## Bài học rút ra

- Hexagonal giúp domain pure, dễ unit test.
- Migration từng module; không cần refactor toàn bộ cùng lúc.
- Controller = thin layer; logic nằm ở Service.

## Cách phòng tránh sau nay

1. Khi thêm feature: tạo entity (domain) → repository (infra) → service (app) → controller (presentation).
2. Không đặt business logic trong Controller.
3. Liên quan: [memory/features/hexagonal-architecture-migration.md](../features/hexagonal-architecture-migration.md)
