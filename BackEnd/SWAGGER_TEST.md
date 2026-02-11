# Hướng dẫn test API trên Swagger với dữ liệu seed (dev)

**Chỉ dùng cho môi trường phát triển / test.** Mật khẩu đơn giản chỉ để thuận tiện khi test trên Swagger.

## 1. Chạy ứng dụng với profile `dev`

Để có dữ liệu seed (user, trường, lớp, bài học, bài thi) trong database:

- **IDE**: Cấu hình Run/Debug với VM option: `-Dspring.profiles.active=dev`
- **Command line**:  
  `mvn spring-boot:run -Dspring-boot.run.profiles=dev`  
  hoặc set biến môi trường: `SPRING_PROFILES_ACTIVE=dev`

Sau khi khởi động, log sẽ có dòng kiểu: **"Dev data seeded successfully."** và danh sách tài khoản.

## 2. URL Swagger

- **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)  
- **OpenAPI JSON**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

(Máy chạy mặc định port 8080; nếu đổi port thì thay `8080` trong URL.)

## 3. Tài khoản seed (username / password)

| Username  | Password   | Vai trò        | Ghi chú                    |
|-----------|------------|----------------|----------------------------|
| `admin`   | `Admin@123`  | Admin          | Toàn quyền                 |
| `school1` | `School@123` | Quản lý trường | Gắn với 1 trường (Dev English School) |
| `teacher1`| `Teacher@123`| Giáo viên      | Dạy 2 lớp (10A, 10B)       |
| `student1`| `Student@123`| Học sinh      | Thuộc lớp 10A              |
| `student2`| `Student@123`| Học sinh      | Thuộc lớp 10A và 10B       |

## 4. Cách lấy JWT và Authorize trên Swagger

1. Mở Swagger UI: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html).
2. Tìm endpoint **POST** `/api/v1/auth/login`.
3. Nhấn **Try it out**, nhập body ví dụ:
   ```json
   {
     "username": "teacher1",
     "password": "Teacher@123"
   }
   ```
4. **Execute**. Trong response, copy giá trị `accessToken` (không copy refreshToken).
5. Nhấn nút **Authorize** (góc phải trên Swagger UI).
6. Ở ô **Value** chỉ dán **token** (không cần gõ `Bearer `, Swagger tự thêm).  
   Ví dụ: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
7. **Authorize** → **Close**. Các request sau sẽ tự gửi kèm header `Authorization: Bearer <token>`.

Đổi user test: nhấn **Authorize** → **Logout** → dán token mới từ tài khoản khác → **Authorize** → **Close**.

## 5. Dữ liệu có sẵn sau khi seed (dev)

- **1 trường**: Dev English School (schoolId dùng cho API school).
- **2 lớp**: Lớp 10A, 10B (classId dùng cho API class/exam).
- **1 chủ đề (Topic)**: "Daily Life".
- **3 bài học (Lesson)**: Greetings and Introductions, Numbers and Time, At the Shop (đã publish).
- **Từ vựng (Vocabulary)**: Gắn với các bài học trên.
- **Câu hỏi (Question)**: MULTIPLE_CHOICE, TRUE_FALSE gắn bài học; dùng cho bài thi.
- **1 bài thi (Exam)**: "Dev Test - Greetings & Time", trạng thái **PUBLISHED**, thời gian mở từ 1 ngày trước đến 7 ngày sau thời điểm seed; gắn lớp 10A và các câu hỏi từ bài học.

Khi test trên Swagger, nên dùng đúng các id trả về từ API (ví dụ GET danh sách lớp, danh sách bài thi) hoặc id cố định sau khi seed (xem log hoặc gọi GET list để biết id). Không dùng id giả định không tồn tại trong DB.
