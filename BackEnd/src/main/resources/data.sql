-- =============================================
-- SAMPLE DATA FOR TESTING SCHOOL ROLE CONSTRAINTS
-- =============================================

-- 1. Insert Roles (if they don't exist, we assume IDs 1=ADMIN, 2=SCHOOL, 3=TEACHER, 4=STUDENT based on common setup)
-- If IDs are different, you may need to adjust ROLE_USER inserts.
-- Use INSERT IGNORE to skip if exists
INSERT IGNORE INTO ROLE (id, name, description) VALUES 
(1, 'ROLE_ADMIN', 'Administrator'),
(2, 'ROLE_SCHOOL', 'School Manager'),
(3, 'ROLE_TEACHER', 'Teacher'),
(4, 'ROLE_STUDENT', 'Student');

-- 2. Insert Schools
INSERT IGNORE INTO SCHOOL (id, name, address, email, is_active) VALUES 
(1, 'THPT Nguyen Hue', 'Hue City', 'contact@nguyenhue.edu.vn', 1),
(2, 'THPT Phan Boi Chau', 'Nghe An', 'contact@phanboichau.edu.vn', 1);

-- 3. Insert Users (Password is '123456' -> $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy)
-- Admin (No School)
INSERT IGNORE INTO USERS (id, username, email, password_hash, full_name, is_active, school_id) VALUES 
(1, 'admin', 'admin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Super Admin', 1, NULL);

-- School Managers
INSERT IGNORE INTO USERS (id, username, email, password_hash, full_name, is_active, school_id) VALUES 
(2, 'manager_hue', 'manager@nguyenhue.edu.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Manager Nguyen Hue', 1, 1),
(3, 'manager_pbc', 'manager@phanboichau.edu.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Manager Phan Boi Chau', 1, 2);

-- Teachers
INSERT IGNORE INTO USERS (id, username, email, password_hash, full_name, is_active, school_id) VALUES 
(4, 'teacher_hue_1', 'teacher1@nguyenhue.edu.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Teacher Hue 1', 1, 1),
(5, 'teacher_pbc_1', 'teacher1@phanboichau.edu.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Teacher PBC 1', 1, 2);

-- Students
INSERT IGNORE INTO USERS (id, username, email, password_hash, full_name, is_active, school_id) VALUES 
(6, 'student_hue_1', 'student1@nguyenhue.edu.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Student Hue 1', 1, 1),
(7, 'student_pbc_1', 'student1@phanboichau.edu.vn', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'Student PBC 1', 1, 2);

-- 4. Assign Roles
INSERT IGNORE INTO ROLE_USER (user_id, role_id) VALUES 
(1, 1), -- Admin -> ROLE_ADMIN
(2, 2), -- manager_hue -> ROLE_SCHOOL
(3, 2), -- manager_pbc -> ROLE_SCHOOL
(4, 3), -- teacher_hue_1 -> ROLE_TEACHER
(5, 3), -- teacher_pbc_1 -> ROLE_TEACHER
(6, 4), -- student_hue_1 -> ROLE_STUDENT
(7, 4); -- student_pbc_1 -> ROLE_STUDENT

-- 5. Insert ClassRooms (Table name is CLASS)
INSERT IGNORE INTO CLASS (id, name, school_id, teacher_id, is_active, academic_year) VALUES 
(1, 'Class 10A1 - Hue', 1, 4, 1, '2023-2024'),
(2, 'Class 11B2 - PBC', 2, 5, 1, '2023-2024');

-- 6. Enroll Students to Classes (Assuming STUDENT_CLASS table has columns student_id, class_id, status, joined_at)
INSERT IGNORE INTO STUDENT_CLASS (student_id, class_id, status, joined_at) VALUES 
(6, 1, 'ACTIVE', NOW()), -- Student Hue -> Class Hue
(7, 2, 'ACTIVE', NOW()); -- Student PBC -> Class PBC

-- =============================================
-- INSTRUCTIONS:
-- 1. Run this script in your MySQL database tool (e.g., Workbench, phpMyAdmin).
-- 2. Login with 'manager_hue' / '123456'.
-- 3. You should see 'Class 10A1 - Hue' but NOT 'Class 11B2 - PBC'.
-- 4. Login with 'manager_pbc' / '123456'.
-- 5. You should see 'Class 11B2 - PBC' but NOT 'Class 10A1 - Hue'.
-- =============================================
