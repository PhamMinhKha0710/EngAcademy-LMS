# 🧪 EngAcademy LMS — Test Accounts

> **Version:** 1.0  
> **Last Updated:** 2026-05-21  
> **Môi trường:** Development (profile `dev`)  
> **Data Seeder:** `DevDataSeeder.java`

---

## 1. Tài Khoản Mặc Định (Dev Environment)

Khi chạy với profile `dev`, hệ thống tự động tạo các tài khoản sau:

### 1.1. Admin Account

| Trường | Giá Trị |
|:---|:---|
| **Username** | `admin` |
| **Email** | `admin@engacademy.com` |
| **Password** | `Admin@123` |
| **Role** | `ROLE_ADMIN` |
| **School** | Không thuộc trường nào (global admin) |

> ⚠️ **Lưu ý Production:** Tài khoản admin trong Production KHÔNG dùng mật khẩu mặc định. `ProdDataSeeder` đọc mật khẩu từ biến môi trường `application.security.admin.default-password`, nếu không có sẽ sinh UUID ngẫu nhiên.

### 1.2. School Manager Account

| Trường | Giá Trị |
|:---|:---|
| **Username** | `school1` |
| **Email** | `school1@engacademy.com` |
| **Password** | `School@123` |
| **Role** | `ROLE_SCHOOL` |
| **School** | School #1 (được seed tự động) |

### 1.3. Teacher Account

| Trường | Giá Trị |
|:---|:---|
| **Username** | `teacher1` |
| **Email** | `teacher1@engacademy.com` |
| **Password** | `Teacher@123` |
| **Role** | `ROLE_TEACHER` |
| **School** | School #1 |

### 1.4. Student Accounts

| Username | Email | Password | Role | School |
|:---|:---|:---|:---|:---|
| `student1` | `student1@engacademy.com` | `Student@123` | `ROLE_STUDENT` | School #1 |
| `student2` | `student2@engacademy.com` | `Student@123` | `ROLE_STUDENT` | School #1 |
| `student3` | `student3@engacademy.com` | `Student@123` | `ROLE_STUDENT` | School #1 |

---

## 2. Dữ Liệu Mẫu Được Seed

Khi chạy profile `dev`, `DevDataSeeder` tạo:

| Loại Dữ Liệu | Số Lượng | Mô Tả |
|:---|:---|:---|
| **Roles** | 4 | ADMIN, SCHOOL, TEACHER, STUDENT |
| **Schools** | 1+ | Trường mẫu |
| **Users** | 6+ | admin, school1, teacher1, student1/2/3 |
| **Classrooms** | Tự động | Lớp mẫu gắn với School #1 |
| **Lessons** | Tự động | Bài học mẫu với nội dung |
| **Topics** | Tự động | Chủ đề mẫu |
| **Vocabularies** | Tự động | Từ vựng gắn với bài học |
| **Questions** | Tự động | Câu hỏi MCQ, Fill-in-Blank, etc. |
| **Badge Definitions** | Tự động | Các loại huy hiệu |
| **Placement Questions** | Tự động | Câu hỏi xếp lớp theo CEFR |

---

## 3. Cách Sử Dụng Tài Khoản Test

### 3.1. Lấy Access Token

```bash
# Đăng nhập Admin
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin@123"}'

# Đăng nhập School Manager
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"school1","password":"School@123"}'

# Đăng nhập Teacher
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"teacher1","password":"Teacher@123"}'

# Đăng nhập Student
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"student1","password":"Student@123"}'
```

### 3.2. Sử Dụng Token

```bash
# Gọi API với Bearer Token
curl -X GET http://localhost:8080/api/v1/users/me \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
```

---

## 4. Bảng Tóm Tắt Nhanh

```
╔═══════════════╦════════════════════╦═══════════════╦════════════════╗
║   Username    ║     Password       ║     Role      ║    School      ║
╠═══════════════╬════════════════════╬═══════════════╬════════════════╣
║   admin       ║   Admin@123        ║   ADMIN       ║   Global       ║
║   school1     ║   School@123       ║   SCHOOL      ║   School #1    ║
║   teacher1    ║   Teacher@123      ║   TEACHER     ║   School #1    ║
║   student1    ║   Student@123      ║   STUDENT     ║   School #1    ║
║   student2    ║   Student@123      ║   STUDENT     ║   School #1    ║
║   student3    ║   Student@123      ║   STUDENT     ║   School #1    ║
╚═══════════════╩════════════════════╩═══════════════╩════════════════╝
```

---

## 5. Quy Tắc Mật Khẩu

Mật khẩu phải tuân theo pattern validation (nếu được cấu hình):
- Tối thiểu 8 ký tự
- Chứa chữ hoa, chữ thường, số, ký tự đặc biệt
- Pattern trong codebase: `Capital@digits`

---

## 6. Lưu Ý Bảo Mật Production

| Item | Dev | Production |
|:---|:---|:---|
| Admin password | `Admin@123` (hardcode) | Từ env var hoặc UUID random |
| JWT Secret | Hardcode trong `application.properties` | Từ env var `APPLICATION_SECURITY_JWT_SECRET_KEY` |
| Swagger UI | ✅ Enabled | ❌ Disabled qua env var |
| Rate Limit | 100 req/60s | Cấu hình riêng |
| Database | H2 In-Memory | MySQL 8.x |
