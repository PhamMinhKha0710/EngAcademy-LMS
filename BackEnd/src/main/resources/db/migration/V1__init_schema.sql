-- =====================================================
-- INITIAL DATABASE SCHEMA FOR ENGLISH LEARNING PLATFORM
-- Flyway Migration V1
-- MySQL 8.0+ Syntax
-- =====================================================

-- 1. ROLE TABLE
CREATE TABLE IF NOT EXISTS ROLE (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. SCHOOL TABLE
CREATE TABLE IF NOT EXISTS SCHOOL (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    address VARCHAR(500),
    phone VARCHAR(20),
    email VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    trial_end_date DATE,
    created_at DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. USERS TABLE
CREATE TABLE IF NOT EXISTS USERS (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    date_of_birth DATE,
    avatar_url VARCHAR(500),
    coins INT DEFAULT 0,
    streak_days INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME,
    updated_at DATETIME,
    sound_effects_enabled BOOLEAN DEFAULT TRUE,
    daily_reminders_enabled BOOLEAN DEFAULT TRUE,
    prefers_dark_mode BOOLEAN,
    school_id BIGINT,
    FOREIGN KEY (school_id) REFERENCES SCHOOL(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for USERS
CREATE INDEX idx_user_coins ON USERS(coins);
CREATE INDEX idx_user_streak ON USERS(streak_days);
CREATE INDEX idx_user_school ON USERS(school_id);

-- 4. ROLE_USER (Many-to-Many)
CREATE TABLE IF NOT EXISTS ROLE_USER (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES ROLE(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. CLASS TABLE (ClassRoom)
CREATE TABLE IF NOT EXISTS CLASS (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    school_id BIGINT NOT NULL,
    teacher_id BIGINT,
    academic_year VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME,
    FOREIGN KEY (school_id) REFERENCES SCHOOL(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES USERS(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. TOPIC TABLE
CREATE TABLE IF NOT EXISTS TOPIC (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL,
    description TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. LESSON TABLE
CREATE TABLE IF NOT EXISTS LESSON (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    topic_id BIGINT,
    content_html TEXT,
    grammar_html TEXT,
    audio_url VARCHAR(500),
    video_url VARCHAR(500),
    difficulty_level INT,
    order_index INT,
    is_published BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (topic_id) REFERENCES TOPIC(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. VOCABULARY TABLE
CREATE TABLE IF NOT EXISTS VOCABULARY (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    lesson_id BIGINT NOT NULL,
    word VARCHAR(100) NOT NULL,
    pronunciation VARCHAR(100),
    meaning TEXT,
    example_sentence TEXT,
    image_url VARCHAR(500),
    audio_url VARCHAR(500),
    FOREIGN KEY (lesson_id) REFERENCES LESSON(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. QUESTION TABLE
CREATE TABLE IF NOT EXISTS QUESTION (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    lesson_id BIGINT,
    vocabulary_id BIGINT,
    question_type VARCHAR(50),
    question_text TEXT NOT NULL,
    points INT DEFAULT 1,
    explanation TEXT,
    FOREIGN KEY (lesson_id) REFERENCES LESSON(id) ON DELETE CASCADE,
    FOREIGN KEY (vocabulary_id) REFERENCES VOCABULARY(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for QUESTION
CREATE INDEX idx_question_lesson ON QUESTION(lesson_id);
CREATE INDEX idx_question_vocab ON QUESTION(vocabulary_id);
CREATE INDEX idx_question_type ON QUESTION(question_type);

-- 10. QUESTION_OPTION TABLE
CREATE TABLE IF NOT EXISTS QUESTION_OPTION (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    question_id BIGINT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (question_id) REFERENCES QUESTION(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. EXAM TABLE
CREATE TABLE IF NOT EXISTS EXAM (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    teacher_id BIGINT NOT NULL,
    class_id BIGINT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    duration_minutes INT NOT NULL,
    shuffle_questions BOOLEAN DEFAULT TRUE,
    shuffle_answers BOOLEAN DEFAULT TRUE,
    anti_cheat_enabled BOOLEAN DEFAULT TRUE,
    status VARCHAR(20) DEFAULT 'DRAFT',
    score_published BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (teacher_id) REFERENCES USERS(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES CLASS(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for EXAM
CREATE INDEX idx_exam_class ON EXAM(class_id);
CREATE INDEX idx_exam_teacher ON EXAM(teacher_id);
CREATE INDEX idx_exam_status ON EXAM(status);
CREATE INDEX idx_exam_time ON EXAM(start_time, end_time);

-- 12. EXAM_QUESTION (Many-to-Many)
CREATE TABLE IF NOT EXISTS EXAM_QUESTION (
    exam_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    PRIMARY KEY (exam_id, question_id),
    FOREIGN KEY (exam_id) REFERENCES EXAM(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES QUESTION(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. EXAM_RESULT TABLE
CREATE TABLE IF NOT EXISTS EXAM_RESULT (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    exam_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    score DECIMAL(5,2),
    correct_count INT,
    total_questions INT,
    submitted_at DATETIME,
    violation_count INT DEFAULT 0,
    FOREIGN KEY (exam_id) REFERENCES EXAM(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES USERS(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for EXAM_RESULT
CREATE INDEX idx_exam_result_user ON EXAM_RESULT(student_id);
CREATE INDEX idx_exam_result_exam ON EXAM_RESULT(exam_id);
CREATE INDEX idx_exam_result_submitted ON EXAM_RESULT(submitted_at);

-- 14. STUDENT_CLASS TABLE (Many-to-Many with extra fields)
CREATE TABLE IF NOT EXISTS STUDENT_CLASS (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    student_id BIGINT NOT NULL,
    class_id BIGINT NOT NULL,
    joined_at DATETIME,
    status VARCHAR(20),
    FOREIGN KEY (student_id) REFERENCES USERS(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES CLASS(id) ON DELETE CASCADE,
    UNIQUE KEY unique_student_class (student_id, class_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. CONTENT_TAG TABLE
CREATE TABLE IF NOT EXISTS CONTENT_TAG (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50),
    created_at DATETIME
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index for CONTENT_TAG
CREATE INDEX idx_tag_name ON CONTENT_TAG(name);

-- 16. LESSON_TAG TABLE (Many-to-Many)
CREATE TABLE IF NOT EXISTS LESSON_TAG (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    lesson_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    FOREIGN KEY (lesson_id) REFERENCES LESSON(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES CONTENT_TAG(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index for LESSON_TAG
CREATE INDEX idx_lesson_tag_tag ON LESSON_TAG(tag_id);

-- =====================================================
-- 17. BADGE TABLE (User badges earned)
-- =====================================================
CREATE TABLE IF NOT EXISTS BADGE (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    icon_url VARCHAR(500),
    earned_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 18. PROGRESS TABLE (User lesson progress)
-- =====================================================
CREATE TABLE IF NOT EXISTS PROGRESS (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    lesson_id BIGINT NOT NULL,
    completion_percentage INT DEFAULT 0,
    last_accessed DATETIME,
    is_completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE,
    FOREIGN KEY (lesson_id) REFERENCES LESSON(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_lesson (user_id, lesson_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for PROGRESS
CREATE INDEX idx_progress_user ON PROGRESS(user_id);
CREATE INDEX idx_progress_lesson ON PROGRESS(lesson_id);
CREATE INDEX idx_progress_completed ON PROGRESS(is_completed);

-- =====================================================
-- 19. USER_STUDY_STATS TABLE (Aggregated user stats)
-- =====================================================
CREATE TABLE IF NOT EXISTS USER_STUDY_STATS (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_study_date DATE,
    total_lessons_completed INT DEFAULT 0,
    lessons_completed_today INT DEFAULT 0,
    total_words_learned INT DEFAULT 0,
    words_reviewed_today INT DEFAULT 0,
    word_retention_rate DOUBLE DEFAULT 0,
    total_quizzes_taken INT DEFAULT 0,
    consecutive_perfect_quizzes INT DEFAULT 0,
    last_quiz_score INT DEFAULT 0,
    last_quiz_duration_seconds INT DEFAULT 0,
    quiz_retake_after_fail BOOLEAN DEFAULT FALSE,
    last_study_hour INT DEFAULT 0,
    early_morning_streak INT DEFAULT 0,
    friends_invited INT DEFAULT 0,
    pvp_wins INT DEFAULT 0,
    dialogues_completed INT DEFAULT 0,
    mini_games_correct INT DEFAULT 0,
    current_level INT DEFAULT 1,
    weekly_tasks_completion_rate DOUBLE DEFAULT 0,
    is_top_of_leaderboard BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 20. USER_TOPIC_PROGRESS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS USER_TOPIC_PROGRESS (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    topic_id BIGINT NOT NULL,
    completed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE,
    FOREIGN KEY (topic_id) REFERENCES TOPIC(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_topic (user_id, topic_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 21. USER_VOCABULARY TABLE (User's vocab learning status)
-- =====================================================
CREATE TABLE IF NOT EXISTS USER_VOCABULARY (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    vocabulary_id BIGINT NOT NULL,
    status VARCHAR(20) DEFAULT 'NEW',
    review_count INT DEFAULT 0,
    last_reviewed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE,
    FOREIGN KEY (vocabulary_id) REFERENCES VOCABULARY(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_vocab (user_id, vocabulary_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 22. DAILY_QUEST TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS DAILY_QUEST (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    quest_date DATE NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_quest_date (user_id, quest_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for DAILY_QUEST
CREATE INDEX idx_daily_quest_user_date ON DAILY_QUEST(user_id, quest_date);
CREATE INDEX idx_daily_quest_user ON DAILY_QUEST(user_id);

-- =====================================================
-- 23. DAILY_QUEST_TASK TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS DAILY_QUEST_TASK (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    daily_quest_id BIGINT NOT NULL,
    task_type VARCHAR(50) NOT NULL,
    target_count INT,
    current_count INT DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (daily_quest_id) REFERENCES DAILY_QUEST(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 24. NOTIFICATION TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS NOTIFICATION (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    image_url VARCHAR(500),
    created_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 25. LEARNING_EVENT TABLE (Audit trail for learning activities)
-- =====================================================
CREATE TABLE IF NOT EXISTS LEARNING_EVENT (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    content_type VARCHAR(50),
    content_id BIGINT,
    skill VARCHAR(20),
    cefr_level VARCHAR(10),
    is_correct BOOLEAN,
    time_spent_seconds INT,
    session_id VARCHAR(100),
    metadata TEXT,
    created_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for LEARNING_EVENT
CREATE INDEX idx_event_user ON LEARNING_EVENT(user_id);
CREATE INDEX idx_event_type ON LEARNING_EVENT(event_type);
CREATE INDEX idx_event_created ON LEARNING_EVENT(created_at);
CREATE INDEX idx_event_user_created ON LEARNING_EVENT(user_id, created_at);

-- =====================================================
-- 26. GRAMMAR TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS GRAMMAR (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    lesson_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    explanation TEXT,
    example TEXT,
    FOREIGN KEY (lesson_id) REFERENCES LESSON(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 27. EXAM_ANSWER TABLE (Student answers for exam questions)
-- =====================================================
CREATE TABLE IF NOT EXISTS EXAM_ANSWER (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    exam_result_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    selected_option_id BIGINT,
    is_correct BOOLEAN,
    FOREIGN KEY (exam_result_id) REFERENCES EXAM_RESULT(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES QUESTION(id) ON DELETE CASCADE,
    FOREIGN KEY (selected_option_id) REFERENCES QUESTION_OPTION(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 28. PLACEMENT_QUESTION TABLE (Already created above)
-- =====================================================
-- (Already created in section above)

-- =====================================================
-- 29. USER_LEARNING_PROFILE TABLE (User's learning preferences)
-- =====================================================
CREATE TABLE IF NOT EXISTS USER_LEARNING_PROFILE (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    grammar_level VARCHAR(10) NOT NULL DEFAULT 'A1',
    vocabulary_level VARCHAR(10) NOT NULL DEFAULT 'A1',
    reading_level VARCHAR(10) NOT NULL DEFAULT 'A1',
    listening_level VARCHAR(10) NOT NULL DEFAULT 'A1',
    overall_level VARCHAR(10) NOT NULL DEFAULT 'A1',
    primary_goal VARCHAR(20) NOT NULL DEFAULT 'COMMUNICATION',
    daily_target_minutes INT DEFAULT 15,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_completed_at DATETIME,
    created_at DATETIME,
    updated_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 30. PROFILE_PREFERRED_TOPICS TABLE (Collection table for UserLearningProfile)
-- =====================================================
CREATE TABLE IF NOT EXISTS PROFILE_PREFERRED_TOPICS (
    profile_id BIGINT NOT NULL,
    topic VARCHAR(255) NOT NULL,
    PRIMARY KEY (profile_id, topic),
    FOREIGN KEY (profile_id) REFERENCES USER_LEARNING_PROFILE(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 31. PROFILE_WEAK_SKILLS TABLE (Collection table for UserLearningProfile)
-- =====================================================
CREATE TABLE IF NOT EXISTS PROFILE_WEAK_SKILLS (
    profile_id BIGINT NOT NULL,
    skill VARCHAR(20) NOT NULL,
    PRIMARY KEY (profile_id, skill),
    FOREIGN KEY (profile_id) REFERENCES USER_LEARNING_PROFILE(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 32. ANTI_CHEAT_EVENT TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS ANTI_CHEAT_EVENT (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    exam_result_id BIGINT NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_time DATETIME NOT NULL,
    details TEXT,
    FOREIGN KEY (exam_result_id) REFERENCES EXAM_RESULT(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Indexes for ANTI_CHEAT_EVENT
CREATE INDEX idx_anticheat_exam_result ON ANTI_CHEAT_EVENT(exam_result_id);
CREATE INDEX idx_anticheat_time ON ANTI_CHEAT_EVENT(event_time);
CREATE INDEX idx_anticheat_type ON ANTI_CHEAT_EVENT(event_type);

-- =====================================================
-- 33. AUDIT_LOG TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS AUDIT_LOG (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    action VARCHAR(50) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    created_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- END OF MIGRATION V1
-- =====================================================