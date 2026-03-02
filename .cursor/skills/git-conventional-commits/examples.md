# Ví dụ commit message – weblearnenglish

Các ví dụ theo Conventional Commits, phù hợp backend (Java/Spring), frontend (React/Vite), admin.

## feat (tính năng mới)

```
feat(backend): add Exam and Question CRUD APIs with auto-grading
feat(frontend): setup React + Vite + TypeScript + Tailwind + Zustand
feat(admin): add dashboard page with stats cards and charts
feat(admin): add CRUD management pages for Users, Schools, Lessons
feat(backend): add DevDataSeeder and SWAGGER_TEST profile
feat(frontend): add role-based routing and Student/Teacher UI
```

## fix (sửa lỗi)

```
fix(backend): prevent NPE in ExamResult when exam is null
fix(admin): resolve lint errors in Header theme init
fix(backend): resolve critical security and API bugs
fix(test): add missing TestDataFactory methods for ExamAntiCheat
```

## docs

```
docs: add comprehensive test results report (274/274 pass)
docs: update README with API and setup instructions
```

## refactor

```
refactor(backend): migrate to hexagonal/clean architecture
refactor(frontend): extract auth hook from Login page
refactor(admin): dual-role support (ADMIN + SCHOOL)
```

## test

```
test: add comprehensive test suite (226 tests, 100% pass)
test(backend): add controller tests for AntiCheat and Exam
```

## chore / build / ci

```
chore: update gitignore and configure MySQL database
chore(deps): upgrade Spring Boot to 3.x
ci: add GitHub Actions workflow for backend tests
```

## Breaking change

```
feat(api)!: remove legacy /v1 exam endpoint

BREAKING CHANGE: use /api/v2/exams instead of /v1/exams
```

```
refactor(backend)!: rename ExamResult to Attempt

BREAKING CHANGE: entity and table renamed; run migration script
```
