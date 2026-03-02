# Issue: Biểu đồ Tăng trưởng người dùng – API thật + nối Admin

**Người thực hiện:** Bảo  
**Ưu tiên:** Medium  
**Labels:** backend, admin, dashboard, api

---

## Mô tả

Hiện tại trang Dashboard (role Admin) có biểu đồ **"Tăng trưởng người dùng"** nhưng đang ở trạng thái empty state (chưa có dữ liệu) vì chưa có API thống kê đăng ký theo tháng. Cần thêm API ở BackEnd và nối Admin để chart hiển thị số liệu thật.

---

## Yêu cầu

### 1. BackEnd – Thêm API thống kê đăng ký theo tháng

- **Endpoint đề xuất:** `GET /api/v1/users/stats/registration-by-month` hoặc `GET /api/v1/admin/stats/user-growth`
- **Quyền:** Chỉ Admin (ví dụ `@PreAuthorize("hasRole('ADMIN')")`).
- **Response:** Mảng theo tháng, mỗi phần tử có dạng:
  - `month`: string (ví dụ `"T1"`, `"T2"`, ... hoặc `"2025-01"`, `"2025-02"` tùy quy ước).
  - `users`: number – tổng số user đăng ký trong tháng đó (hoặc cumulative tùy product).
- **Nguồn dữ liệu:** Bảng User, trường `createdAt` – group by tháng và đếm. Có thể dùng `UserRepository` + `@Query` native/JQL theo `createdAt`, hoặc tạo method trong `UserService` gọi repository.

**Ví dụ response:**

```json
{
  "success": true,
  "message": "Lấy thống kê đăng ký theo tháng thành công",
  "data": [
    { "month": "T1", "users": 12 },
    { "month": "T2", "users": 25 },
    { "month": "T3", "users": 18 }
  ]
}
```

*(Tên tháng có thể là T1–T12, hoặc 2025-01, 2025-02… thống nhất với frontend.)*

### 2. Admin – Nối Dashboard với API

- **File:** `Admin/src/features/dashboard/DashboardPage.tsx`
- Trong `fetchAdminData` (hoặc nơi đang gọi các API dashboard), thêm gọi API mới (ví dụ `GET /users/stats/registration-by-month` hoặc `/admin/stats/user-growth`).
- Set kết quả vào state `userGrowth` (kiểu `UserGrowthPoint[]` với `month`, `users`).
- Giữ logic hiện tại: nếu `userGrowth.length === 0` thì hiển thị empty state; nếu có dữ liệu thì vẽ `LineChart` với `data={userGrowth}`.

---

## Tiêu chí hoàn thành

- [ ] BackEnd có endpoint GET (đường dẫn đã thống nhất với team), bảo vệ role Admin, trả về mảng `{ month, users }`.
- [ ] Số liệu lấy từ DB (User.createdAt), đúng theo tháng.
- [ ] Admin Dashboard gọi API khi load (role Admin), set `userGrowth` và vẽ LineChart khi có data.
- [ ] Khi không có dữ liệu (mảng rỗng), vẫn hiển thị empty state như hiện tại.
- [ ] Đã test: đăng nhập Admin → vào Dashboard → thấy biểu đồ có số liệu (hoặc empty state nếu chưa có user theo tháng).

---

## Gợi ý kỹ thuật

- **BackEnd:** Có thể thêm method trong `UserRepository` dạng `@Query("SELECT ... FROM User u WHERE ... GROUP BY ...")` trả về list/DTO theo tháng, hoặc dùng `UserService` + aggregation. Đảm bảo format `month` giống với cách Admin hiển thị (T1–T12 hoặc 2025-01).
- **Admin:** Đã có sẵn state `userGrowth` và component LineChart; chỉ cần gọi API và `setUserGrowth(response.data.data)` (hoặc tương đương theo cấu trúc ApiResponse).
- **Security:** Endpoint mới cần được cấu hình cho role ADMIN (ví dụ nếu dùng `/api/v1/admin/**` thì đã có trong SecurityConfig).

---

## Tài liệu / file liên quan

- `Admin/src/features/dashboard/DashboardPage.tsx` – component Dashboard, state `userGrowth`, LineChart.
- `BackEnd/.../UserRepository.java` – (hoặc UserService) – nơi thêm/truy vấn thống kê theo tháng.
- `BackEnd/.../SecurityConfig.java` – cấu hình permit/role cho endpoint mới (nếu không dùng `/admin/**`).
