# UX Best Practices cho Người dùng 11–12 Tuổi

Tài liệu này mô tả các nguyên tắc thiết kế UX áp dụng cho nền tảng học tiếng Anh, đối tượng chính là học sinh 11–12 tuổi.

## 1. Khả năng tiếp cận (Accessibility)

### Độ tương phản (Contrast)
- **WCAG AA**: Text thường ≥ 4.5:1, text lớn (≥ 18px) ≥ 3:1
- Ưu tiên tối đa độ tương phản để dễ đọc trong môi trường ánh sáng thay đổi (lớp học, nhà)

### Kích thước vùng chạm (Touch Targets)
- **Tối thiểu 44×44px** (WCAG 2.5.5 AAA) cho tất cả nút bấm, link tương tác
- Trẻ em có kỹ năng vận động đang phát triển; vùng chạm lớn giúp giảm lỗi thao tác

### Trạng thái focus
- Focus ring rõ ràng, dễ nhìn (outline 2px hoặc ring)
- Hỗ trợ điều hướng bằng bàn phím đầy đủ
- Màu focus không chỉ dựa vào màu sắc

### Screen reader
- Labels cho input, alt text cho hình ảnh
- Cấu trúc heading hợp lý (h1 → h2 → h3)
- ARIA khi cần cho interactive components

---

## 2. Phân cấp trực quan (Visual Hierarchy)

### Thứ bậc rõ ràng
- **H1**: Tiêu đề trang chính – lớn, đậm
- **H2**: Section chính – kích thước trung bình
- **H3**: Tiêu đề phụ – nhỏ hơn nhưng vẫn nổi bật
- **Body**: Nội dung chính – dễ đọc, line-height đủ rộng
- **Caption**: Ghi chú nhỏ – màu phụ, size nhỏ

### Khoảng trắng
- Dùng spacing scale thống nhất: 4, 8, 12, 16, 24, 32, 48, 64px
- Tách rõ các nhóm thông tin bằng khoảng trắng
- Tránh giao diện dày đặc

### Màu sắc
- Dùng màu để nhấn mạnh, không thay thế thông tin text
- Primary cho CTA; Success/Warning/Error cho feedback rõ ràng

---

## 3. Typography Scale (Thang chữ)

| Token | Size | Line-height | Dùng cho |
|-------|------|-------------|----------|
| `text-display` | 2.5rem (40px) | 1.2 | Hero title |
| `text-h1` | 2rem (32px) | 1.25 | Tiêu đề trang |
| `text-h2` | 1.5rem (24px) | 1.3 | Section |
| `text-h3` | 1.25rem (20px) | 1.35 | Subsection |
| `text-body-lg` | 1.125rem (18px) | 1.6 | Body chính (ưu tiên) |
| `text-body` | 1rem (16px) | 1.6 | Body phụ |
| `text-caption` | 0.875rem (14px) | 1.5 | Ghi chú |

### Lưu ý cho 11–12 tuổi
- Base body ≥ 16px, khuyến nghị 18px cho nội dung chính
- Line-height ≥ 1.5, ưu tiên 1.6 cho body text
- Font sans-serif, dễ đọc (Inter, DM Sans đã phù hợp)
- Tránh font chữ trang trí cho nội dung học tập

---

## 4. Spacing Scale (Thang khoảng cách)

| Token | Giá trị | Dùng cho |
|-------|---------|----------|
| `space-1` | 4px | Khoảng nội bộ rất nhỏ |
| `space-2` | 8px | Gap giữa icon và text |
| `space-3` | 12px | Khoảng trong component nhỏ |
| `space-4` | 16px | Padding nội dung cơ bản |
| `space-6` | 24px | Khoảng giữa các block |
| `space-8` | 32px | Section spacing |
| `space-12` | 48px | Khoảng section lớn |
| `space-16` | 64px | Khoảng giữa các section chính |

---

## 5. Nguyên tắc nội dung & tương tác

### Feedback ngay lập tức
- Mỗi hành động có phản hồi (visual, text, âm thanh khi phù hợp)
- Loading state rõ ràng
- Success/error message dễ hiểu

### Navigation đơn giản
- Nút Home, Back luôn dễ tìm
- Icon kèm text cho nút quan trọng (tránh icon-only nếu có thể)
- Breadcrumb hoặc back navigation rõ ràng

### Cử chỉ đơn giản
- Ưu tiên tap/click, swipe, drag
- Tránh double-tap, multi-finger phức tạp

### Tránh phân tâm
- Âm thanh và animation có chủ đích
- Không dùng animation quá nhanh hoặc nhấp nháy

---

## 6. Checklist triển khai

- [ ] Base font size ≥ 16px, body chính 18px
- [ ] Line-height body ≥ 1.6
- [ ] Touch target ≥ 44×44px cho tất cả CTA
- [ ] Contrast WCAG AA trở lên
- [ ] Focus states rõ ràng
- [ ] Spacing dùng scale 4/8/16/24/32/48/64
- [ ] Typography dùng scale trong docs
- [ ] Icon quan trọng có text kèm theo
- [ ] Labels cho tất cả form fields

---

## Tham khảo

- [Nielsen Norman: Children on the Web](https://www.nngroup.com/reports/children-on-the-web/)
- [WCAG 2.2 - Target Size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
- [Google: Designing for Kids](https://developers.google.com/building-for-kids/designing-engaging-apps)
