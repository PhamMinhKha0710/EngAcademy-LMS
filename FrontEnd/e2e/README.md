# Chương 6 – E2E Tests for Lesson Create (SB01–SB11)

Tập script Playwright để tự động hóa 11 kịch bản tạo bài học trên giao diện **Teacher** (`/teacher/lessons`).

## Yêu cầu trước khi chạy

1. **Backend** (Spring Boot) đang chạy, ví dụ: `http://localhost:8080`
2. **Frontend** (Vite) đang chạy, ví dụ: `http://localhost:5173`
3. Tài khoản giáo viên (`ROLE_TEACHER`) tồn tại trong DB.
4. Các biến môi trường E2E:

```bash
# .env.e2e.local (không commit)
E2E_BASE_URL=http://localhost:5173
E2E_TEACHER_EMAIL=teacher@example.com
E2E_TEACHER_PASSWORD=yourpassword
```

## Cài đặt & chạy

```bash
cd FrontEnd
npm install
npm run test:e2e           # chạy headless
npm run test:e2e:ui        # chạy với UI
npm run test:e2e:debug     # chạy debug
```

## Báo cáo

Sau khi chạy, mở `playwright-report/index.html` để xem chi tiết từng test case.

---

## SB01–SB11 Mapping

| ID | Tên test trong spec | Mục tiêu chính | Assertion chính |
|----|----------------------|----------------|-----------------|
| SB01 | `Soạn nội dung HTML cơ bản với Bold/Italic/Underline` | Editor CKEditor + toolbar | Văn bản xuất hiện trong Preview, tiêu đề có trong table |
| SB02 | `Chèn danh sách (List)` | Chèn list qua toolbar | Lưu thành công, tiêu đề xuất hiện |
| SB03 | `Chèn bảng 2x2` | Table qua Media/Tool (dùng raw HTML) | Lưu thành công |
| SB04 | `Nhúng URL Audio` | MediaEmbed dialog | Lưu thành công (không kiểm tra media hiển thị) |
| SB05 | `Soạn bài ở chế độ Mã nguồn HTML` | Chuyển mode raw → visual | Văn bản "Hello" hiển thị trong editor |
| SB06 | `Kiểm tra chức năng Preview` | Tab REVIEW hiển thị | Có `GIỚI THIỆU BÀI HỌC`, sub-tabs NGỮ PHÁP/TỪ VỰNG |
| SB07 | `Kiểm tra validation bỏ trống Tiêu đề` | Nút Lưu disabled khi title rỗng | `toBeDisabled()` |
| SB08 | `Độ khó mức 1` | Select giá trị 1 | Table hiển thị `Lv.1` |
| SB09 | `Độ khó mức 5` | Select giá trị 5 | Table hiển thị `Lv.5` |
| SB10 | `Lọc mã Script độc hại (XSS)` | Nhập `<script>alert()</script>` | Không có alert dialog xuất hiện |
| SB11 | `Lưu ở trạng thái Nháp` | Checkbox `Xuất bản` bỏ chọn | Modal hiển thị `LƯU BẢN NHÁP`, table badge "Nháp" |

---

## Ghi chú

- Các test sử dụng `page.getByRole` và text tiếng Việt từ UI, nên UI thay đổi nhỏ có thể làm test fail. Khi cần ổn định lâu dài, hãy thêm `data-testid` vào `TeacherLessonsPage.tsx` (ví dụ: `data-testid="lesson-create-button"`).
- Test SB03 & SB04 hiện tại dùng workaround (raw HTML paste) để tránh phụ thuộc vào dialog phức tạp của CKEditor.
- Sau mỗi chạy, dữ liệu test còn lại trong DB. Có thể thêm cleanup bằng API nếu cần.