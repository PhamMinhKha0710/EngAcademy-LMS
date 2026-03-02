# Backend – Migration sang Hexagonal / Clean Architecture

## Mô tả vấn đề

Backend ban đầu có thể theo cấu trúc layered truyền thống. Cần migrate sang Hexagonal (Ports & Adapters) / Clean Architecture để:
- Tách biệt domain logic khỏi framework và infrastructure.
- Dễ test, dễ thay đổi DB, API.
- Đồng bộ với các feature mới (anti-cheat, mistake-notebook).

## Nguyên nhân

- Yêu cầu kiến trúc: maintainability, testability.
- Feature branch (anti-cheat, mistake-notebook) được implement theo hexagonal, cần merge vào cấu trúc chung.

## Cách debug

N/A – refactor/architecture.

## Giải pháp

Cấu trúc thư mục:

```
BackEnd/src/main/java/com/englishlearn/
├── domain/           # Entity, exception
│   ├── entity/
│   └── exception/
├── application/      # Service, DTO, use case
│   ├── dto/
│   ├── service/
├── infrastructure/   # Persistence, config, security
│   ├── persistence/
│   ├── config/
│   └── security/
└── presentation/     # Controller (REST API)
    └── controller/
```

- **domain**: Entity thuần, không phụ thuộc framework.
- **application**: Business logic, DTO.
- **infrastructure**: JPA Repository, SecurityConfig, JWT.
- **presentation**: Controller gọi application service.

Commits: 3e3b2df, de80888, ed8f20d, 109cf28, 6d37a19.

## Code mẫu (nếu có)

Ví dụ flow: `ExamController` → `ExamService` (application) → `ExamRepository` (infrastructure). Entity `Exam` nằm trong domain.

## Bài học rút ra

- Hexagonal giúp domain không biết HTTP, DB.
- Migration từng module: bắt đầu từ module nhỏ (mistake-notebook, anti-cheat).

## Cách phòng tránh sau này

1. Khi thêm feature mới: tuân thủ layer (controller → service → repository).
2. Xem: [memory/architecture/hexagonal-clean-architecture.md](../architecture/hexagonal-clean-architecture.md)
