---
name: frontend-design-guide
description: Guides frontend design and implementation following style guide best practices. Use when designing UI/UX, building components, choosing typography/colors/layout, setting up design systems, or when the user mentions frontend style guide, design system, UI consistency, or component specifications.
---

# Frontend Design Guide

Dựa trên [Redwerk – Front-End Style Guides](https://redwerk.com/blog/front-end-design-guides/). Skill này giúp thiết kế và triển khai frontend nhất quán, dễ bảo trì.

## Nguyên tắc cốt lõi

Khi thiết kế hoặc review frontend, đảm bảo:

- **Accessibility**: Hỗ trợ screen reader, keyboard-only, contrast đủ, tuân chuẩn a11y.
- **Consistency**: Giao diện thống nhất trên mọi trang; patterns lặp lại để người dùng học nhanh.
- **User Experience**: Hành trình rõ ràng, trực quan, hiệu quả.
- **Responsiveness**: Grid linh hoạt, media queries, xử lý responsive cho hình ảnh.

## Cấu trúc Style Guide

### 1. Typography

- Định nghĩa font family, size, weight, line-height, màu chữ.
- Dùng typography để tạo visual hierarchy (heading, body, caption).
- Cân bằng giữa fonts: ví dụ một font nhẹ + một font nhấn mạnh.

### 2. Color Palette

- **Primary, secondary, accent**: Quy định rõ vai trò từng màu.
- **Background, text, links**: Gán màu cụ thể (hex, RGB, HSL).
- **Contrast**: Đảm bảo contrast đủ giữa text và background (WCAG).

### 3. Components

Chuẩn hóa các component UI phổ biến:

| Component | Cần mô tả |
|-----------|-----------|
| Buttons | Type, style, hover/active states, kích thước |
| Forms | Input, label, validation, error state |
| Dialogs, Dropdowns, Menus | Cách mở/đóng, vị trí, animation |
| Icons, Tooltips, Breadcrumbs | Style, kích thước, spacing |
| Progress, Accordion, Carousel, Slider | State, interaction, accessibility |

Mỗi component cần: HTML/CSS snippet, padding/margin, border-radius, màu, hover/focus states.

### 4. Layout

- **Grid**: Số cột, gutter, breakpoints.
- **Spacing**: margin/padding thống nhất (ví dụ 4/8/16/24px).
- **Breakpoints**: Định nghĩa rõ khi nào layout thay đổi (mobile, tablet, desktop).

### 5. Icons & Imagery

- Style: line/outline/filled, monochrome hay brand colors.
- Kích thước, spacing chuẩn.
- Quy tắc cho illustration/ảnh: tỷ lệ, tone, phù hợp thương hiệu.

## Coding Standards

### Tổ chức code

- Chia nhỏ thành modules/component.
- Mỗi component: logic + style riêng, tái sử dụng được.
- Tránh code lặp, ưu tiên composition.

### Naming conventions

- HTML/CSS: BEM hoặc naming thống nhất.
- JS/TS: camelCase cho biến/hàm, PascalCase cho component.
- Giữ nhất quán trong toàn dự án; dùng linter để enforce.

### Code specifications

Mỗi UI element có spec tương ứng:

- **Typography**: CSS cho font-family, size, weight, line-height, color.
- **Color**: Giá trị hex/RGB/HSL cho palette.
- **Component**: HTML/CSS snippet với padding, margin, border, background, states.

## Format Style Guide

- **Living style guide** (ưu tiên): Web-based, interactive, cập nhật tự động khi component đổi.
- **Static style guide**: PDF/Word, phù hợp dự án nhỏ, cần cập nhật thủ công.

## Checklist khi thiết kế/triển khai mới

- [ ] Typography đã tuân guide?
- [ ] Màu nằm trong palette và đủ contrast?
- [ ] Component tái sử dụng hay đã có trong library?
- [ ] Layout responsive với breakpoints đúng?
- [ ] Accessibility: keyboard, screen reader, contrast?
- [ ] Naming và structure code nhất quán?

## Tham khảo chi tiết

- Chi tiết từ Redwerk: [reference.md](reference.md)
- Công cụ gợi ý: Figma, Storybook, Tailwind, ESLint, Stylelint, Prettier, WAVE.
