-- Phase 5/3: indexes and integrity guards for production scale

-- Remove duplicate exam_result rows before adding unique constraint (keep smallest id)
DELETE er1 FROM EXAM_RESULT er1
INNER JOIN EXAM_RESULT er2
  ON er1.exam_id = er2.exam_id
 AND er1.student_id = er2.student_id
 AND er1.id > er2.id;

-- Prevent duplicate exam submissions (if legacy DB lacks constraint)
SET @idx_exists = (
    SELECT COUNT(*) FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'EXAM_RESULT'
      AND index_name = 'uc_exam_student'
);
SET @sql = IF(@idx_exists = 0,
    'ALTER TABLE EXAM_RESULT ADD CONSTRAINT uc_exam_student UNIQUE (exam_id, student_id)',
    'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Notification list by user + created_at (paginated /me)
SET @idx_notif = (
    SELECT COUNT(*) FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = 'NOTIFICATION'
      AND index_name = 'idx_notification_user_created'
);
SET @sql2 = IF(@idx_notif = 0,
    'CREATE INDEX idx_notification_user_created ON NOTIFICATION(user_id, created_at DESC)',
    'SELECT 1');
PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;
