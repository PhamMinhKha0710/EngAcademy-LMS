-- V0: All base tables — JPA-managed entities in dependency order
-- Must run first. All later migrations reference these tables.

-- Level 0: Independent base tables
CREATE TABLE IF NOT EXISTS SCHOOL (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    address VARCHAR(500),
    phone VARCHAR(20),
    email VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    trial_end_date DATE,
    created_at DATETIME
);

CREATE TABLE IF NOT EXISTS TOPIC (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS ROLE (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS BADGE_DEFINITION (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    badge_key VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    icon_emoji VARCHAR(10),
    group_name VARCHAR(20) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    is_secret BOOLEAN NOT NULL DEFAULT FALSE
);

-- Level 1: Core user tables
CREATE TABLE IF NOT EXISTS USERS (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    date_of_birth DATE,
    avatar_url VARCHAR(500),
    coins INT NOT NULL DEFAULT 0,
    streak_days INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    school_id BIGINT,
    sound_effects_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    daily_reminders_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    prefers_dark_mode BOOLEAN,
    created_at DATETIME,
    updated_at DATETIME
);

CREATE INDEX idx_user_coins ON USERS(coins);
CREATE INDEX idx_user_streak ON USERS(streak_days);
CREATE INDEX idx_user_school ON USERS(school_id);
ALTER TABLE USERS ADD CONSTRAINT fk_user_school FOREIGN KEY (school_id) REFERENCES SCHOOL(id) ON DELETE SET NULL;

-- Level 2: Join table and user-owned tables (after USERS exists)
CREATE TABLE IF NOT EXISTS ROLE_USER (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_ru_user FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE,
    CONSTRAINT fk_ru_role FOREIGN KEY (role_id) REFERENCES ROLE(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS USER_LEARNING_PROFILE (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    grammar_level VARCHAR(10) NOT NULL DEFAULT 'A1',
    vocabulary_level VARCHAR(10) NOT NULL DEFAULT 'A1',
    reading_level VARCHAR(10) NOT NULL DEFAULT 'A1',
    listening_level VARCHAR(10) NOT NULL DEFAULT 'A1',
    overall_level VARCHAR(10) NOT NULL DEFAULT 'A1',
    primary_goal VARCHAR(20) NOT NULL DEFAULT 'COMMUNICATION',
    daily_target_minutes INT NOT NULL DEFAULT 15,
    onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
    onboarding_completed_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_profile_user FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE,
    CONSTRAINT chk_grammar_level CHECK (grammar_level IN ('A1','A2','B1','B2','C1','C2')),
    CONSTRAINT chk_vocab_level CHECK (vocabulary_level IN ('A1','A2','B1','B2','C1','C2')),
    CONSTRAINT chk_reading_level CHECK (reading_level IN ('A1','A2','B1','B2','C1','C2')),
    CONSTRAINT chk_listening_level CHECK (listening_level IN ('A1','A2','B1','B2','C1','C2')),
    CONSTRAINT chk_overall_level CHECK (overall_level IN ('A1','A2','B1','B2','C1','C2')),
    CONSTRAINT chk_goal CHECK (primary_goal IN ('COMMUNICATION','EXAM_PREP','BUSINESS'))
);
CREATE INDEX idx_profile_user ON USER_LEARNING_PROFILE(user_id);

CREATE TABLE IF NOT EXISTS PROFILE_PREFERRED_TOPICS (
    profile_id BIGINT NOT NULL,
    topic VARCHAR(100) NOT NULL,
    PRIMARY KEY (profile_id, topic),
    CONSTRAINT fk_topic_profile FOREIGN KEY (profile_id) REFERENCES USER_LEARNING_PROFILE(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS PROFILE_WEAK_SKILLS (
    profile_id BIGINT NOT NULL,
    skill VARCHAR(20) NOT NULL,
    PRIMARY KEY (profile_id, skill),
    CONSTRAINT fk_weak_skill_profile FOREIGN KEY (profile_id) REFERENCES USER_LEARNING_PROFILE(id) ON DELETE CASCADE,
    CONSTRAINT chk_weak_skill CHECK (skill IN ('GRAMMAR','VOCABULARY','READING','LISTENING'))
);

CREATE TABLE IF NOT EXISTS USER_STUDY_STATS (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    current_streak INT NOT NULL DEFAULT 0,
    longest_streak INT NOT NULL DEFAULT 0,
    last_study_date DATE,
    total_lessons_completed INT NOT NULL DEFAULT 0,
    lessons_completed_today INT NOT NULL DEFAULT 0,
    total_words_learned INT NOT NULL DEFAULT 0,
    words_reviewed_today INT NOT NULL DEFAULT 0,
    word_retention_rate DOUBLE NOT NULL DEFAULT 0,
    total_quizzes_taken INT NOT NULL DEFAULT 0,
    consecutive_perfect_quizzes INT NOT NULL DEFAULT 0,
    last_quiz_score INT NOT NULL DEFAULT 0,
    last_quiz_duration_seconds INT NOT NULL DEFAULT 0,
    quiz_retake_after_fail BOOLEAN NOT NULL DEFAULT FALSE,
    last_study_hour INT NOT NULL DEFAULT 0,
    early_morning_streak INT NOT NULL DEFAULT 0,
    friends_invited INT NOT NULL DEFAULT 0,
    pvp_wins INT NOT NULL DEFAULT 0,
    dialogues_completed INT NOT NULL DEFAULT 0,
    mini_games_correct INT NOT NULL DEFAULT 0,
    current_level INT NOT NULL DEFAULT 1,
    weekly_tasks_completion_rate DOUBLE NOT NULL DEFAULT 0,
    is_top_of_leaderboard BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_stats_user FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS NOTIFICATION (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    image_url VARCHAR(500),
    created_at DATETIME,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE
);
CREATE INDEX idx_notification_user ON NOTIFICATION(user_id, is_read);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expired_at DATETIME NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_password_token_user FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE
);
CREATE INDEX idx_password_token_user ON password_reset_tokens(user_id);

CREATE TABLE IF NOT EXISTS AUDIT_LOG (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT,
    action VARCHAR(50) NOT NULL,
    details TEXT,
    ip_address VARCHAR(50),
    user_agent VARCHAR(500),
    created_at DATETIME
);
CREATE INDEX idx_audit_user ON AUDIT_LOG(user_id);
CREATE INDEX idx_audit_action ON AUDIT_LOG(action);

-- Level 3: Classroom tables
CREATE TABLE IF NOT EXISTS CLASS (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    school_id BIGINT NOT NULL,
    teacher_id BIGINT,
    academic_year VARCHAR(20),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME,
    CONSTRAINT fk_class_school FOREIGN KEY (school_id) REFERENCES SCHOOL(id) ON DELETE CASCADE,
    CONSTRAINT fk_class_teacher FOREIGN KEY (teacher_id) REFERENCES USERS(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS STUDENT_CLASS (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    class_id BIGINT NOT NULL,
    joined_at DATETIME,
    status VARCHAR(20),
    CONSTRAINT fk_sc_student FOREIGN KEY (student_id) REFERENCES USERS(id) ON DELETE CASCADE,
    CONSTRAINT fk_sc_class FOREIGN KEY (class_id) REFERENCES CLASS(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX idx_student_class ON STUDENT_CLASS(student_id, class_id);

-- Level 4: Content tables
CREATE TABLE IF NOT EXISTS LESSON (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    topic_id BIGINT,
    content_html TEXT,
    grammar_html TEXT,
    audio_url VARCHAR(500),
    video_url VARCHAR(500),
    difficulty_level INT,
    order_index INT,
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_lesson_topic FOREIGN KEY (topic_id) REFERENCES TOPIC(id) ON DELETE SET NULL
);
CREATE INDEX idx_lesson_topic ON LESSON(topic_id);

CREATE TABLE IF NOT EXISTS VOCABULARY (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lesson_id BIGINT NOT NULL,
    word VARCHAR(100) NOT NULL,
    pronunciation VARCHAR(100),
    meaning TEXT,
    example_sentence TEXT,
    image_url VARCHAR(500),
    audio_url VARCHAR(500),
    CONSTRAINT fk_vocab_lesson FOREIGN KEY (lesson_id) REFERENCES LESSON(id) ON DELETE CASCADE
);
CREATE INDEX idx_vocab_lesson ON VOCABULARY(lesson_id);

CREATE TABLE IF NOT EXISTS GRAMMAR (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lesson_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    explanation TEXT,
    example TEXT,
    CONSTRAINT fk_grammar_lesson FOREIGN KEY (lesson_id) REFERENCES LESSON(id) ON DELETE CASCADE
);
CREATE INDEX idx_grammar_lesson ON GRAMMAR(lesson_id);

CREATE TABLE IF NOT EXISTS QUESTION (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lesson_id BIGINT,
    vocabulary_id BIGINT,
    question_type VARCHAR(50),
    question_text TEXT NOT NULL,
    points INT NOT NULL DEFAULT 1,
    explanation TEXT,
    CONSTRAINT fk_question_lesson FOREIGN KEY (lesson_id) REFERENCES LESSON(id) ON DELETE CASCADE,
    CONSTRAINT fk_question_vocab FOREIGN KEY (vocabulary_id) REFERENCES VOCABULARY(id) ON DELETE CASCADE
);
CREATE INDEX idx_question_lesson ON QUESTION(lesson_id);
CREATE INDEX idx_question_vocab ON QUESTION(vocabulary_id);
CREATE INDEX idx_question_type ON QUESTION(question_type);

CREATE TABLE IF NOT EXISTS QUESTION_OPTION (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    question_id BIGINT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_option_question FOREIGN KEY (question_id) REFERENCES QUESTION(id) ON DELETE CASCADE
);
CREATE INDEX idx_option_question ON QUESTION_OPTION(question_id);

-- Level 5: User-content relationship tables
CREATE TABLE IF NOT EXISTS USER_VOCABULARY (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    vocabulary_id BIGINT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'NEW',
    review_count INT NOT NULL DEFAULT 0,
    last_reviewed_at DATETIME,
    CONSTRAINT fk_uv_user FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE,
    CONSTRAINT fk_uv_vocab FOREIGN KEY (vocabulary_id) REFERENCES VOCABULARY(id) ON DELETE CASCADE,
    CONSTRAINT chk_vocab_status CHECK (status IN ('NEW','LEARNING','MASTERED'))
);
CREATE UNIQUE INDEX idx_uv_user_vocab ON USER_VOCABULARY(user_id, vocabulary_id);

CREATE TABLE IF NOT EXISTS PROGRESS (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    lesson_id BIGINT NOT NULL,
    completion_percentage INT NOT NULL DEFAULT 0,
    last_accessed DATETIME,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_progress_user FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE,
    CONSTRAINT fk_progress_lesson FOREIGN KEY (lesson_id) REFERENCES LESSON(id) ON DELETE CASCADE,
    CONSTRAINT uk_progress_user_lesson UNIQUE (user_id, lesson_id)
);
CREATE INDEX idx_progress_user ON PROGRESS(user_id);
CREATE INDEX idx_progress_completed ON PROGRESS(is_completed);

CREATE TABLE IF NOT EXISTS USER_TOPIC_PROGRESS (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    topic_id BIGINT NOT NULL,
    completed_at DATETIME,
    CONSTRAINT fk_utp_user FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE,
    CONSTRAINT fk_utp_topic FOREIGN KEY (topic_id) REFERENCES TOPIC(id) ON DELETE CASCADE,
    CONSTRAINT uk_utp_user_topic UNIQUE (user_id, topic_id)
);

CREATE TABLE IF NOT EXISTS MISTAKE_NOTEBOOK (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    vocabulary_id BIGINT,
    mistake_count INT NOT NULL DEFAULT 1,
    user_recording_url VARCHAR(500),
    added_at DATETIME,
    CONSTRAINT fk_mistake_user FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE,
    CONSTRAINT fk_mistake_vocab FOREIGN KEY (vocabulary_id) REFERENCES VOCABULARY(id) ON DELETE CASCADE
);
CREATE INDEX idx_mistake_user ON MISTAKE_NOTEBOOK(user_id);
CREATE INDEX idx_mistake_vocab ON MISTAKE_NOTEBOOK(vocabulary_id);
CREATE INDEX idx_mistake_count ON MISTAKE_NOTEBOOK(mistake_count);

-- Level 6: Badge tables
CREATE TABLE IF NOT EXISTS BADGE (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    icon_url VARCHAR(500),
    earned_at DATETIME,
    CONSTRAINT fk_badge_user FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE
);
CREATE INDEX idx_badge_user ON BADGE(user_id);

CREATE TABLE IF NOT EXISTS USER_BADGE (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    badge_id BIGINT NOT NULL,
    earned_at DATETIME,
    CONSTRAINT fk_ub_user FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE,
    CONSTRAINT fk_ub_badge FOREIGN KEY (badge_id) REFERENCES BADGE_DEFINITION(id) ON DELETE CASCADE,
    CONSTRAINT uk_ub_user_badge UNIQUE (user_id, badge_id)
);

-- Level 7: Exam tables
CREATE TABLE IF NOT EXISTS EXAM (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    teacher_id BIGINT NOT NULL,
    class_id BIGINT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    duration_minutes INT NOT NULL,
    shuffle_questions BOOLEAN NOT NULL DEFAULT TRUE,
    shuffle_answers BOOLEAN NOT NULL DEFAULT TRUE,
    anti_cheat_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    score_published BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_exam_teacher FOREIGN KEY (teacher_id) REFERENCES USERS(id) ON DELETE CASCADE,
    CONSTRAINT fk_exam_class FOREIGN KEY (class_id) REFERENCES CLASS(id) ON DELETE CASCADE,
    CONSTRAINT chk_exam_status CHECK (status IN ('DRAFT','PUBLISHED','CLOSED'))
);
CREATE INDEX idx_exam_class ON EXAM(class_id);
CREATE INDEX idx_exam_teacher ON EXAM(teacher_id);
CREATE INDEX idx_exam_status ON EXAM(status);
CREATE INDEX idx_exam_time ON EXAM(start_time, end_time);

CREATE TABLE IF NOT EXISTS EXAM_QUESTION (
    exam_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    PRIMARY KEY (exam_id, question_id),
    CONSTRAINT fk_eq_exam FOREIGN KEY (exam_id) REFERENCES EXAM(id) ON DELETE CASCADE,
    CONSTRAINT fk_eq_question FOREIGN KEY (question_id) REFERENCES QUESTION(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS EXAM_RESULT (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exam_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    score NUMERIC(5,2),
    correct_count INT,
    total_questions INT,
    submitted_at DATETIME,
    violation_count INT NOT NULL DEFAULT 0,
    CONSTRAINT fk_er_exam FOREIGN KEY (exam_id) REFERENCES EXAM(id) ON DELETE CASCADE,
    CONSTRAINT fk_er_student FOREIGN KEY (student_id) REFERENCES USERS(id) ON DELETE CASCADE
);
CREATE INDEX idx_er_student ON EXAM_RESULT(student_id);
CREATE INDEX idx_er_exam ON EXAM_RESULT(exam_id);
CREATE INDEX idx_er_submitted ON EXAM_RESULT(submitted_at);

CREATE TABLE IF NOT EXISTS EXAM_ANSWER (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exam_result_id BIGINT NOT NULL,
    question_id BIGINT NOT NULL,
    selected_option_id BIGINT,
    is_correct BOOLEAN,
    CONSTRAINT fk_ea_result FOREIGN KEY (exam_result_id) REFERENCES EXAM_RESULT(id) ON DELETE CASCADE,
    CONSTRAINT fk_ea_question FOREIGN KEY (question_id) REFERENCES QUESTION(id) ON DELETE CASCADE,
    CONSTRAINT fk_ea_option FOREIGN KEY (selected_option_id) REFERENCES QUESTION_OPTION(id) ON DELETE SET NULL
);
CREATE INDEX idx_ea_result ON EXAM_ANSWER(exam_result_id);

CREATE TABLE IF NOT EXISTS ANTI_CHEAT_EVENT (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    exam_result_id BIGINT NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_time DATETIME NOT NULL,
    details TEXT,
    CONSTRAINT fk_ace_result FOREIGN KEY (exam_result_id) REFERENCES EXAM_RESULT(id) ON DELETE CASCADE
);
CREATE INDEX idx_ace_result ON ANTI_CHEAT_EVENT(exam_result_id);
CREATE INDEX idx_ace_time ON ANTI_CHEAT_EVENT(event_time);
CREATE INDEX idx_ace_type ON ANTI_CHEAT_EVENT(event_type);

-- Level 8: Other feature tables
CREATE TABLE IF NOT EXISTS LEARNING_EVENT (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
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
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_event_user FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE,
    CONSTRAINT chk_event_type CHECK (event_type IN (
        'LESSON_START','LESSON_COMPLETE','LESSON_ABANDON',
        'QUIZ_START','QUIZ_ANSWER','QUIZ_COMPLETE','QUIZ_ABANDON',
        'FLASHCARD_REVIEW','FLASHCARD_AGAIN','FLASHCARD_HARD','FLASHCARD_GOOD','FLASHCARD_EASY',
        'EXAM_START','EXAM_ANSWER','EXAM_COMPLETE',
        'ONBOARDING_START','ONBOARDING_COMPLETE','PLACEMENT_COMPLETE',
        'SRS_REVIEW_DUE','SRS_REVIEW_COMPLETE',
        'PAGE_VIEW','ERROR'
    )),
    CONSTRAINT chk_event_skill CHECK (skill IS NULL OR skill IN ('GRAMMAR','VOCABULARY','READING','LISTENING'))
);
CREATE INDEX idx_event_user ON LEARNING_EVENT(user_id);
CREATE INDEX idx_event_type ON LEARNING_EVENT(event_type);
CREATE INDEX idx_event_created ON LEARNING_EVENT(created_at);
CREATE INDEX idx_event_user_created ON LEARNING_EVENT(user_id, created_at);

CREATE TABLE IF NOT EXISTS PLACEMENT_QUESTION (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    skill VARCHAR(20) NOT NULL,
    cefr_band VARCHAR(10) NOT NULL,
    difficulty_weight DOUBLE NOT NULL DEFAULT 0.5,
    question_text TEXT NOT NULL,
    correct_answer VARCHAR(500),
    explanation TEXT,
    option_a VARCHAR(500),
    option_b VARCHAR(500),
    option_c VARCHAR(500),
    option_d VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_placement_skill CHECK (skill IN ('GRAMMAR','VOCABULARY','READING','LISTENING')),
    CONSTRAINT chk_placement_cefr CHECK (cefr_band IN ('A1','A2','B1','B2','C1','C2'))
);
CREATE INDEX idx_placement_skill_cefr ON PLACEMENT_QUESTION(skill, cefr_band, is_active);

CREATE TABLE IF NOT EXISTS DAILY_QUEST (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    quest_date DATE NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_dq_user FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE
);
CREATE INDEX idx_dq_user_date ON DAILY_QUEST(user_id, quest_date);
CREATE INDEX idx_dq_user ON DAILY_QUEST(user_id);

CREATE TABLE IF NOT EXISTS DAILY_QUEST_TASK (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    daily_quest_id BIGINT NOT NULL,
    task_type VARCHAR(50) NOT NULL,
    target_count INT,
    current_count INT NOT NULL DEFAULT 0,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_dqt_quest FOREIGN KEY (daily_quest_id) REFERENCES DAILY_QUEST(id) ON DELETE CASCADE
);
CREATE INDEX idx_dqt_quest ON DAILY_QUEST_TASK(daily_quest_id);

CREATE TABLE IF NOT EXISTS FLASHCARD_REVIEW (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    vocabulary_id BIGINT,
    grammar_id BIGINT,
    easiness_factor DOUBLE NOT NULL DEFAULT 2.5,
    interval_days INT NOT NULL DEFAULT 1,
    repetitions INT NOT NULL DEFAULT 0,
    next_review_at DATE NOT NULL,
    last_reviewed_at DATETIME,
    created_at DATETIME,
    updated_at DATETIME,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT fk_flash_user FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE,
    CONSTRAINT fk_flash_vocab FOREIGN KEY (vocabulary_id) REFERENCES VOCABULARY(id) ON DELETE CASCADE,
    CONSTRAINT fk_flash_grammar FOREIGN KEY (grammar_id) REFERENCES GRAMMAR(id) ON DELETE CASCADE,
    CONSTRAINT chk_flash_content CHECK (
        (vocabulary_id IS NOT NULL AND grammar_id IS NULL) OR
        (vocabulary_id IS NULL AND grammar_id IS NOT NULL)
    )
);
CREATE INDEX idx_flash_user_next ON FLASHCARD_REVIEW(user_id, next_review_at);
CREATE INDEX idx_flash_vocab_user ON FLASHCARD_REVIEW(user_id, vocabulary_id);
CREATE UNIQUE INDEX idx_flash_user_vocab ON FLASHCARD_REVIEW(user_id, vocabulary_id);
CREATE UNIQUE INDEX idx_flash_user_grammar ON FLASHCARD_REVIEW(user_id, grammar_id);

-- Level 9: Content metadata tables
CREATE TABLE IF NOT EXISTS CONTENT_TAG (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50),
    created_at DATETIME
);
CREATE INDEX idx_content_tag_category ON CONTENT_TAG(category);

CREATE TABLE IF NOT EXISTS LESSON_TAG (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    lesson_id BIGINT NOT NULL,
    tag_id BIGINT NOT NULL,
    CONSTRAINT fk_lt_lesson FOREIGN KEY (lesson_id) REFERENCES LESSON(id) ON DELETE CASCADE,
    CONSTRAINT fk_lt_tag FOREIGN KEY (tag_id) REFERENCES CONTENT_TAG(id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX idx_lt_lesson_tag ON LESSON_TAG(lesson_id, tag_id);
CREATE INDEX idx_lt_tag ON LESSON_TAG(tag_id);

-- Level 10: AI, A/B Testing, Learning Path
CREATE TABLE IF NOT EXISTS AI_FEEDBACK_CACHE (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    content_type VARCHAR(20) NOT NULL,
    content_id BIGINT NOT NULL,
    prompt_hash VARCHAR(64) NOT NULL,
    model_used VARCHAR(50),
    feedback_text TEXT,
    cefr_level VARCHAR(10),
    tokens_used INT,
    latency_ms INT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE,
    CONSTRAINT chk_feedback_content CHECK (content_type IN ('ESSAY','WRITING','CONVERSATION'))
);
CREATE INDEX idx_feedback_user_content ON AI_FEEDBACK_CACHE(user_id, content_type, content_id);
CREATE INDEX idx_feedback_hash ON AI_FEEDBACK_CACHE(prompt_hash);

CREATE TABLE IF NOT EXISTS LEARNING_PATH (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    target_cefr VARCHAR(10),
    target_goal VARCHAR(20),
    estimated_days INT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_path_cefr CHECK (target_cefr IS NULL OR target_cefr IN ('A1','A2','B1','B2','C1','C2')),
    CONSTRAINT chk_path_goal CHECK (target_goal IS NULL OR target_goal IN ('COMMUNICATION','EXAM_PREP','BUSINESS'))
);
CREATE INDEX idx_path_active ON LEARNING_PATH(is_active);

CREATE TABLE IF NOT EXISTS LEARNING_PATH_NODE (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    path_id BIGINT NOT NULL,
    lesson_id BIGINT,
    vocabulary_id BIGINT,
    grammar_id BIGINT,
    skill VARCHAR(20),
    cefr_level VARCHAR(10),
    order_index INT NOT NULL DEFAULT 0,
    estimated_minutes INT DEFAULT 15,
    is_required BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_node_path FOREIGN KEY (path_id) REFERENCES LEARNING_PATH(id) ON DELETE CASCADE,
    CONSTRAINT chk_path_node_content CHECK (
        (lesson_id IS NOT NULL AND vocabulary_id IS NULL AND grammar_id IS NULL) OR
        (lesson_id IS NULL AND vocabulary_id IS NOT NULL AND grammar_id IS NULL) OR
        (lesson_id IS NULL AND vocabulary_id IS NULL AND grammar_id IS NOT NULL)
    ),
    CONSTRAINT chk_node_skill CHECK (skill IS NULL OR skill IN ('GRAMMAR','VOCABULARY','READING','LISTENING'))
);
CREATE INDEX idx_node_path_order ON LEARNING_PATH_NODE(path_id, order_index);

CREATE TABLE IF NOT EXISTS LEARNING_PATH_EDGE (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    path_id BIGINT NOT NULL,
    from_node_id BIGINT NOT NULL,
    to_node_id BIGINT NOT NULL,
    edge_type VARCHAR(20) NOT NULL DEFAULT 'PREREQUISITE',
    CONSTRAINT fk_edge_path FOREIGN KEY (path_id) REFERENCES LEARNING_PATH(id) ON DELETE CASCADE,
    CONSTRAINT fk_edge_from FOREIGN KEY (from_node_id) REFERENCES LEARNING_PATH_NODE(id) ON DELETE CASCADE,
    CONSTRAINT fk_edge_to FOREIGN KEY (to_node_id) REFERENCES LEARNING_PATH_NODE(id) ON DELETE CASCADE,
    CONSTRAINT chk_edge_type CHECK (edge_type IN ('PREREQUISITE','OPTIONAL','PARALLEL'))
);
CREATE INDEX idx_edge_path ON LEARNING_PATH_EDGE(path_id);

CREATE TABLE IF NOT EXISTS AB_EXPERIMENT (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    experiment_key VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    variant_a VARCHAR(50) NOT NULL DEFAULT 'control',
    variant_b VARCHAR(50) NOT NULL DEFAULT 'treatment',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_ab_experiment_active ON AB_EXPERIMENT(is_active);

CREATE TABLE IF NOT EXISTS AB_ASSIGNMENT (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    experiment_key VARCHAR(100) NOT NULL,
    variant VARCHAR(20) NOT NULL,
    assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    converted_at DATETIME,
    CONSTRAINT fk_assignment_user FOREIGN KEY (user_id) REFERENCES USERS(id) ON DELETE CASCADE,
    CONSTRAINT chk_variant CHECK (variant IN ('control','treatment'))
);
CREATE INDEX idx_ab_user_exp ON AB_ASSIGNMENT(user_id, experiment_key);
