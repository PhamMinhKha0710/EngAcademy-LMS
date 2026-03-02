# Admin – Dual role support (ADMIN + SCHOOL)

## Mô tả vấn đề

Admin cần hỗ trợ 2 vai trò chính: **ADMIN** (quản trị toàn hệ thống) và **SCHOOL** (quản lý trường). Mỗi role có menu, redirect và quyền truy cập khác nhau.

## Nguyên nhân

- Nghiệp vụ: trường học tự quản lý lớp, giáo viên, học sinh, điểm; ADMIN quản lý tất cả trường.
- Cần role-based UI: sidebar, redirect sau login, route protection.

## Cách debug

N/A – feature development.

## Giải pháp

1. **Auth/me**: API trả về role, schoolId (cho SCHOOL).
2. **RoleBasedRedirect**: Sau login, ADMIN → `/schools`, SCHOOL → `/students` (hoặc trang mặc định của SCHOOL).
3. **Sidebar**: Hiển thị menu theo role. ADMIN: Schools, Users, Notifications, Leaderboard, Badges. SCHOOL: Classrooms, Teachers, Students, Grades.
4. **ProtectedRoute**: Chặn SCHOOL truy cập `/schools`, v.v.
5. **useRole hook**: `isAdmin`, `isSchool` để điều kiện render.

Commits: 873bdde, b3aeb5e. Liên quan: `Admin/src/app/useRole.ts`, `RoleBasedRedirect.tsx`, `Sidebar.tsx`.

## Code mẫu (nếu có)

```tsx
// useRole
const { isAdmin, isSchool } = useRole()

// Sidebar - menu theo role
{isAdmin && <NavItem to="/schools">Trường học</NavItem>}
{isSchool && <NavItem to="/classrooms">Lớp học</NavItem>}
```

## Bài học rút ra

- Role-based UI phải đồng bộ với backend: menu ẩn/hiện theo role, API cũng validate role.
- SCHOOL cần thêm scope (schoolId) – xem security docs.

## Cách phòng tránh sau này

1. Mọi trang mới: kiểm tra role nào được phép truy cập.
2. Xem: [memory/security/school-scope-authorization.md](../security/school-scope-authorization.md)
