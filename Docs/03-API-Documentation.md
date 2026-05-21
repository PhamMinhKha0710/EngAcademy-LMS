# 📡 EngAcademy LMS — API Documentation

> **Version:** 1.0  
> **Last Updated:** 2026-05-21  
> **Base URL:** `http://localhost:8080/api/v1`  
> **Swagger UI:** `http://localhost:8080/swagger-ui.html`

---

## 1. Quy Ước Chung

### 1.1. Response Format

Mọi API response đều tuân theo cấu trúc `ApiResponse<T>`:

```json
{
  "success": true,
  "message": "Thành công",
  "data": { ... }
}
```

Khi lỗi:

```json
{
  "success": false,
  "message": "Mô tả lỗi",
  "data": null
}
```

### 1.2. Authentication

- Tất cả API (trừ `/auth/**` và `/public/**`) yêu cầu JWT Bearer Token
- Header: `Authorization: Bearer <access_token>`

### 1.3. Pagination

Các API hỗ trợ phân trang sử dụng Spring Pageable:

```
GET /api/v1/users?page=0&size=20&sort=createdAt,desc
```

---

## 2. Authentication APIs (`/api/v1/auth`)

| Method | Endpoint | Auth | Mô Tả |
|:---|:---|:---:|:---|
| `POST` | `/auth/register` | ❌ | Đăng ký tài khoản mới |
| `POST` | `/auth/login` | ❌ | Đăng nhập |
| `POST` | `/auth/refresh-token` | ❌ | Làm mới access token |
| `POST` | `/auth/logout` | ✅ | Đăng xuất (blacklist token) |
| `POST` | `/auth/forgot-password` | ❌ | Gửi OTP về email |
| `POST` | `/auth/reset-password` | ❌ | Đặt lại mật khẩu bằng OTP |
| `POST` | `/auth/google` | ❌ | Đăng nhập bằng Google OAuth2 |
| `GET` | `/auth/health` | ❌ | Health check server |

### Request/Response Examples:

**POST `/auth/register`**
```json
// Request
{
  "username": "student1",
  "email": "student1@example.com",
  "password": "Student@123",
  "fullName": "Nguyễn Văn A"
}

// Response 201
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi...",
    "tokenType": "Bearer",
    "user": { "id": 1, "username": "student1", ... }
  }
}
```

**POST `/auth/login`**
```json
// Request
{
  "username": "student1",
  "password": "Student@123"
}

// Response 200
{
  "success": true,
  "message": "Đăng nhập thành công",
  "data": {
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "eyJhbGciOi..."
  }
}
```

---

## 3. User Management APIs (`/api/v1/users`)

| Method | Endpoint | Roles | Mô Tả |
|:---|:---|:---:|:---|
| `GET` | `/users/me` | Any | Lấy thông tin user hiện tại |
| `PATCH` | `/users/me` | Any | Cập nhật profile (fullName, avatarUrl) |
| `PATCH` | `/users/me/password` | Any | Đổi mật khẩu |
| `GET` | `/users/me/settings` | Any | Lấy cài đặt cá nhân |
| `PUT` | `/users/me/settings` | Any | Cập nhật cài đặt |
| `GET` | `/users/me/audit-logs` | Any | Xem nhật ký hoạt động |
| `GET` | `/users` | ADMIN, SCHOOL | Danh sách users (phân trang) |
| `GET` | `/users/{id}` | ADMIN, SCHOOL | Lấy user theo ID |
| `POST` | `/users` | ADMIN, SCHOOL | Tạo user mới |
| `PUT` | `/users/{id}` | ADMIN, SCHOOL | Cập nhật user |
| `DELETE` | `/users/{id}` | ADMIN, SCHOOL | Xóa user |
| `POST` | `/users/{id}/coins` | ADMIN, TEACHER | Thêm xu |
| `GET` | `/users/students` | ADMIN, SCHOOL, TEACHER | Tìm kiếm học sinh |
| `GET` | `/users/teachers` | ADMIN, SCHOOL | Tìm kiếm giáo viên |
| `GET` | `/users/stats` | ADMIN | Thống kê tổng hợp |

---

## 4. School Management APIs (`/api/v1/schools`)

