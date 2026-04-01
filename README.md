## EngAcademy-LMS – Nền tảng web học tiếng Anh cho học sinh

EnglishLearn là một nền tảng học tiếng Anh hiện đại, gamified dành cho học sinh phổ thông. Dự án kết hợp **bài học tương tác**, **nhiệm vụ hằng ngày**, **bài thi online**, **bảng xếp hạng** và **huy hiệu thành tích** để biến việc học thành một hành trình thú vị, có động lực rõ ràng.

---

### Tính năng nổi bật

- **Cổng học sinh tập trung**
  - Trang tổng quan hiển thị chuỗi ngày học, XP (kinh nghiệm), từ vựng đã mastered, thời gian học.
  - Gợi ý *bài học tiếp theo* và từ vựng trong ngày để “vào game” rất nhanh.
  - Thông báo realtime (WebSocket) cho nhiệm vụ, huy hiệu mới, cập nhật từ giáo viên.

- **Bài học & Lộ trình**
  - Danh sách bài học theo chủ đề, cấp độ (Beginner → Intermediate → Advanced).
  - Trang chi tiết bài học được thiết kế lại hiện đại: nội dung, ngữ pháp, flashcard từ vựng, bài luyện tập đều nằm trong một trải nghiệm liền mạch.
  - Theo dõi tiến độ từng bài, cho phép “Tiếp tục học” đúng chỗ dang dở.

- **Từ vựng thông minh**
  - Bộ từ vựng kèm phát âm, nghĩa, ví dụ.
  - Flashcard luyện tập, trạng thái `LEARNING / REVIEWING / MASTERED`.
  - Sổ lỗi (Mistake Notebook) tự động lưu câu hỏi sai để học lại.

- **Bài thi online & Chống gian lận**
  - Thi trắc nghiệm theo đề có sẵn, tính điểm tự động.
  - Anti-cheat: theo dõi đổi tab, hạn chế hành vi copy/paste, log lại các sự kiện bất thường.
  - Thống kê kết quả từng lần thi, chi tiết câu đúng/sai để giáo viên phân tích.

- **Nhiệm vụ ngày & Hệ thống huy hiệu**
  - Nhiệm vụ hằng ngày (Daily Quests) như: hoàn thành bài học, ôn tập từ vựng, làm bài thi.
  - Chuỗi ngày học (Streak) – “đi học liên tục” để duy trì streak và nhận thưởng.
  - Hệ thống huy hiệu (Badges) theo nhóm (chăm chỉ, thành tích bài thi, từ vựng, streak…), có logic tính toán rõ ràng ở backend.

- **Bảng xếp hạng & Gamification**
  - Leaderboard theo tổng XP, cập nhật liên tục.
  - So sánh thứ hạng với bạn bè, tạo môi trường thi đua lành mạnh.
  - Trang dashboard hiển thị “Bạn đang đứng thứ mấy” và gợi ý nhiệm vụ để tăng hạng.

- **Cổng giáo viên & Quản lý lớp**
  - Giáo viên quản lý lớp học, học sinh, bài học, câu hỏi và đề thi.
  - Theo dõi tiến độ học, kết quả bài thi và thống kê học tập của từng học sinh.
  - Công cụ tạo đề, quản lý ngân hàng câu hỏi ngay trong hệ thống.

---

### Công nghệ sử dụng

- **Frontend**
  - React + TypeScript
  - React Router
  - Tailwind CSS + custom UI components
  - Zustand cho state management (auth, toast, v.v.)
  - i18n: `react-i18next` với `vi` / `en`

- **Backend**
  - Java 17+, Spring Boot
  - Spring Security + JWT
  - Spring Data JPA (PostgreSQL/MySQL tuỳ cấu hình)
  - WebSocket (STOMP + SockJS) cho thông báo realtime
  - Kiến trúc phân lớp: `domain` / `application` / `infrastructure` / `presentation`

---

### Cài đặt & Chạy dự án

#### Yêu cầu

- Node.js LTS, npm hoặc pnpm/yarn
- Java 17+
- Maven Wrapper (đã kèm trong dự án)
- PostgreSQL/MySQL (tùy cấu hình trong `application-*.properties`)

#### Backend

```bash
cd BackEnd
# Chỉnh sửa cấu hình DB trong src/main/resources/application-dev.properties nếu cần
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Backend sẽ chạy ở `http://localhost:8080` (hoặc port bạn cấu hình).

#### Frontend

```bash
cd FrontEnd
npm install
npm run dev
```

Frontend sẽ chạy ở `http://localhost:3000`.

Đăng nhập bằng tài khoản demo (nếu team đã seed dữ liệu), hoặc tự đăng ký qua form đăng ký.

---

### Đối tượng sử dụng

- **Học sinh**: muốn luyện tiếng Anh mỗi ngày qua hệ thống điểm, streak, nhiệm vụ, huy hiệu.
- **Giáo viên / Trung tâm**: cần một hệ thống quản lý bài học, đề thi và theo dõi tiến độ học sinh.
- **Nhà trường**: triển khai như một cổng học tiếng Anh trực tuyến cho toàn bộ học sinh.

---

### Định hướng phát triển

- Thêm lộ trình học theo chuẩn CEFR / chương trình phổ thông Việt Nam.
- Tích hợp nhiều dạng bài luyện tập (nghe, nói, drag & drop, điền khuyết…).
- Mở rộng hệ thống phân tích học tập (learning analytics) cho giáo viên và admin.
- Tích hợp thanh toán để mua gói học, vật phẩm bảo vệ streak, v.v.
