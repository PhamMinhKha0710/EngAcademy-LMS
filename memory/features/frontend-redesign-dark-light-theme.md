# Frontend – Full redesign với dark/light theme và role-based routing

## Mô tả vấn đề

FrontEnd (student/teacher) cần redesign toàn diện: giao diện đẹp hơn, dark/light theme, routing theo role (student vs teacher), nhiều trang và component mới.

## Nguyên nhân

- UX cải thiện: theme切换, giao diện hiện đại.
- Phân tách rõ Student pages vs Teacher pages qua routing.

## Cách debug

N/A – feature development.

## Giải pháp

1. **Theme**: Dark/light mode toggle, lưu preference (localStorage hoặc state).
2. **Role-based routing**: Student: `/dashboard`, `/lessons`, `/vocabulary`, `/exams`, … Teacher: `/teacher/dashboard`, `/teacher/management`, `/teacher/questions`, …
3. **10 student pages, 8 teacher pages**: Theo spec routing.
4. **10 UI components, 9 API services**: Tái cấu trúc components và API layer.

Commit: 09d53ee. Vị trí: `FrontEnd/`.

## Code mẫu (nếu có)

Tech stack: React 18, TypeScript, Vite, Zustand, Tailwind, framer-motion, lucide-react, canvas-confetti.

## Bài học rút ra

- Theme: dùng CSS variables hoặc Tailwind dark: prefix.
- Role-based routing: Route guard kiểm tra role, redirect nếu sai.

## Cách phòng tránh sau này

1. Tuân thủ [frontend-design-guide](.cursor/skills/frontend-design-guide): typography, color, components.
2. Consistency: theme, spacing, component style giữa student và teacher.
