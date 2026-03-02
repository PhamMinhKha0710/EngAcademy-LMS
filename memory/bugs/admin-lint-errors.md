# [Admin] Lỗi ESLint – Header theme init, no-explicit-any, exhaustive-deps, react-refresh

## Mô tả vấn đề

Admin project gặp nhiều lỗi ESLint khi build/lint:
- **Header theme init**: Có thể là useEffect/initialization không đúng thứ tự hoặc dependency.
- **no-explicit-any**: Dùng kiểu `any` thay vì kiểu cụ thể.
- **exhaustive-deps**: useEffect/useCallback thiếu dependency trong mảng dependencies.
- **react-refresh**: Component export không tương thích với react-refresh (HMR).

Kết quả: lint fail, có thể block CI hoặc gây cảnh báo khi dev.

## Nguyên nhân

- Code mới thêm chưa tuân thủ rule ESLint.
- TypeScript: dùng `any` cho response API hoặc biến chưa có type.
- React Hooks: thiếu dependency (vd: fetchUsers trong useEffect nhưng không list fetchUsers) → eslint-disable hoặc thêm đúng deps.
- Component re-export: eslint-plugin-react-refresh yêu cầu chỉ export component từ file, không export thêm giá trị khác.

## Cách debug

1. Chạy `npm run lint` trong thư mục Admin.
2. Đọc từng rule: `react-hooks/exhaustive-deps`, `@typescript-eslint/no-explicit-any`, `react-refresh/only-export-components`.
3. Vị trí thường gặp: Header.tsx (theme), UsersPage, StudentsPage, TeachersPage (api.get với `ApiResponse<any>`).

## Giải pháp

- **no-explicit-any**: Thay `any` bằng type cụ thể (vd: `ApiResponse<Page<User>>`).
- **exhaustive-deps**: Thêm dependency vào mảng, hoặc dùng `useCallback` cho hàm fetch. Nếu cố ý bỏ qua: `// eslint-disable-next-line react-hooks/exhaustive-deps` kèm comment lý do.
- **react-refresh**: Thêm `/* eslint-disable react-refresh/only-export-components */` ở đầu file nếu component cần export kèm giá trị khác (vd: Button với variants).

Commit tham khảo: 6fa6ff2, af0e4ab.

## Code mẫu (nếu có)

```tsx
// Trước: any
const response = await api.get<ApiResponse<any>>('/users')

// Sau: type cụ thể
const response = await api.get<ApiResponse<Page<User>>>('/users')

// exhaustive-deps - nếu fetchUsers ổn định, thêm vào deps
useEffect(() => { fetchUsers() }, [page, fetchUsers])

// hoặc disable có chủ đích
useEffect(() => { fetchUsers() }, [page]) // eslint-disable-line react-hooks/exhaustive-deps
```

## Bài học rút ra

- Tránh `any`; luôn define type cho API response.
- exhaustive-deps giúp tránh stale closure; disable phải có lý do rõ ràng.
- react-refresh: một số component (shadcn/ui) cần disable rule cho file đó.

## Cách phòng tránh sau này

1. Cấu hình ESLint chặt từ đầu; fix ngay khi thêm code mới.
2. Pre-commit hook (husky + lint-staged): chạy lint trước khi commit.
3. TypeScript strict mode: bật để tránh any ẩn.
4. Document: "Khi dùng eslint-disable, bắt buộc comment lý do."
