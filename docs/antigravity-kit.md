# Antigravity Kit – Hướng dẫn tích hợp và sử dụng

## Giới thiệu

**Antigravity Kit** là bộ template AI Agent gồm **Agents** (persona chuyên từng lĩnh vực), **Skills** (module kiến thức theo domain), và **Workflows** (các lệnh slash). Trong dự án weblearnenglish, Cursor (hoặc Windsurf) đọc thư mục `.agent/` để gợi ý lệnh và áp dụng đúng agent theo ngữ cảnh.

Mục đích sử dụng trong dự án:

- **Lập kế hoạch** task (chỉ tạo plan, không viết code).
- **Debug** có hệ thống khi gặp lỗi.
- **Tạo tính năng mới** hoặc cải thiện code với agent chuyên domain (frontend, backend, security, database, …).

---

## Cài đặt

Thư mục `.agent/` đã được cài tại **root** của repo (cùng cấp với `BackEnd/`, `FrontEnd/`, `Admin/`).

- **Lần đầu (đã thực hiện):**  
  ```bash
  npx @vudovn/ag-kit init
  ```
- **Cập nhật bản mới:**  
  ```bash
  npx @vudovn/ag-kit update
  ```  
  Hoặc nếu cài global: `npm install -g @vudovn/ag-kit` rồi `ag-kit update`.
- **Kiểm tra trạng thái:**  
  ```bash
  npx @vudovn/ag-kit status
  ```
  (hoặc `ag-kit status` nếu dùng CLI global.)

### Lưu ý Git và Cursor

- **Không** thêm `.agent/` vào `.gitignore` nếu dùng Cursor/Windsurf: IDE cần index `.agent/` để hiển thị slash commands trong chat.
- Nếu muốn giữ `.agent` chỉ trên máy local (không commit): thêm `.agent/` vào `.git/info/exclude` thay vì `.gitignore`.

---

## Sử dụng Agents

Bạn **không cần gọi tên agent**. Chỉ cần mô tả task bằng ngôn ngữ tự nhiên; AI sẽ tự chọn agent phù hợp và thông báo đang dùng agent nào.

Ví dụ:

- Bạn: *"Thêm JWT authentication"*  
  AI: áp dụng @security-auditor + @backend-specialist...
- Bạn: *"Sửa nút dark mode"*  
  AI: dùng @frontend-specialist...
- Bạn: *"Login trả 500 error"*  
  AI: dùng @debugger để phân tích có hệ thống...

Nếu muốn chỉ định rõ, bạn có thể ghi tên agent (ví dụ: @backend-specialist, @frontend-specialist).

---

## Sử dụng Workflows (slash commands)

Gõ lệnh dạng `/&lt;tên&gt;` trong chat Cursor để kích hoạt workflow tương ứng.

| Lệnh             | Mô tả ngắn                                    |
|------------------|-----------------------------------------------|
| `/plan`          | Tạo kế hoạch task (chỉ plan, không viết code) |
| `/brainstorm`    | Động não ý tưởng trước khi implement          |
| `/create`        | Tạo tính năng hoặc ứng dụng mới               |
| `/debug`         | Debug có hệ thống                             |
| `/deploy`        | Triển khai ứng dụng                           |
| `/enhance`       | Cải thiện code hiện có                        |
| `/orchestrate`   | Điều phối nhiều agent                         |
| `/preview`       | Xem trước thay đổi local                     |
| `/status`        | Kiểm tra trạng thái dự án                     |
| `/test`          | Tạo và chạy test                              |
| `/ui-ux-pro-max` | Thiết kế với nhiều phong cách (50 styles)    |

Ví dụ:

```
/plan thêm trang từ vựng
/debug lỗi login 500
/create API refresh token
/brainstorm flow đăng ký học viên
```

---

## Skills

**Skills** được load tự động theo ngữ cảnh task. Bạn không cần gọi tên skill; AI đọc mô tả trong `.agent/skills/` và áp dụng kiến thức phù hợp (API patterns, database design, frontend, security, …).

---

## CLI

| Lệnh             | Mô tả                                      |
|------------------|--------------------------------------------|
| `ag-kit init`    | Cài thư mục `.agent` vào dự án             |
| `ag-kit update`  | Cập nhật lên bản mới nhất                  |
| `ag-kit status`  | Kiểm tra trạng thái cài đặt                |

Một số tùy chọn cho `ag-kit init`:

```bash
ag-kit init --force        # Ghi đè thư mục .agent hiện có
ag-kit init --path ./myapp # Cài vào thư mục chỉ định
ag-kit init --branch dev   # Dùng branch cụ thể
ag-kit init --quiet        # Ít log (phù hợp CI/CD)
ag-kit init --dry-run      # Xem trước, không thực thi
```

---

## Tài liệu thêm

- [Web App Example](https://antigravity-kit.unikorn.vn/docs/guide/examples/brainstorm) – Hướng dẫn từng bước tạo web app.
- [Online Docs](https://antigravity-kit.unikorn.vn/docs) – Duyệt toàn bộ tài liệu trực tuyến.

Nếu trong repo có bản clone/checkout của Antigravity Kit (ví dụ thư mục `antigravity-kit/`):

- `antigravity-kit/README.md` – README chính.
- `antigravity-kit/AGENT_FLOW.md` – Kiến trúc luồng agent.

---

## Quick reference (English)

- **Install/update:** `npx @vudovn/ag-kit init` | `ag-kit update` | `ag-kit status`
- **Agents:** Describe the task; the right specialist is chosen automatically. You can override with e.g. @backend-specialist.
- **Workflows:** Use slash commands: `/plan`, `/debug`, `/create`, `/brainstorm`, `/deploy`, `/enhance`, `/preview`, `/status`, `/test`, `/ui-ux-pro-max`, `/orchestrate`.
- **Skills:** Loaded by context; no need to invoke by name.
- **Do not** add `.agent/` to `.gitignore` if you use Cursor/Windsurf; use `.git/info/exclude` for local-only ignore.
