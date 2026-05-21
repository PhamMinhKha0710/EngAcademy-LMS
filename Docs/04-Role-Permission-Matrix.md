# 🔐 EngAcademy LMS — Role Permission Matrix

> **Version:** 1.0  
> **Last Updated:** 2026-05-21

---

## 1. Danh Sách Vai Trò

| # | Role Constant | Tên Hiển Thị | Mô Tả |
|:---|:---|:---|:---|
| 1 | `ROLE_ADMIN` | Administrator | Quản trị viên toàn hệ thống, toàn quyền |
| 2 | `ROLE_SCHOOL` | School Manager | Quản lý trường học, chỉ thao tác dữ liệu thuộc trường mình |
| 3 | `ROLE_TEACHER` | Teacher | Giáo viên, quản lý nội dung và lớp mình phụ trách |
| 4 | `ROLE_STUDENT` | Student | Học sinh, sử dụng hệ thống học tập |

---

## 2. Ma Trận Quyền Truy Cập Chi Tiết

### Ký hiệu:
- ✅ = Được phép
- ❌ = Không được phép
- 🔒 = Được phép nhưng **giới hạn scope** (chỉ dữ liệu thuộc trường/lớp/bản thân mình)

---

### 2.1. Authentication & Profile

| Hành Động | ADMIN | SCHOOL | TEACHER | STUDENT | Không đăng nhập |
|:---|:---:|:---:|:---:|:---:|:---:|
| Đăng ký tài khoản | — | — | — | — | ✅ |
| Đăng nhập | ✅ | ✅ | ✅ | ✅ | — |
| Làm mới token | ✅ | ✅ | ✅ | ✅ | — |
| Đăng xuất | ✅ | ✅ | ✅ | ✅ | — |
| Quên/đặt lại mật khẩu | — | — | — | — | ✅ |
| Đăng nhập Google | — | — | — | — | ✅ |
| Xem profile `/me` | ✅ | ✅ | ✅ | ✅ | ❌ |
| Cập nhật profile `/me` | ✅ | ✅ | ✅ | ✅ | ❌ |
| Đổi mật khẩu | ✅ | ✅ | ✅ | ✅ | ❌ |
| Cài đặt cá nhân (settings) | ✅ | ✅ | ✅ | ✅ | ❌ |
| Xem audit log của mình | ✅ | ✅ | ✅ | ✅ | ❌ |

### 2.2. User Management

| Hành Động | ADMIN | SCHOOL | TEACHER | STUDENT |
|:---|:---:|:---:|:---:|:---:|
| Xem danh sách tất cả users | ✅ | 🔒 Chỉ trường mình | ❌ | ❌ |
| Xem chi tiết user theo ID | ✅ | 🔒 Chỉ trường mình | ❌ | ❌ |
| Tạo tài khoản mới | ✅ | 🔒 Chỉ tạo cho trường mình | ❌ | ❌ |
| Cập nhật user | ✅ | 🔒 Chỉ trường mình | ❌ | ❌ |
| Xóa user | ✅ | 🔒 Chỉ trường mình | ❌ | ❌ |
| Thêm xu cho user | ✅ | ❌ | ✅ | ❌ |
| Tìm kiếm học sinh | ✅ | 🔒 Chỉ trường mình | 🔒 Chỉ trường mình | ❌ |
| Tìm kiếm giáo viên | ✅ | 🔒 Chỉ trường mình | ❌ | ❌ |
| Xem thống kê admin | ✅ | ❌ | ❌ | ❌ |

### 2.3. School Management

| Hành Động | ADMIN | SCHOOL | TEACHER | STUDENT |
|:---|:---:|:---:|:---:|:---:|
| Xem danh sách trường | ✅ Tất cả | 🔒 Chỉ trường mình | ❌ | ❌ |
| Xem chi tiết trường | ✅ | 🔒 Chỉ trường mình | ❌ | ❌ |
| Tạo trường mới | ✅ | ❌ | ❌ | ❌ |
| Cập nhật trường | ✅ | 🔒 Chỉ trường mình | ❌ | ❌ |
| Xóa trường (soft) | ✅ | ❌ | ❌ | ❌ |
| Xóa trường (hard) | ✅ | ❌ | ❌ | ❌ |
| Tìm kiếm trường | ✅ | 🔒 | ❌ | ❌ |

### 2.4. Classroom Management

