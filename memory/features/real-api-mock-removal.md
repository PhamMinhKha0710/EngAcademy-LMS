# Real API – Bỏ mock data, dùng API thật và public stats

## Mô tả vấn đề

Admin và FrontEnd ban đầu dùng mock data (hardcode array, fake response). Cần chuyển sang gọi API backend thật, đồng thời thêm public stats và dashboard với dữ liệu thực.

## Nguyên nhân

- Giai đoạn đầu: dev UI trước khi API sẵn sàng.
- Khi API đã có: cần remove mock, kết nối API thật.

## Cách debug

1. Kiểm tra code: tìm `mock`, `fake`, `MOCK_`, array hardcode trong component.
2. Network tab: request có gọi API thật không, hay chỉ dùng local state.
3. GradesPage, Dashboard: trước đây dùng `ExamResultResponse[]` mock.

## Giải pháp

1. **Admin**: GradesPage gọi `GET /exams`, `GET /exams/{id}/results`. Dashboard gọi API stats (users, schools, lessons, classes, leaderboard).
2. **FrontEnd**: Các trang student/teacher gọi API thật qua api client.
3. **Public stats**: Có thể thêm endpoint public cho dashboard (nếu cần hiển thị số liệu không cần auth).
4. Xóa toàn bộ mock data, fake response.

Commit: c21e340. Liên quan: `Admin/src/features/grades/GradesPage.tsx`, `DashboardPage.tsx`, api clients.

## Code mẫu (nếu có)

```ts
// Trước: mock
const [grades] = useState<ExamResultResponse[]>([...mockData])

// Sau: API
const fetchGrades = async () => {
  const exams = await api.get('/exams')
  const results = await Promise.all(exams.data.map(e => api.get(`/exams/${e.id}/results`)))
  setGrades(results.flatMap(r => r.data))
}
```

## Bài học rút ra

- Mock giúp dev nhanh nhưng phải có plan chuyển sang API thật.
- Đặt TODO hoặc comment "TODO: replace mock with API" khi dùng mock.

## Cách phòng tránh sau này

1. Ưu tiên API-first: định nghĩa contract (OpenAPI) trước, mock từ contract.
2. Integration test: verify UI gọi đúng endpoint, nhận đúng format.
