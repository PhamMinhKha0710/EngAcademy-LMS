-- Seed data cho E2E tests
-- Chạy file này trong database PostgreSQL của BackEnd

BEGIN;

-- Tạo teacher user (nếu chưa có)
-- Password: 'password123' được mã hóa bằng BCrypt với cost 10
INSERT INTO users (email, password, name, role, created_at, updated_at, enabled)
VALUES (
  'teacher@example.com',
  '$2a$10$YOUR_BCRYPT_HASH_REPLACE_ME',  -- <<< THAY BẰNG HASH THỰC
  'Teacher Test',
  'ROLE_TEACHER',
  NOW(),
  NOW(),
  true
) ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  enabled = EXCLUDED.enabled,
  updated_at = NOW();

-- Tạo student user mẫu (nếu cần)
INSERT INTO users (email, password, name, role, created_at, updated_at, enabled)
VALUES (
  'student@example.com',
  '$2a$10$YOUR_BCRYPT_HASH_REPLACE_ME',  -- <<< THAY BẰNG HASH THỰC
  'Student Test',
  'ROLE_STUDENT',
  NOW(),
  NOW(),
  true
) ON CONFLICT (email) DO NOTHING;

-- Tạo topic mẫu để teacher có thể gán bài học
INSERT INTO topics (name, description, created_at, updated_at)
VALUES (
  'Chủ đề mẫu E2E',
  'Topic được tạo tự động cho tests E2E',
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

COMMIT;

-- ============================================
-- HƯỚNG DẪN TẠO BCrypt HASH
-- ============================================
-- Cách 1: Dùng Node.js
-- node -e "console.log(require('bcrypt').hashSync('password123', 10))"
--
-- Cách 2: Dùng Python
-- python3 -c "import bcrypt; print(bcrypt.hashpw(b'password123', bcrypt.gensalt()).decode())"
--
-- Sau khi có hash, thay thế $2a$10$YOUR_BCRYPT_HASH_REPLACE_ME với hash thực
-- Ví dụ: $2a$10$N9qo8uLOickgx2ZMRZoMy.Mr9Vq6M3dB6x6J1J7qFf5p8dVhJ3T3Om