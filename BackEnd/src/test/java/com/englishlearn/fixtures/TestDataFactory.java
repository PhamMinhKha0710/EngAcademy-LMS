package com.englishlearn.fixtures;

import com.englishlearn.application.dto.request.LoginRequest;
import com.englishlearn.application.dto.request.RegisterRequest;
import com.englishlearn.application.dto.request.*;
import com.englishlearn.domain.entity.Role;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * TestDataFactory - Tao du lieu test mo phong nguoi dung that.
 * Du lieu nhat quan, co the tai su dung xuyen suot toan bo kich ban test.
 *
 * Personas:
 * - Admin: admin_nguyen
 * - School Manager: tran_school_hcm
 * - Teacher 1: gv_leminh
 * - Teacher 2: gv_phamthu
 * - Student 1: hs_ngoclinh
 * - Student 2: hs_ducmanh
 * - Student (bi khoa): hs_blocked
 */
public class TestDataFactory {

        private static final ObjectMapper objectMapper = new ObjectMapper()
                        .registerModule(new JavaTimeModule());

        // ==================== ADMIN ====================
        public static final String ADMIN_USERNAME = "admin_nguyen";
        public static final String ADMIN_EMAIL = "nguyenvanan.admin@gmail.com";
        public static final String ADMIN_PASSWORD = "Admin@2026!Secure";
        public static final String ADMIN_FULLNAME = "Nguyễn Văn An";

        // ==================== SCHOOL MANAGER ====================
        public static final String SCHOOL_USERNAME = "tran_school_hcm";
        public static final String SCHOOL_EMAIL = "tranthibich.edu@outlook.com";
        public static final String SCHOOL_PASSWORD = "School#Mgr2026";
        public static final String SCHOOL_FULLNAME = "Trần Thị Bích";

        // ==================== TEACHER 1 ====================
        public static final String TEACHER1_USERNAME = "gv_leminh";
        public static final String TEACHER1_EMAIL = "leminhhoang.teacher@gmail.com";
        public static final String TEACHER1_PASSWORD = "Teach3r!Pass2026";
        public static final String TEACHER1_FULLNAME = "Lê Minh Hoàng";

        // ==================== TEACHER 2 ====================
        public static final String TEACHER2_USERNAME = "gv_phamthu";
        public static final String TEACHER2_EMAIL = "phamthuhang.edu@gmail.com";
        public static final String TEACHER2_PASSWORD = "Gv@Pham2026!";
        public static final String TEACHER2_FULLNAME = "Phạm Thu Hằng";

        // ==================== STUDENT 1 ====================
        public static final String STUDENT1_USERNAME = "hs_ngoclinh";
        public static final String STUDENT1_EMAIL = "nguyenngoclinh2005@gmail.com";
        public static final String STUDENT1_PASSWORD = "Student!Linh2026";
        public static final String STUDENT1_FULLNAME = "Nguyễn Ngọc Linh";

        // ==================== STUDENT 2 ====================
        public static final String STUDENT2_USERNAME = "hs_ducmanh";
        public static final String STUDENT2_EMAIL = "leducmanh.k12@outlook.com";
        public static final String STUDENT2_PASSWORD = "Manh@Study2026";
        public static final String STUDENT2_FULLNAME = "Lê Đức Mạnh";

        // ==================== STUDENT BLOCKED ====================
        public static final String BLOCKED_USERNAME = "hs_blocked";
        public static final String BLOCKED_EMAIL = "blocked.student@gmail.com";
        public static final String BLOCKED_PASSWORD = "Block3d!2026";
        public static final String BLOCKED_FULLNAME = "Nguyễn Bị Khóa";

        // ==================== REGISTER REQUESTS ====================

        public static RegisterRequest adminRegisterRequest() {
                return RegisterRequest.builder()
                                .username(ADMIN_USERNAME)
                                .email(ADMIN_EMAIL)
                                .password(ADMIN_PASSWORD)
                                .fullName(ADMIN_FULLNAME)
                                .role("ADMIN")
                                .build();
        }

        public static RegisterRequest schoolRegisterRequest() {
                return RegisterRequest.builder()
                                .username(SCHOOL_USERNAME)
                                .email(SCHOOL_EMAIL)
                                .password(SCHOOL_PASSWORD)
                                .fullName(SCHOOL_FULLNAME)
                                .role("SCHOOL")
                                .build();
        }

        public static RegisterRequest teacher1RegisterRequest() {
                return RegisterRequest.builder()
                                .username(TEACHER1_USERNAME)
                                .email(TEACHER1_EMAIL)
                                .password(TEACHER1_PASSWORD)
                                .fullName(TEACHER1_FULLNAME)
                                .role("TEACHER")
                                .build();
        }