| Hành Động | ADMIN | SCHOOL | TEACHER | STUDENT |
|:---|:---:|:---:|:---:|:---:|
| Xem danh sách lớp | ✅ Tất cả | 🔒 Chỉ trường mình | ✅ | ❌ |
| Xem lớp theo trường | ✅ | 🔒 Chỉ trường mình | ✅ | ❌ |
| Xem lớp theo giáo viên | ✅ | 🔒 Chỉ trường mình | ✅ | ❌ |
| Xem lớp theo học sinh | ✅ | ✅ | ✅ | 🔒 Chỉ lớp mình |
| Xem chi tiết lớp | ✅ | ✅ | ✅ | 🔒 Chỉ lớp mình |
| Xem học sinh trong lớp | ✅ | ✅ | ✅ | ❌ |
| Tạo lớp | ✅ | 🔒 Chỉ trường mình | ❌ | ❌ |
| Cập nhật lớp | ✅ | 🔒 Chỉ trường mình | ❌ | ❌ |
| Xóa lớp | ✅ | 🔒 Chỉ trường mình | ❌ | ❌ |
| Thêm học sinh vào lớp | ✅ | ✅ | ✅ | ❌ |
| Xóa học sinh khỏi lớp | ✅ | ✅ | ✅ | ❌ |

### 2.5. Lesson & Content Management

| Hành Động | ADMIN | SCHOOL | TEACHER | STUDENT |
|:---|:---:|:---:|:---:|:---:|
| Xem bài học (danh sách/chi tiết) | ✅ | ✅ | ✅ | ✅ |
| Tạo bài học | ✅ | ❌ | ✅ | ❌ |
| Cập nhật bài học | ✅ | ❌ | ✅ | ❌ |
| Xóa bài học | ✅ | ❌ | ❌ | ❌ |
| Xem từ vựng | ✅ | ❌ | ✅ | ✅ |
| Tạo/sửa/xóa từ vựng | ✅ | ❌ | ✅ | ❌ |
| Xem flashcard | ❌ | ❌ | ✅ | ✅ |
| Review từ vựng (đúng/sai) | ❌ | ❌ | ✅ | ✅ |
| Xem câu hỏi | ✅ | ❌ | ✅ | ✅ |
| Tạo/sửa/xóa câu hỏi | ✅ | ❌ | ✅ | ❌ |

### 2.6. Exam Management

| Hành Động | ADMIN | SCHOOL | TEACHER | STUDENT |
|:---|:---:|:---:|:---:|:---:|
| Xem danh sách đề thi | ✅ | 🔒 Chỉ trường mình | ❌ | ❌ |
| Xem đề thi theo giáo viên | ✅ | 🔒 GV trường mình | ✅ | ❌ |
| Xem đề thi theo lớp | ✅ | 🔒 Lớp trường mình | 🔒 Lớp trường mình | 🔒 Lớp mình học |
| Xem đề thi đang mở | ❌ | ❌ | ✅ | ✅ |
| Xem chi tiết đề (có đáp án) | ✅ | 🔒 Trường mình | ✅ | ❌ |
| Xem đề thi để làm bài (ẩn đáp án) | ❌ | ❌ | ❌ | ✅ |
| Tạo đề thi | ✅ | 🔒 GV trường mình | ✅ | ❌ |
| Cập nhật đề thi | ✅ | 🔒 Trường mình | ✅ | ❌ |
| Xóa đề thi | ✅ | 🔒 Trường mình | ✅ | ❌ |
| Công bố / Đóng đề | ✅ | ❌ | ✅ | ❌ |
| Công bố điểm | ✅ | ❌ | ✅ | ❌ |
| Nộp bài thi | ❌ | ❌ | ❌ | ✅ |
| Xem kết quả thi | ✅ | 🔒 Trường mình | ✅ | ❌ |
| Xem kết quả thi của mình | ❌ | ❌ | ❌ | ✅ |

### 2.7. Anti-Cheat

| Hành Động | ADMIN | SCHOOL | TEACHER | STUDENT |
|:---|:---:|:---:|:---:|:---:|
| Bắt đầu phiên thi | ❌ | ❌ | ❌ | ✅ |
| Ghi nhận sự kiện gian lận | ❌ | ❌ | ❌ | ✅ (tự động) |
| Nộp bài với anti-cheat | ❌ | ❌ | ❌ | ✅ |
| Xem lịch sử vi phạm | ✅ | ✅ | ✅ | ❌ |

### 2.8. SRS & Placement

