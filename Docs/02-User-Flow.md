# 👤 EngAcademy LMS — User Flow

> **Version:** 1.0  
> **Last Updated:** 2026-05-21

---

## 1. Tổng Quan Vai Trò & Luồng Người Dùng

Hệ thống có **4 vai trò** chính, mỗi vai trò có luồng sử dụng riêng biệt:

| Vai Trò | Mã Vai Trò | Mô Tả |
|:---|:---|:---|
| **Admin** | `ROLE_ADMIN` | Quản trị viên hệ thống toàn cục — quản lý mọi trường, người dùng, nội dung |
| **School** | `ROLE_SCHOOL` | Quản lý trường học — quản lý giáo viên, lớp, học sinh thuộc trường mình |
| **Teacher** | `ROLE_TEACHER` | Giáo viên — tạo bài học, đề thi, quản lý lớp học |
| **Student** | `ROLE_STUDENT` | Học sinh — học bài, thi, ôn tập, gamification |

---

## 2. Luồng Admin (System Administrator)

```mermaid
flowchart TD
    A[🔐 Đăng nhập] --> B[📊 Dashboard Admin]
    B --> C[🏫 Quản lý Trường học]
    B --> D[👤 Quản lý Người dùng]
    B --> E[📖 Quản lý Nội dung]
    B --> F[📈 Thống kê Hệ thống]
    
    C --> C1[Tạo trường mới]
    C --> C2[Sửa/Xóa trường]
    C --> C3[Liên kết tài khoản SCHOOL]
    
    D --> D1[Tạo tài khoản mới với vai trò]
    D --> D2[Tìm kiếm / Lọc người dùng]
    D --> D3[Cập nhật / Xóa người dùng]
    D --> D4[Thêm xu cho người dùng]
    D --> D5[Xem Audit Logs]
    
    E --> E1[Quản lý Chủ đề]
    E --> E2[Quản lý Bài học]
    E --> E3[Quản lý Câu hỏi]
    E --> E4[Quản lý Badge Definitions]
```

### Các thao tác chính của Admin:
1. **Đăng nhập** → `POST /api/v1/auth/login`
2. **Tạo trường học** → `POST /api/v1/schools`
3. **Tạo tài khoản School Manager** → `POST /api/v1/users` (role = `ROLE_SCHOOL`, gán schoolId)
4. **Quản lý nội dung toàn cục** — Bài học, chủ đề, từ vựng, câu hỏi
5. **Xem thống kê tổng hợp** → `GET /api/v1/users/stats`

---

## 3. Luồng School Manager (Quản Lý Trường)

```mermaid
flowchart TD
    A[🔐 Đăng nhập] --> B[📊 Dashboard Trường]
    B --> C[👩‍🏫 Quản lý Giáo viên]
    B --> D[📚 Quản lý Lớp học]
    B --> E[👨‍🎓 Quản lý Học sinh]
    B --> F[📝 Quản lý Bài thi]
    B --> G[🔔 Gửi Thông báo]
    
    C --> C1[Tạo tài khoản giáo viên]
    C --> C2[Tìm kiếm giáo viên]
    C --> C3[Gán giáo viên vào lớp]
    
    D --> D1[Tạo lớp học mới]
    D --> D2[Gán giáo viên chủ nhiệm]
    D --> D3[Thêm học sinh vào lớp]
    D --> D4[Xem danh sách học sinh trong lớp]
    
    E --> E1[Tạo tài khoản học sinh]
    E --> E2[Tìm kiếm học sinh]
    
    F --> F1[Xem đề thi của trường]
    F --> F2[Xem kết quả thi]
    
    G --> G1[Broadcast thông báo toàn trường]
    G --> G2[Gửi thông báo đến lớp]
```

### Quy tắc quan trọng:
- School Manager **chỉ nhìn thấy** dữ liệu thuộc trường mình (`schoolId` filtering)
- Không thể truy cập dữ liệu của trường khác (Multi-school Isolation)

---

## 4. Luồng Giáo Viên (Teacher)