        public static RegisterRequest teacher2RegisterRequest() {
                return RegisterRequest.builder()
                                .username(TEACHER2_USERNAME)
                                .email(TEACHER2_EMAIL)
                                .password(TEACHER2_PASSWORD)
                                .fullName(TEACHER2_FULLNAME)
                                .role("TEACHER")
                                .build();
        }

        public static RegisterRequest student1RegisterRequest() {
                return RegisterRequest.builder()
                                .username(STUDENT1_USERNAME)
                                .email(STUDENT1_EMAIL)
                                .password(STUDENT1_PASSWORD)
                                .fullName(STUDENT1_FULLNAME)
                                .role("STUDENT")
                                .build();
        }

        public static RegisterRequest student2RegisterRequest() {
                return RegisterRequest.builder()
                                .username(STUDENT2_USERNAME)
                                .email(STUDENT2_EMAIL)
                                .password(STUDENT2_PASSWORD)
                                .fullName(STUDENT2_FULLNAME)
                                .role("STUDENT")
                                .build();
        }

        public static RegisterRequest studentDefaultRoleRequest() {
                return RegisterRequest.builder()
                                .username("hs_newstudent")
                                .email("newstudent.test@gmail.com")
                                .password("NewStud3nt!2026")
                                .fullName("Học Sinh Mới")
                                .role(null) // Should default to STUDENT
                                .build();
        }

        // ==================== LOGIN REQUESTS ====================

        public static LoginRequest adminLoginRequest() {
                return LoginRequest.builder()
                                .username(ADMIN_USERNAME)
                                .password(ADMIN_PASSWORD)
                                .build();
        }

        public static LoginRequest schoolLoginRequest() {
                return LoginRequest.builder()
                                .username(SCHOOL_USERNAME)
                                .password(SCHOOL_PASSWORD)
                                .build();
        }

        public static LoginRequest teacher1LoginRequest() {
                return LoginRequest.builder()
                                .username(TEACHER1_USERNAME)
                                .password(TEACHER1_PASSWORD)
                                .build();
        }

        public static LoginRequest student1LoginRequest() {
                return LoginRequest.builder()
                                .username(STUDENT1_USERNAME)
                                .password(STUDENT1_PASSWORD)
                                .build();
        }

        // ==================== USER DETAILS (for JWT generation) ====================

        public static UserDetails adminUserDetails() {
                return new User(ADMIN_USERNAME, ADMIN_PASSWORD,
                                List.of(new SimpleGrantedAuthority(Role.ADMIN)));
        }

        public static UserDetails schoolUserDetails() {
                return new User(SCHOOL_USERNAME, SCHOOL_PASSWORD,
                                List.of(new SimpleGrantedAuthority(Role.SCHOOL)));
        }

        public static UserDetails teacher1UserDetails() {
                return new User(TEACHER1_USERNAME, TEACHER1_PASSWORD,
                                List.of(new SimpleGrantedAuthority(Role.TEACHER)));
        }

        public static UserDetails teacher2UserDetails() {
                return new User(TEACHER2_USERNAME, TEACHER2_PASSWORD,
                                List.of(new SimpleGrantedAuthority(Role.TEACHER)));
        }

        public static UserDetails student1UserDetails() {
                return new User(STUDENT1_USERNAME, STUDENT1_PASSWORD,
                                List.of(new SimpleGrantedAuthority(Role.STUDENT)));
        }

        public static UserDetails student2UserDetails() {
                return new User(STUDENT2_USERNAME, STUDENT2_PASSWORD,
                                List.of(new SimpleGrantedAuthority(Role.STUDENT)));
        }

        // ==================== SCHOOL REQUESTS ====================

        public static SchoolRequest validSchoolRequest() {
                return SchoolRequest.builder()
                                .name("Trường THPT Nguyễn Huệ - Quận 1")
                                .address("123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM")
                                .phone("02838221234")
                                .email("nguyenhue.q1@edu.vn")
                                .trialEndDate(LocalDate.now().plusMonths(3))
                                .isActive(true)
                                .build();
        }

        public static SchoolRequest secondSchoolRequest() {
                return SchoolRequest.builder()
                                .name("Trường THCS Lê Quý Đôn - Quận 3")
                                .address("456 Võ Thị Sáu, Phường 6, Quận 3, TP.HCM")
                                .phone("02838334567")
                                .email("lequydon.q3@edu.vn")
                                .trialEndDate(LocalDate.now().plusMonths(6))
                                .isActive(true)
                                .build();
        }

        // ==================== CLASSROOM REQUESTS ====================