| Method | Endpoint | Roles | Mô Tả |
|:---|:---|:---:|:---|
| `GET` | `/schools` | ADMIN, SCHOOL | Danh sách trường (SCHOOL chỉ thấy trường mình) |
| `GET` | `/schools/active` | ADMIN, SCHOOL | Trường đang hoạt động (phân trang) |
| `GET` | `/schools/{id}` | ADMIN, SCHOOL | Chi tiết trường |
| `GET` | `/schools/search?name=` | ADMIN, SCHOOL | Tìm kiếm trường theo tên |
| `POST` | `/schools` | ADMIN | Tạo trường mới |
| `PUT` | `/schools/{id}` | ADMIN, SCHOOL | Cập nhật trường |
| `DELETE` | `/schools/{id}` | ADMIN | Soft delete |
| `DELETE` | `/schools/{id}/permanent` | ADMIN | Hard delete |

---

## 5. Classroom Management APIs (`/api/v1/classes`)

| Method | Endpoint | Roles | Mô Tả |
|:---|:---|:---:|:---|
| `GET` | `/classes` | ADMIN, SCHOOL, TEACHER | Danh sách lớp |
| `GET` | `/classes/school/{schoolId}` | ADMIN, SCHOOL, TEACHER | Lớp theo trường (phân trang) |
| `GET` | `/classes/teacher/{teacherId}` | ADMIN, SCHOOL, TEACHER | Lớp theo giáo viên |
| `GET` | `/classes/student/{studentId}` | ADMIN, SCHOOL, TEACHER, STUDENT | Lớp của học sinh |
| `GET` | `/classes/{id}` | ADMIN, SCHOOL, TEACHER, STUDENT | Chi tiết lớp |
| `GET` | `/classes/{id}/students` | ADMIN, SCHOOL, TEACHER | Danh sách học sinh trong lớp |
| `POST` | `/classes` | ADMIN, SCHOOL | Tạo lớp mới |
| `PUT` | `/classes/{id}` | ADMIN, SCHOOL | Cập nhật lớp |
| `DELETE` | `/classes/{id}` | ADMIN, SCHOOL | Xóa lớp |
| `POST` | `/classes/{id}/students/{studentId}` | ADMIN, SCHOOL, TEACHER | Thêm học sinh vào lớp |
| `DELETE` | `/classes/{id}/students/{studentId}` | ADMIN, SCHOOL, TEACHER | Xóa học sinh khỏi lớp |

---

## 6. Lesson Management APIs (`/api/v1/lessons`)

| Method | Endpoint | Roles | Mô Tả |
|:---|:---|:---:|:---|
| `GET` | `/lessons` | Any Auth | Danh sách bài học (phân trang) |
| `GET` | `/lessons/{id}` | Any Auth | Chi tiết bài học |
| `GET` | `/lessons?published=true` | Any Auth | Bài học đã xuất bản |
| `GET` | `/lessons?topicId=X` | Any Auth | Lọc theo chủ đề |
| `GET` | `/lessons?difficultyLevel=X` | Any Auth | Lọc theo độ khó |
| `POST` | `/lessons` | ADMIN, TEACHER | Tạo bài học |
| `PUT` | `/lessons/{id}` | ADMIN, TEACHER | Cập nhật bài học |
| `DELETE` | `/lessons/{id}` | ADMIN | Xóa bài học |

---

## 7. Vocabulary & Flashcard APIs (`/api/v1/vocabulary`)

| Method | Endpoint | Roles | Mô Tả |
|:---|:---|:---:|:---|
| `GET` | `/vocabulary/lesson/{lessonId}` | ADMIN, TEACHER, STUDENT | Từ vựng theo bài học |
| `GET` | `/vocabulary/lesson/{lessonId}/paged` | ADMIN, TEACHER, STUDENT | Phân trang |
| `GET` | `/vocabulary/topic/{topicId}` | ADMIN, TEACHER, STUDENT | Từ vựng theo chủ đề |
| `GET` | `/vocabulary/{id}` | ADMIN, TEACHER, STUDENT | Chi tiết từ vựng |
| `GET` | `/vocabulary/search?keyword=` | ADMIN, TEACHER, STUDENT | Tìm kiếm từ vựng |
| `GET` | `/vocabulary/flashcards/{lessonId}` | STUDENT, TEACHER | Flashcard theo bài |
| `GET` | `/vocabulary/flashcards/random` | STUDENT, TEACHER | Flashcard ngẫu nhiên |
| `POST` | `/vocabulary` | ADMIN, TEACHER | Tạo từ vựng |
| `PUT` | `/vocabulary/{id}` | ADMIN, TEACHER | Cập nhật từ vựng |
| `DELETE` | `/vocabulary/{id}` | ADMIN, TEACHER | Xóa từ vựng |
| `POST` | `/vocabulary/review` | STUDENT, TEACHER | Review từ (đúng/sai) |
| `GET` | `/vocabulary/learned` | Any Auth | Từ đã thuộc |
| `GET` | `/vocabulary/learned/count` | Any Auth | Số từ đã thuộc |

