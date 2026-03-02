# Performance – Thiếu pagination/size khi fetch danh sách

## Mô tả vấn đề

Khi gọi API danh sách (users, classes, v.v.) mà không truyền `page` và `size`, Spring Data mặc định trả `size=20`. Nếu UI cần hiển thị toàn bộ (vd: dropdown, danh sách nhỏ) thì chỉ nhận 20 bản ghi → thiếu dữ liệu, UX sai.

Ngược lại: nếu truyền `size` quá lớn (vd: 10000) cho danh sách rất dài → query chậm, tốn bộ nhớ.

## Nguyên nhân

- Frontend không chỉ rõ pagination params.
- Backend default size=20 không đủ cho use case "load all" trong một số trang.
- Chưa có strategy rõ: khi nào "load all", khi nào phân trang.

## Cách debug

1. Network: xem request có `?page=0&size=20` (default) hay `size=200`.
2. UI: danh sách có đủ không, hay chỉ 20 items.
3. Backend: log query, xem LIMIT trong SQL.

## Giải pháp

1. **Load all cho danh sách nhỏ (<500)**: Truyền `size=500` hoặc giá trị hợp lý.
2. **Phân trang cho danh sách lớn**: Implement pagination UI, gọi API với page/size tăng dần.
3. **API client**: Định nghĩa `DEFAULT_PAGE_SIZE`, luôn truyền params.
4. **Backend**: Có thể set default size lớn hơn (vd: 100) nếu nghiệp vụ cần, nhưng nên có max cap.

Vị trí: `Admin/src/features/students/StudentsPage.tsx`, `TeachersPage.tsx`, `ClassRoomsPage.tsx`.

## Code mẫu (nếu có)

```ts
const DEFAULT_PAGE_SIZE = 200
api.get('/users', { params: { page: 0, size: DEFAULT_PAGE_SIZE } })
```

## Bài học rút ra

- Luôn chỉ rõ pagination; không dựa vào default mù mờ.
- Cân nhắc virtual scroll / infinite scroll cho danh sách rất dài.

## Cách phòng tránh sau này

1. Code review: mọi GET list API có params pagination.
2. E2E test: tạo >default size bản ghi, verify UI hiển thị đủ.
3. Liên quan: [memory/bugs/admin-pagination-missing.md](../bugs/admin-pagination-missing.md)