        public static ClassRoomRequest validClassRoomRequest(Long schoolId, Long teacherId) {
                return ClassRoomRequest.builder()
                                .name("Lớp 10A1 - Tiếng Anh Nâng Cao")
                                .schoolId(schoolId)
                                .teacherId(teacherId)
                                .academicYear("2025-2026")
                                .isActive(true)
                                .build();
        }

        public static ClassRoomRequest secondClassRoomRequest(Long schoolId, Long teacherId) {
                return ClassRoomRequest.builder()
                                .name("Lớp 11B2 - Tiếng Anh Cơ Bản")
                                .schoolId(schoolId)
                                .teacherId(teacherId)
                                .academicYear("2025-2026")
                                .isActive(true)
                                .build();
        }

        // ==================== LESSON REQUESTS ====================

        public static LessonRequest validLessonRequest(Long topicId) {
                return LessonRequest.builder()
                                .title("Bài 1: Greeting and Introduction - Chào hỏi và giới thiệu")
                                .topicId(topicId)
                                .contentHtml("<h1>Greeting and Introduction</h1><p>In this lesson, we will learn common greetings in English.</p>")
                                .audioUrl("https://cdn.englishlearn.vn/audio/lesson1-greeting.mp3")
                                .videoUrl("https://cdn.englishlearn.vn/video/lesson1-greeting.mp4")
                                .difficultyLevel(1)
                                .orderIndex(1)
                                .isPublished(true)
                                .build();
        }

        public static LessonRequest secondLessonRequest(Long topicId) {
                return LessonRequest.builder()
                                .title("Bài 2: Family Members - Thành viên trong gia đình")
                                .topicId(topicId)
                                .contentHtml("<h1>Family Members</h1><p>Learn vocabulary about family members.</p>")
                                .audioUrl("https://cdn.englishlearn.vn/audio/lesson2-family.mp3")
                                .videoUrl(null)
                                .difficultyLevel(1)
                                .orderIndex(2)
                                .isPublished(false)
                                .build();
        }

        // ==================== QUESTION REQUESTS ====================

        public static QuestionRequest validMultipleChoiceQuestion(Long lessonId) {
                return QuestionRequest.builder()
                                .lessonId(lessonId)
                                .questionType("MULTIPLE_CHOICE")
                                .questionText("What is the correct way to greet someone in the morning?")
                                .points(10)
                                .explanation("'Good morning' is the standard greeting used before noon.")
                                .options(List.of(
                                                QuestionRequest.QuestionOptionRequest.builder()
                                                                .optionText("Good morning")
                                                                .isCorrect(true)
                                                                .build(),
                                                QuestionRequest.QuestionOptionRequest.builder()
                                                                .optionText("Good night")
                                                                .isCorrect(false)
                                                                .build(),
                                                QuestionRequest.QuestionOptionRequest.builder()
                                                                .optionText("Goodbye")
                                                                .isCorrect(false)
                                                                .build(),
                                                QuestionRequest.QuestionOptionRequest.builder()
                                                                .optionText("See you later")
                                                                .isCorrect(false)
                                                                .build()))
                                .build();
        }

        public static QuestionRequest validTrueFalseQuestion(Long lessonId) {
                return QuestionRequest.builder()
                                .lessonId(lessonId)
                                .questionType("TRUE_FALSE")
                                .questionText("'How do you do?' is a casual greeting used among friends.")
                                .points(5)
                                .explanation("'How do you do?' is actually a formal greeting, not casual.")
                                .options(List.of(
                                                QuestionRequest.QuestionOptionRequest.builder()
                                                                .optionText("True")
                                                                .isCorrect(false)
                                                                .build(),
                                                QuestionRequest.QuestionOptionRequest.builder()
                                                                .optionText("False")
                                                                .isCorrect(true)
                                                                .build()))
                                .build();
        }

        public static QuestionRequest validFillInBlankQuestion(Long lessonId) {
                return QuestionRequest.builder()
                                .lessonId(lessonId)
                                .questionType("FILL_IN_BLANK")
                                .questionText("Complete the sentence: 'Nice to ___ you.'")
                                .points(5)
                                .explanation("The correct answer is 'meet'. 'Nice to meet you' is a common greeting.")
                                .options(List.of(
                                                QuestionRequest.QuestionOptionRequest.builder()
                                                                .optionText("meet")
                                                                .isCorrect(true)
                                                                .build()))
                                .build();
        }

        // ==================== EXAM REQUESTS ====================

        public static ExamRequest validExamRequest(Long classId, List<Long> questionIds) {
                return ExamRequest.builder()
                                .title("Kiểm tra 15 phút - Unit 1: Greetings")
                                .classId(classId)
                                .startTime(LocalDateTime.now().plusHours(1))
                                .endTime(LocalDateTime.now().plusHours(2))
                                .durationMinutes(15)
                                .shuffleQuestions(true)
                                .shuffleAnswers(true)
                                .antiCheatEnabled(false)
                                .questionIds(questionIds)
                                .build();
        }