---

## 8. Exam System APIs (`/api/v1/exams`)

| Method | Endpoint | Roles | Mô Tả |
|:---|:---|:---:|:---|
| `GET` | `/exams` | ADMIN, SCHOOL | Danh sách đề thi |
| `GET` | `/exams/teacher/{teacherId}` | ADMIN, SCHOOL, TEACHER | Đề thi theo giáo viên |
| `GET` | `/exams/class/{classId}` | ALL | Đề thi theo lớp |
| `GET` | `/exams/class/{classId}/active` | TEACHER, STUDENT | Đề thi đang mở |
| `GET` | `/exams/{id}` | ADMIN, SCHOOL, TEACHER | Chi tiết đề thi (có đáp án) |
| `GET` | `/exams/{id}/take` | STUDENT | Đề thi cho học sinh (ẩn đáp án) |
| `POST` | `/exams` | ADMIN, TEACHER, SCHOOL | Tạo đề thi |
| `PUT` | `/exams/{id}` | ADMIN, TEACHER, SCHOOL | Cập nhật đề thi |
| `DELETE` | `/exams/{id}` | ADMIN, TEACHER, SCHOOL | Xóa đề thi |
| `POST` | `/exams/{id}/publish` | ADMIN, TEACHER | Công bố đề |
| `POST` | `/exams/{id}/close` | ADMIN, TEACHER | Đóng đề thi |
| `POST` | `/exams/{id}/publish-scores` | ADMIN, TEACHER | Công bố điểm |
| `POST` | `/exams/submit` | STUDENT | Nộp bài (legacy) |
| `GET` | `/exams/{id}/results` | ADMIN, SCHOOL, TEACHER | Kết quả thi |
| `GET` | `/exams/{id}/my-result` | STUDENT | Kết quả thi của mình |

### Anti-Cheat Endpoints:

| Method | Endpoint | Roles | Mô Tả |
|:---|:---|:---:|:---|
| `POST` | `/exams/{examId}/start` | STUDENT | Bắt đầu làm bài (tạo phiên thi) |
| `POST` | `/exams/{examId}/anti-cheat-event` | STUDENT | Ghi nhận sự kiện gian lận |
| `POST` | `/exams/{examId}/submit-anticheat` | STUDENT | Nộp bài với anti-cheat |
| `GET` | `/exams/results/{resultId}/anti-cheat-events` | TEACHER, ADMIN, SCHOOL | Lịch sử vi phạm |

---

## 9. SRS APIs (`/api/v1/srs`)

| Method | Endpoint | Roles | Mô Tả |
|:---|:---|:---:|:---|
| `GET` | `/srs/due-today` | Any Auth | Flashcard cần ôn hôm nay |
| `POST` | `/srs/review` | Any Auth | Submit review (quality 0-5) |

---

## 10. Placement Test APIs (`/api/v1/placement`)

| Method | Endpoint | Roles | Mô Tả |
|:---|:---|:---:|:---|
| `POST` | `/placement/session` | Any Auth | Tạo phiên placement mới |
| `GET` | `/placement/question?sessionId=` | Any Auth | Lấy câu hỏi tiếp theo (adaptive) |
| `POST` | `/placement/answer?sessionId=` | Any Auth | Gửi đáp án |
| `GET` | `/placement/result?sessionId=` | Any Auth | Kết quả placement |

---

## 11. Progress Tracking APIs (`/api/v1/progress`)

| Method | Endpoint | Roles | Mô Tả |
|:---|:---|:---:|:---|
| `GET` | `/progress/me` | ADMIN, TEACHER, STUDENT | Tiến độ của mình |
| `GET` | `/progress/user/{userId}` | ADMIN, TEACHER | Tiến độ của user |
| `GET` | `/progress/me/completed` | ADMIN, TEACHER, STUDENT | Bài đã hoàn thành |
| `GET` | `/progress/me/in-progress` | ADMIN, TEACHER, STUDENT | Bài đang học |
| `GET` | `/progress/me/lesson/{lessonId}` | ADMIN, TEACHER, STUDENT | Tiến độ bài cụ thể |
| `POST` | `/progress/me/lesson/{lessonId}` | STUDENT | Cập nhật tiến độ |
| `POST` | `/progress/me/lesson/{lessonId}/complete` | STUDENT | Hoàn thành bài |
| `GET` | `/progress/me/stats` | ADMIN, TEACHER, STUDENT | Thống kê học tập |