```mermaid
flowchart TD
    A[🔐 Đăng nhập] --> B[📊 Dashboard Giáo viên]
    B --> C[📚 Quản lý Lớp học]
    B --> D[📖 Quản lý Bài học]
    B --> E[📝 Quản lý Đề thi]
    B --> F[📊 Xem Tiến độ Học sinh]
    B --> G[🔔 Gửi Thông báo]
    
    C --> C1[Xem danh sách lớp mình phụ trách]
    C --> C2[Xem học sinh trong lớp]
    
    D --> D1[Tạo bài học mới]
    D --> D2[Thêm từ vựng vào bài học]
    D --> D3[Tạo câu hỏi cho bài học]
    D --> D4[Xuất bản bài học]
    
    E --> E1[Tạo đề thi cho lớp]
    E --> E2[Thêm câu hỏi vào đề thi]
    E --> E3[Công bố đề thi]
    E --> E4[Đóng đề thi]
    E --> E5[Công bố điểm]
    E --> E6[Xem kết quả & sự kiện Anti-cheat]
    
    F --> F1[Xem tiến độ học tập]
    F --> F2[Xem thống kê bài học]
```

### Luồng tạo và quản lý đề thi:
```
Tạo đề thi (DRAFT) → Thêm câu hỏi → Công bố (PUBLISHED) → Học sinh làm bài → Đóng (CLOSED) → Công bố điểm
```

---

## 5. Luồng Học Sinh (Student) — Chi Tiết Nhất

### 5.1. Luồng Onboarding (Lần đầu sử dụng)

```mermaid
flowchart TD
    A[📝 Đăng ký tài khoản] --> B{Được gán vào trường?}
    B -->|Có| C[🎯 Bài kiểm tra xếp lớp Placement Test]
    B -->|Không| C
    C --> D[Trả lời câu hỏi thích ứng theo 4 kỹ năng]
    D --> E[Hệ thống xác định CEFR Level: A1-C2]
    E --> F[Tạo Learning Profile với mức độ từng kỹ năng]
    F --> G[🏠 Trang chủ học sinh]
```

### 5.2. Luồng Học Bài

```mermaid
flowchart TD
    A[🏠 Trang chủ] --> B[📚 Chọn Chủ đề / Bài học]
    B --> C[📖 Xem nội dung bài học]
    C --> D[📘 Học Từ vựng mới]
    D --> E[❓ Làm bài tập / Quiz]
    E --> F{Kết quả}
    F -->|Đúng| G[✅ Cập nhật Progress + Coins + Streak]
    F -->|Sai| H[📓 Thêm vào Mistake Notebook]
    G --> I[🔄 Từ vựng vào hệ thống SRS để ôn sau]
    H --> I
    I --> J[🏆 Kiểm tra & Trao Badge]
```

### 5.3. Luồng Ôn Tập SRS (Spaced Repetition)

```mermaid
flowchart TD
    A[🏠 Trang chủ] --> B[🔄 SRS - Xem flashcard cần ôn hôm nay]
    B --> C[📇 Hiển thị Flashcard]
    C --> D[Đánh giá chất lượng nhớ: 0-5]
    D --> E[SM-2 Algorithm tính toán]
    E --> F{quality >= 3?}
    F -->|Có| G[Tăng repetitions, tăng interval]
    F -->|Không| H[Reset repetitions = 0, interval = 1 ngày]
    G --> I[Cập nhật EF và nextReviewAt]
    H --> I
    I --> J{Còn flashcard?}
    J -->|Có| C
    J -->|Không| K[✅ Hoàn thành ôn tập hôm nay]
```

### 5.4. Luồng Thi (Exam Flow + Anti-cheat)

```mermaid
flowchart TD
    A[🏠 Trang chủ] --> B[📝 Xem đề thi đang mở cho lớp mình]
    B --> C[Bắt đầu bài thi: POST /exams/{id}/start]
    C --> D[Hệ thống tạo ExamResult, shuffle câu hỏi/đáp án]
    D --> E[🖥️ Giao diện làm bài thi]
    
    E --> F[⚠️ Anti-Cheat Monitor chạy nền]
    F --> F1[Phát hiện Tab Switch → Log event]
    F --> F2[Phát hiện Copy/Paste → Log event]
    F --> F3[Phát hiện Right Click → Log event]
    F --> F4[Phát hiện DevTools → Log event]
    
    E --> G[Chọn đáp án cho từng câu]
    G --> H[📤 Nộp bài: POST /exams/{id}/submit-anticheat]
    H --> I[Hệ thống chấm điểm tự động]
    I --> J[Lưu ExamResult với score, violationCount]
    J --> K{Điểm đã được công bố?}
    K -->|Có| L[📊 Xem kết quả]
    K -->|Không| M[⏳ Chờ giáo viên công bố điểm]
```

