# Admin Panel – Project scaffolding và CRUD pages

## Mô tả vấn đề

Cần xây dựng ứng dụng Admin để quản trị hệ thống English Learning Platform (users, schools, lessons, exams, questions, vocabulary, classrooms, grades). Bắt đầu từ scaffolding (React + Vite + TypeScript), shadcn/ui, login, layout, dashboard, và các trang CRUD.

## Nguyên nhân

- Dự án cần giao diện quản trị riêng cho ADMIN và SCHOOL.
- Tách biệt khỏi FrontEnd (student/teacher) để dễ maintain và deploy.

## Cách debug

N/A – đây là feature development, không phải bug fix.

## Giải pháp

1. **Scaffolding**: `npm create vite@latest Admin -- --template react-ts`
2. **shadcn/ui**: Cài đặt các component: button, input, label, card, table, dialog, dropdown, badge, separator, avatar, scroll-area.
3. **Core infrastructure**: API client (axios), Redux store, auth (JWT), types, Tailwind styles.
4. **Layout**: AdminLayout, Sidebar, Header, ProtectedRoute.
5. **Login**: Trang đăng nhập với JWT.
6. **Dashboard**: Stats cards, charts (Recharts).
7. **CRUD pages**: Users, Schools, Lessons, Exams, Questions, Vocabulary, ClassRooms.

Commits: 008366d, 86644f5, c4f7e80, 6775eab, b27b0e2, 96eba97, 1e54b92, f0855b7.

## Code mẫu (nếu có)

Tech stack Admin: React 19, TypeScript, Vite 7, Redux Toolkit, Radix UI (shadcn), TanStack Table, React Hook Form, Zod, Recharts.

Vị trí: `Admin/` (toàn bộ app).

## Bài học rút ra

- Monorepo: Admin tách riêng cho phép tech stack khác (React 19 vs FrontEnd React 18) nếu cần.
- shadcn/ui: copy component vào project, dễ customize.

## Cách phòng tránh sau này

1. Giữ Admin và FrontEnd cấu trúc tương tự (hooks, api, components) để dễ onboard.
2. Shared types nếu có: có thể extract sang package chung hoặc copy.
