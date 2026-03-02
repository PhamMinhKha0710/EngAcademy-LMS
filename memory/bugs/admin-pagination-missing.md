# [Admin] Thiếu phân trang/size khi gọi API danh sách

## Mô tả vấn đề

Các trang StudentsPage, TeachersPage gọi `GET /users` không truyền `size`; ClassRoomsPage khi SCHOOL gọi `GET /classes/school/{schoolId}` cũng không truyền `size`. Spring Data JPA mặc định `size=20` nên chỉ trả về 20 bản ghi đầu → thiếu dữ liệu khi có nhiều user/lớp (ví dụ >20).

## Nguyên nhân

- Frontend gọi API mà không truyền tham số `page`, `size`.
- Spring Pageable mặc định: `page=0`, `size=20`.
- Không có phân trang phía UI hoặc không cần lấy hết → cần tăng size hoặc implement pagination.

## Cách debug

1. Tạo >20 user (student/teacher) trong DB.
2. Vào StudentsPage, TeachersPage → chỉ thấy 20 bản ghi.
3. Kiểm tra network: request `GET /users` có query `?page=0&size=20` hoặc không có size.
4. Backend log hoặc DB query: verify chỉ trả 20 rows.

## Giải pháp

1. StudentsPage, TeachersPage: thêm `params: { page: 0, size: 200 }` (hoặc giá trị phù hợp với nhu cầu).
2. ClassRoomsPage: khi gọi `/classes/school/{schoolId}` thêm `params: { size: 200 }` nếu cần lấy hết.
3. (Tùy chọn) Triển khai phân trang phía UI nếu danh sách rất dài (pagination component, load more).

Vị trí: `Admin/src/features/students/StudentsPage.tsx`, `TeachersPage.tsx`, `Admin/src/features/classrooms/ClassRoomsPage.tsx`.

## Code mẫu (nếu có)

```ts
// StudentsPage / TeachersPage - fetchUsers
const response = await api.get<ApiResponse<Page<User>>>('/users', {
  params: { page: 0, size: 200 }
})

// ClassRoomsPage - fetchRooms (SCHOOL)
const response = await api.get<ApiResponse<ClassRoom[]>>(`/classes/school/${schoolId}`, {
  params: { size: 200 }
})
```

## Bài học rút ra

- Luôn chỉ rõ `page` và `size` khi gọi API phân trang, tránh dựa vào default.
- Nếu UI cần "load all" cho danh sách nhỏ: dùng size lớn; nếu danh sách rất lớn: implement server-side pagination.

## Cách phòng tránh sau này

1. API client: định nghĩa default `DEFAULT_PAGE_SIZE = 50` và luôn truyền.
2. Code review: kiểm tra mọi `GET` list API có params pagination không.
3. E2E test: tạo >default size bản ghi, verify UI hiển thị đủ.
4. Xem thêm: [memory/performance/pagination-missing-fetch-all.md](../performance/pagination-missing-fetch-all.md)