### 5.5. Luồng Gamification Hàng Ngày

```mermaid
flowchart TD
    A[🏠 Đăng nhập hàng ngày] --> B[⚔️ Nhận Nhiệm vụ hàng ngày]
    B --> C[Hoàn thành tasks: học bài, ôn từ, làm quiz]
    C --> D[Cập nhật progress từng task]
    D --> E{Hoàn thành tất cả tasks?}
    E -->|Có| F[🏆 Hoàn thành Quest → Nhận xu thưởng]
    E -->|Không| G[⏳ Tiếp tục hoàn thành]
    
    F --> H[🔥 Cập nhật Streak Days]
    H --> I[🎖️ Kiểm tra điều kiện Badge]
    I --> J[📊 Cập nhật Leaderboard]
```

---

## 6. Luồng Xác Thực Chi Tiết (Authentication Flow)

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Server
    participant DB as Database
    participant R as Redis

    Note over C,S: === ĐĂNG KÝ ===
    C->>S: POST /api/v1/auth/register {username, email, password, fullName}
    S->>DB: Kiểm tra username/email trùng
    S->>DB: Lưu User (password = BCrypt hash)
    S->>S: Tạo JWT Access Token + Refresh Token
    S->>C: 201 {accessToken, refreshToken, user}

    Note over C,S: === ĐĂNG NHẬP ===
    C->>S: POST /api/v1/auth/login {username, password}
    S->>DB: Tìm User theo username
    S->>S: So sánh BCrypt hash
    S->>S: Tạo JWT Access Token (24h) + Refresh Token (7d)
    S->>C: 200 {accessToken, refreshToken, user}

    Note over C,S: === GỌI API ===
    C->>S: GET /api/v1/users/me [Authorization: Bearer {token}]
    S->>S: JwtAuthenticationFilter trích xuất token
    S->>S: Validate JWT signature & expiry
    S->>DB: Load UserDetails từ username trong token
    S->>C: 200 {user data}

    Note over C,S: === LÀM MỚI TOKEN ===
    C->>S: POST /api/v1/auth/refresh-token {refreshToken}
    S->>S: Validate refresh token
    S->>S: Tạo Access Token mới
    S->>C: 200 {newAccessToken, refreshToken}

    Note over C,S: === ĐĂNG XUẤT ===
    C->>S: POST /api/v1/auth/logout [Authorization: Bearer {token}]
    S->>R: Blacklist token trong Redis
    S->>C: 200 "Đăng xuất thành công"

    Note over C,S: === QUÊN MẬT KHẨU ===
    C->>S: POST /api/v1/auth/forgot-password {email}
    S->>DB: Tạo PasswordResetToken (OTP 6 chữ số)
    S->>C: Gửi OTP qua email (Gmail SMTP)
    C->>S: POST /api/v1/auth/reset-password {email, otp, newPassword}
    S->>DB: Verify OTP, cập nhật password hash
    S->>C: 200 "Đặt lại mật khẩu thành công"
```

---

## 7. Luồng Thông Báo Realtime (WebSocket)

```mermaid
sequenceDiagram
    participant C as Client (SockJS)
    participant WS as WebSocket Server
    participant JWT as JWT Validator

    C->>WS: CONNECT ws://server/ws [token in header]
    WS->>JWT: WebSocketChannelInterceptor validates JWT
    JWT-->>WS: Authenticated Principal
    WS->>C: CONNECTED

    C->>WS: SUBSCRIBE /user/queue/notifications
    WS->>JWT: Verify Principal exists
    WS->>C: Subscribed ✅

    Note over WS: Khi có thông báo mới...
    WS->>C: MESSAGE /user/queue/notifications {title, message, imageUrl}
    
    Note over WS: Khi admin broadcast...
    WS->>C: MESSAGE /topic/school/{schoolId} {broadcast notification}
```
