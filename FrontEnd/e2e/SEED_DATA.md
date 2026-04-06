# Hướng dẫn chuẩn bị data cho E2E tests

## 1. Tạo Teacher Account trong Database

Chạy SQL sau trong database của bạn (PostgreSQL):

```sql
-- Tạo user teacher (nếu chưa có)
INSERT INTO users (email, password, name, role, created_at, updated_at)
VALUES (
  'teacher1',
  -- password: 'Teacher@123' (đã encode bằng BCrypt)
  '$2a$10$YOUR_BCRYPT_HASH_HERE',
  'Teacher Test',
  'ROLE_TEACHER',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;
```

### Tạo BCrypt password hash:

```bash
# Trên terminal với bcrypt (hoặc dùng Node.js):
node -e "console.log(require('bcrypt').hashSync('Teacher@123', 10))"
```

## 2. Cấu hình Backend (application-dev.properties)

Đảm bảo `application-dev.properties` có:

```properties
spring.jpa.hibernate.ddl-auto=update
spring.datasource.url=jdbc:postgresql://localhost:5432/yourdb
spring.datasource.username=youruser
spring.datasource.password=yourpass
```

## 3. Cấu hình Frontend E2E

Tạo file `FrontEnd/.env.e2e.local`:

```bash
E2E_BASE_URL=http://127.0.0.1:3000
E2E_TEACHER_EMAIL=teacher1
E2E_TEACHER_PASSWORD=Teacher@123
```

## 4. Chạy ứng dụng

```bash
# Terminal 1: Backend
cd BackEnd
mvn spring-boot:run

# Terminal 2: Frontend
cd FrontEnd
npm run dev
```

## 5. Verify API endpoints

Kiểm tra teacher login API hoạt động:

```bash
curl -X POST http://127.0.0.1:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher1","password":"Teacher@123"}'
```

Nếu response trả về `accessToken`, bạn đã sẵn sàng chạy E2E:

```bash
cd FrontEnd
npm run test:e2e:ui
```

## 6. Xử lý lỗi 500 từ các endpoint khác

Các lỗi `/api/v1/users/me`, `/api/v1/notifications/me`, `/api/v1/public/stats` có thể xảy ra nếu:

- **User chưa có profile đầy đủ**: Thêm các trường `name`, `avatarUrl` cho teacher.
- **Notification service chưa seed**: Có thể ignore nếu không ảnh hưởng đến lesson tests.

Để skip các lỗi này, có thể thêm mock ở `auth.setup.ts`:

```typescript
// Trong page.addInitScript()
window.addEventListener('unhandledrejection', e => {
  // Ignore các API không cần thiết
  if (e.reason?.message?.includes('500')) {
    console.log('Ignored API error:', e.reason);
  }
});
```