---

## 12. Gamification APIs

### Badges (`/api/v1/badges`)

| Method | Endpoint | Roles | Mô Tả |
|:---|:---|:---:|:---|
| `GET` | `/badges/me` | STUDENT | Huy hiệu của mình |
| `GET` | `/badges/me/earned` | STUDENT | Badge đã đạt |
| `GET` | `/badges/me/progress` | STUDENT | Tiến trình badge |
| `POST` | `/badges/me/check` | STUDENT | Kiểm tra & trao badge |
| `GET` | `/badges/definitions` | Public | Danh sách badge definitions |
| `GET` | `/badges/users/{userId}` | TEACHER, ADMIN | Badge của user |
| `POST` | `/badges/{userId}/award/{badgeName}` | ADMIN, SCHOOL, TEACHER | Cấp badge |

### Daily Quests (`/api/v1/quests`)

| Method | Endpoint | Roles | Mô Tả |
|:---|:---|:---:|:---|
| `GET` | `/quests/today` | Any Auth | Quest hôm nay |
| `POST` | `/quests` | Any Auth | Tạo quest tùy chỉnh |
| `PATCH` | `/quests/tasks/{taskId}` | Any Auth | Cập nhật task progress |
| `POST` | `/quests/complete` | Any Auth | Hoàn thành quest |
| `GET` | `/quests/history` | Any Auth | Lịch sử quest |

### Leaderboard (`/api/v1/leaderboard`)

| Method | Endpoint | Roles | Mô Tả |
|:---|:---|:---:|:---|
| `GET` | `/leaderboard/coins` | Public | Xếp hạng theo xu |
| `GET` | `/leaderboard/streak` | Public | Xếp hạng theo streak |
| `GET` | `/leaderboard/global` | Public | Xếp hạng tổng hợp |
| `GET` | `/leaderboard/top` | Public | Top users |
| `GET` | `/leaderboard/me` | Any Auth | Vị trí của mình |
| `GET` | `/leaderboard/around-me` | Any Auth | Xếp hạng xung quanh mình |

---

## 13. Notification APIs (`/api/v1/notifications`)

| Method | Endpoint | Roles | Mô Tả |
|:---|:---|:---:|:---|
| `GET` | `/notifications/me` | Any Auth | Thông báo của mình |
| `GET` | `/notifications/me/unread-count` | Any Auth | Số chưa đọc |
| `PUT` | `/notifications/me/read-all` | Any Auth | Đánh dấu tất cả đã đọc |
| `PUT` | `/notifications/me/{id}/read` | Any Auth | Đánh dấu 1 thông báo đã đọc |
| `DELETE` | `/notifications/me/{id}` | Any Auth | Xóa thông báo |
| `POST` | `/notifications/broadcast` | ADMIN, SCHOOL | Broadcast thông báo |
| `POST` | `/notifications/send/{userId}` | ADMIN, SCHOOL, TEACHER | Gửi thông báo riêng |

---

## 14. Các API Bổ Sung

### Question (`/api/v1/questions`)
CRUD câu hỏi — ADMIN, TEACHER

### Topic (`/api/v1/topics`)
CRUD chủ đề — ADMIN, TEACHER

### Mistake Notebook (`/api/v1/mistakes`)
Quản lý sổ ghi chép lỗi sai — STUDENT

### Learning Profile (`/api/v1/learning-profile`)
Hồ sơ học tập CEFR — Any Auth

### Recommendation (`/api/v1/recommendations`)
Đề xuất học tập cá nhân hóa — Any Auth

### Dashboard (`/api/v1/dashboard`)
Thống kê tổng quan — ADMIN

### Learning Events (`/api/v1/learning-events`)
Ghi nhận sự kiện học tập — Any Auth

---

## 15. HTTP Status Codes

| Code | Ý Nghĩa |
|:---|:---|
| `200` | Thành công |
| `201` | Tạo mới thành công |
| `400` | Bad Request — dữ liệu không hợp lệ |
| `401` | Unauthorized — token hết hạn hoặc không có |
| `403` | Forbidden — không có quyền truy cập |
| `404` | Not Found — resource không tồn tại |
| `409` | Conflict — dữ liệu trùng lặp |
| `429` | Too Many Requests — vượt rate limit |
| `500` | Internal Server Error |