        public static ExamRequest midtermExamRequest(Long classId, List<Long> questionIds) {
                return ExamRequest.builder()
                                .title("Bài kiểm tra giữa kỳ - Tiếng Anh Nâng Cao")
                                .classId(classId)
                                .startTime(LocalDateTime.now().plusDays(7))
                                .endTime(LocalDateTime.now().plusDays(7).plusHours(2))
                                .durationMinutes(90)
                                .shuffleQuestions(true)
                                .shuffleAnswers(true)
                                .antiCheatEnabled(true)
                                .questionIds(questionIds)
                                .build();
        }

        // ==================== SUBMIT EXAM REQUESTS ====================

        public static SubmitExamRequest validSubmitRequest(Long examId,
                        List<SubmitExamRequest.AnswerSubmission> answers) {
                return SubmitExamRequest.builder()
                                .examId(examId)
                                .answers(answers)
                                .build();
        }

        public static SubmitExamRequest.AnswerSubmission multipleChoiceAnswer(Long questionId, Long selectedOptionId) {
                return SubmitExamRequest.AnswerSubmission.builder()
                                .questionId(questionId)
                                .selectedOptionId(selectedOptionId)
                                .build();
        }

        public static SubmitExamRequest.AnswerSubmission fillInBlankAnswer(Long questionId, String answerText) {
                return SubmitExamRequest.AnswerSubmission.builder()
                                .questionId(questionId)
                                .answerText(answerText)
                                .build();
        }

        // ==================== EXAM (ALREADY STARTED - for anti-cheat tests) ====================

        /**
         * Creates an ExamRequest with startTime in the past so the exam is already started.
         * Used for anti-cheat integration tests.
         */
        public static ExamRequest examRequestAlreadyStarted(Long classId, List<Long> questionIds) {
                return ExamRequest.builder()
                                .title("Bài kiểm tra Anti-Cheat - Đã bắt đầu")
                                .classId(classId)
                                .startTime(LocalDateTime.now().minusMinutes(10))
                                .endTime(LocalDateTime.now().plusHours(2))
                                .durationMinutes(60)
                                .shuffleQuestions(false)
                                .shuffleAnswers(false)
                                .antiCheatEnabled(true)
                                .questionIds(questionIds)
                                .build();
        }

        // ==================== ANTI-CHEAT EVENT DTO ====================

        public static AntiCheatEventDTO antiCheatEventDTO(Long examResultId, String eventType) {
                return AntiCheatEventDTO.builder()
                                .examResultId(examResultId)
                                .eventType(eventType)
                                .timestamp(LocalDateTime.now())
                                .details("Auto-generated test event")
                                .build();
        }

        // ==================== EXAM SUBMIT DTO (for anti-cheat submit) ====================

        public static ExamSubmitDTO.AnswerDTO examSubmitAnswerDTO(Long questionId, Long selectedOptionId) {
                return ExamSubmitDTO.AnswerDTO.builder()
                                .questionId(questionId)
                                .selectedOptionId(selectedOptionId)
                                .build();
        }

        public static ExamSubmitDTO examSubmitDTO(Long examResultId, List<ExamSubmitDTO.AnswerDTO> answers) {
                return ExamSubmitDTO.builder()
                                .examResultId(examResultId)
                                .answers(answers)
                                .build();
        }

        // ==================== MISTAKE NOTEBOOK REQUEST ====================

        public static MistakeNotebookRequest mistakeNotebookRequest(Long userId, Long vocabularyId) {
                return MistakeNotebookRequest.builder()
                                .userId(userId)
                                .vocabularyId(vocabularyId)
                                .build();
        }

        // ==================== UTILITIES ====================

        public static String asJsonString(Object obj) {
                try {
                        return objectMapper.writeValueAsString(obj);
                } catch (Exception e) {
                        throw new RuntimeException("Failed to serialize object to JSON", e);
                }
        }

        /**
         * Extract a Long value from a JSON response using JsonPath.
         * Handles the Integer -> Long conversion from JSON parsing.
         */
        public static Long extractLong(String json, String path) {
                Object value = com.jayway.jsonpath.JsonPath.read(json, path);
                if (value instanceof Number) {
                        return ((Number) value).longValue();
                }
                throw new RuntimeException("Expected Number at path " + path + ", got " + value);
        }

        /**
         * Extract a String value from a JSON response using JsonPath.
         */
        public static String extractString(String json, String path) {
                return com.jayway.jsonpath.JsonPath.read(json, path);
        }
}
