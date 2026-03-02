# [Admin] SettingsPage hiển thị tên trường hardcode

## Mô tả vấn đề

Trong trang Cài đặt (SettingsPage), khi hiển thị trường học liên kết, code dùng fallback `'Chu Van An High School'` nếu `user.schoolName` rỗng. Kết quả:
- Hiển thị sai tên trường cho user không có school hoặc school chưa load.
- Dữ liệu giả gây nhầm lẫn cho người dùng.

## Nguyên nhân

- Code dùng fallback cứng để tránh field trống trong UI.
- Không dự đoán trường hợp user không có school (ADMIN) hoặc schoolName chưa có.

## Cách debug

1. Mở Admin → Cài đặt với user SCHOOL có schoolName rỗng hoặc null.
2. Kiểm tra UI: hiển thị "Chu Van An High School".
3. Tìm trong code: `user.schoolName || 'Chu Van An High School'`.

## Giải pháp

Thay fallback bằng giá trị trung tính:
```tsx
{user.schoolName || '—'}
// hoặc
{user.schoolName || 'Không có'}
```

Vị trí: `Admin/src/features/settings/SettingsPage.tsx` (khoảng dòng 181).

## Code mẫu (nếu có)

```tsx
// Trước (sai)
<span>{user.schoolName || 'Chu Van An High School'}</span>

// Sau (đúng)
<span>{user.schoolName || '—'}</span>
```

## Bài học rút ra

- Không hardcode dữ liệu cụ thể (tên trường, tên user) làm fallback.
- Dùng placeholder trung tính: "—", "Không có", "N/A" khi thiếu dữ liệu.

## Cách phòng tránh sau này

1. Khi thêm fallback: dùng giá trị generic, không dùng dữ liệu thật.
2. ESLint/code review: cảnh báo string literal có tên riêng (trường, người) dùng làm fallback.
3. Design system: định nghĩa sẵn placeholder cho empty state (ví dụ `EMPTY_LABEL` constant).