| Hành Động | ADMIN | SCHOOL | TEACHER | STUDENT |
|:---|:---:|:---:|:---:|:---:|
| Xem flashcard cần ôn | ✅ | ✅ | ✅ | ✅ |
| Submit SRS review | ✅ | ✅ | ✅ | ✅ |
| Tạo phiên placement | ✅ | ✅ | ✅ | ✅ |
| Làm bài placement test | ✅ | ✅ | ✅ | ✅ |

### 2.9. Progress & Analytics

| Hành Động | ADMIN | SCHOOL | TEACHER | STUDENT |
|:---|:---:|:---:|:---:|:---:|
| Xem tiến độ của mình | ✅ | ✅ | ✅ | ✅ |
| Xem tiến độ user khác | ✅ | ❌ | ✅ | ❌ |
| Cập nhật tiến độ bài học | ❌ | ❌ | ❌ | ✅ |
| Hoàn thành bài học | ❌ | ❌ | ❌ | ✅ |
| Xem thống kê học tập | ✅ | ❌ | ✅ | ✅ |
| Xem hồ sơ học tập (CEFR) | ✅ | ✅ | ✅ | ✅ |

### 2.10. Gamification

| Hành Động | ADMIN | SCHOOL | TEACHER | STUDENT |
|:---|:---:|:---:|:---:|:---:|
| Xem badge của mình | — | — | — | ✅ |
| Xem badge user khác | ✅ | ❌ | ✅ | ❌ |
| Tạo badge definition | ✅ | ❌ | ❌ | ❌ |
| Cấp badge cho user | ✅ | ✅ | ✅ | ❌ |
| Kiểm tra & trao badge | ✅ | ✅ | ❌ | ✅ |
| Quest hôm nay | ✅ | ✅ | ✅ | ✅ |
| Xem leaderboard | ✅ | ✅ | ✅ | ✅ |

### 2.11. Notifications

| Hành Động | ADMIN | SCHOOL | TEACHER | STUDENT |
|:---|:---:|:---:|:---:|:---:|
| Xem thông báo của mình | ✅ | ✅ | ✅ | ✅ |
| Đánh dấu đã đọc | ✅ | ✅ | ✅ | ✅ |
| Xóa thông báo | ✅ | ✅ | ✅ | ✅ |
| Broadcast thông báo | ✅ | ✅ | ❌ | ❌ |
| Gửi thông báo cá nhân | ✅ | ✅ | ✅ | ❌ |

---

## 3. Quy Tắc Scope Isolation (Multi-School)

### 3.1. ROLE_SCHOOL Scope Rules

```
RULE 1: School Manager chỉ xem/tạo/sửa/xóa dữ liệu thuộc schoolId của mình
RULE 2: Khi tạo user mới, schoolId tự động gán = schoolId của School Manager
RULE 3: Khi xem danh sách, hệ thống tự filter theo schoolId
RULE 4: Không thể truy cập resource có schoolId khác → HTTP 403
```

### 3.2. ROLE_TEACHER Scope Rules

```
RULE 1: Teacher xem lớp theo schoolId của mình
RULE 2: Teacher tạo nội dung (bài học, câu hỏi, đề thi) không giới hạn trường
RULE 3: Teacher xem tiến độ học sinh bất kỳ (cần cải thiện scope)
```

### 3.3. ROLE_STUDENT Scope Rules

```
RULE 1: Student chỉ xem đề thi của lớp mình tham gia (enrollment check)
RULE 2: Student chỉ nộp bài cho chính mình (studentId == authenticatedUserId)
RULE 3: Student chỉ xem kết quả thi của mình
RULE 4: Student chỉ cập nhật tiến độ và profile của mình
```

---

## 4. Cơ Chế Bảo Mật Phân Quyền

| Layer | Cơ Chế | Mô Tả |
|:---|:---|:---|
| **Filter Chain** | `JwtAuthenticationFilter` | Trích xuất và validate JWT token trên mỗi request |
| **Method Security** | `@PreAuthorize` annotation | Kiểm tra role trên từng endpoint |
| **Business Logic** | Service-level checks | Kiểm tra schoolId, enrollment, ownership trong code |
| **Database** | `@UniqueConstraint` | Ràng buộc dữ liệu cấp DB (exam+student unique) |
| **Rate Limiting** | `RateLimitFilter` | Giới hạn tần suất request theo IP |
| **WebSocket** | `WebSocketChannelInterceptor` | JWT validation cho kết nối STOMP |
