# Frontend Design Guide – Reference

Chi tiết từ [Redwerk – Front-End Style Guides](https://redwerk.com/blog/front-end-design-guides/).

## Hiểu về Frontend Style Guide

**Frontend style guide** là tài liệu mô tả các yếu tố trực quan và kỹ thuật của website/app. Đây là nguồn chân lý duy nhất cho dev và designer.

**Lưu ý**: Khác với brand style guide (tập trung nhận diện thương hiệu), frontend style guide chi tiết hóa cách triển khai nhận diện đó thành giao diện thực tế.

### Living vs Static

| Loại | Đặc điểm |
|------|----------|
| Living style guide | Web-based, interactive, cập nhật tự động khi component thay đổi, phù hợp dự án lớn |
| Static style guide | PDF/Word, cập nhật thủ công, phù hợp dự án nhỏ |

## Lợi ích

- Codebase sạch hơn, tái sử dụng, dễ bảo trì
- Onboarding nhanh cho dev/designer mới
- UX tốt hơn, thương hiệu nhất quán
- Giảm thời gian quyết định thiết kế, tăng tốc phát triển

## Typography chi tiết

Guideline typography thường gồm:

- Font family (primary, secondary)
- Size (scale: h1, h2, body, caption)
- Weight (regular, medium, bold)
- Line height
- Màu chữ (từ color palette)

Ví dụ: Rubik (informal, nhẹ) + Play (đậm, nổi bật) cho cân bằng giữa nhẹ nhàng và nhấn mạnh.

## Color Palette chi tiết

- **Primary**: Màu chính, thường dùng cho CTA, link
- **Secondary**: Hỗ trợ, phụ
- **Accent**: Nhấn mạnh, highlight
- **Background/Text**: Màu nền và chữ chuẩn

Mỗi màu nên có: hex, RGB, HSL. Đảm bảo contrast text/background theo WCAG.

## Frontend Components mẫu

| Component | Mô tả |
|-----------|-------|
| Icons | Kích thước, style (outline/filled) |
| Tooltips | Vị trí, animation, timing |
| Progress bars | Thickness, màu, animation |
| Breadcrumbs | Separator, link style |
| Dialogs/Modals | Backdrop, z-index, close behavior |
| Dropdowns | Trigger, placement, keyboard nav |
| Navigation | Structure, responsive behavior |
| Carousels, Accordions, Sliders | Animation, a11y |

Mỗi component nên có: HTML/CSS snippet, padding, margin, border-radius, background, hover/focus/active states.

## Layout chi tiết

- **Grid**: 12 cột, 16 cột; gutter 16px/24px
- **Spacing**: Scale 4, 8, 16, 24, 32, 48 (px hoặc rem)
- **Breakpoints**: Mobile (<768), Tablet (768–1024), Desktop (>1024) – chỉnh theo nhu cầu

## Coding Standards chi tiết

### Code organization

- Phân tách theo feature/component
- Mỗi component là module độc lập
- Tránh coupling chặt, ưu tiên composition

### Naming conventions

- **BEM**: `block__element--modifier`
- **CSS**: kebab-case cho class
- **JS/TS**: camelCase biến/hàm, PascalCase component
- Dùng ESLint/Stylelint để enforce

### Code specifications

Mỗi UI element có spec code tương ứng trong style guide:

- Typography: CSS `font-family`, `font-size`, `font-weight`, `line-height`, `color`
- Color: giá trị hex/RGB/HSL
- Component: HTML structure + CSS cho padding, margin, border, background, states

## Công cụ gợi ý

| Nhóm | Công cụ |
|------|---------|
| Design | Figma, Adobe XD, Sketch, Penpot |
| Dev | WAVE (a11y), Prettier, ESLint, Stylelint |
| Docs/Collab | Notion, InVision, Zeplin |
