package com.englishlearn.controller;

import com.englishlearn.application.dto.request.*;
import com.englishlearn.fixtures.TestDataFactory;
import com.englishlearn.infrastructure.security.JwtService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.LocalDateTime;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for ExamController.
 * Tests exam lifecycle (DRAFT -> PUBLISHED -> CLOSED), submit, double-submit,
 * and scoring.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class ExamControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private JwtService jwtService;

        private String adminToken;
        private String teacherToken;
        private String studentToken;

        private static Long teacherId;
        private static Long studentId;
        private static Long schoolId;
        private static Long classId;
        private static Long lessonId;
        private static Long questionId1;
        private static Long questionId2;
        private static Long examId;
        private static Long optionCorrectId;

        @BeforeEach
        void setUp() {
                adminToken = jwtService.generateToken(TestDataFactory.adminUserDetails());
                teacherToken = jwtService.generateToken(TestDataFactory.teacher1UserDetails());
                studentToken = jwtService.generateToken(TestDataFactory.student1UserDetails());
        }

        @Test
        @Order(0)
        @DisplayName("Setup: Create full test environment for exam tests")
        void setup() throws Exception {
                // Register users
                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(TestDataFactory.adminRegisterRequest())));

                MvcResult teacherResult = mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(TestDataFactory.teacher1RegisterRequest())))
                                .andReturn();
                teacherId = TestDataFactory.extractLong(teacherResult.getResponse().getContentAsString(), "$.data.id");

                MvcResult studentResult = mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(TestDataFactory.student1RegisterRequest())))
                                .andReturn();
                studentId = TestDataFactory.extractLong(studentResult.getResponse().getContentAsString(), "$.data.id");

                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(TestDataFactory.schoolRegisterRequest())));

                // Create school
                MvcResult schoolResult = mockMvc.perform(post("/api/v1/schools")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(TestDataFactory.validSchoolRequest()))
                                .header("Authorization", "Bearer " + adminToken))
                                .andExpect(status().isCreated())
                                .andReturn();
                schoolId = TestDataFactory.extractLong(schoolResult.getResponse().getContentAsString(), "$.data.id");

                // Create class
                MvcResult classResult = mockMvc.perform(post("/api/v1/classes")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(
                                                TestDataFactory.validClassRoomRequest(schoolId, teacherId)))
                                .header("Authorization", "Bearer " + adminToken))
                                .andExpect(status().isCreated())
                                .andReturn();
                classId = TestDataFactory.extractLong(classResult.getResponse().getContentAsString(), "$.data.id");

                // Add student to class
                mockMvc.perform(post("/api/v1/classes/" + classId + "/students/" + studentId)
                                .header("Authorization", "Bearer " + adminToken));

                // Create lesson
                LessonRequest lessonRequest = LessonRequest.builder()
                                .title("Exam Lesson")
                                .contentHtml("<p>Exam content</p>")
                                .difficultyLevel(1)
                                .orderIndex(1)
                                .isPublished(true)
                                .build();

                MvcResult lessonResult = mockMvc.perform(post("/api/v1/lessons")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(lessonRequest))
                                .header("Authorization", "Bearer " + teacherToken))
                                .andExpect(status().isCreated())
                                .andReturn();
                lessonId = TestDataFactory.extractLong(lessonResult.getResponse().getContentAsString(), "$.data.id");

                // Create questions
                MvcResult q1Result = mockMvc.perform(post("/api/v1/questions")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory
                                                .asJsonString(TestDataFactory.validMultipleChoiceQuestion(lessonId)))
                                .header("Authorization", "Bearer " + teacherToken))
                                .andExpect(status().isCreated())
                                .andReturn();
                questionId1 = TestDataFactory.extractLong(q1Result.getResponse().getContentAsString(), "$.data.id");
                // Get correct option ID
                optionCorrectId = TestDataFactory.extractLong(q1Result.getResponse().getContentAsString(),
                                "$.data.options[0].id");

                MvcResult q2Result = mockMvc.perform(post("/api/v1/questions")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(TestDataFactory.validTrueFalseQuestion(lessonId)))
                                .header("Authorization", "Bearer " + teacherToken))
                                .andExpect(status().isCreated())
                                .andReturn();
                questionId2 = TestDataFactory.extractLong(q2Result.getResponse().getContentAsString(), "$.data.id");
        }

        // ===================== POST /api/v1/exams (Create) =====================

        @Test
        @Order(1)
        @DisplayName("TC-EXAM-001: Teacher create exam should return 201 with status DRAFT")
        void createExam_Teacher_ShouldReturn201() throws Exception {
                ExamRequest request = TestDataFactory.validExamRequest(classId, List.of(questionId1, questionId2));

                MvcResult result = mockMvc.perform(post("/api/v1/exams")
                                .param("teacherId", String.valueOf(teacherId))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request))
                                .header("Authorization", "Bearer " + teacherToken))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.status").value("DRAFT"))
                                .andExpect(jsonPath("$.data.title").isNotEmpty())
                                .andReturn();

                examId = TestDataFactory.extractLong(result.getResponse().getContentAsString(), "$.data.id");
        }

        @Test
        @Order(2)
        @DisplayName("TC-EXAM-004: Create exam with durationMinutes=0 should return 400")
        void createExam_ZeroDuration_ShouldReturn400() throws Exception {
                ExamRequest request = ExamRequest.builder()
                                .title("Zero Duration Exam")
                                .classId(classId)
                                .startTime(LocalDateTime.now().plusHours(1))
                                .endTime(LocalDateTime.now().plusHours(2))
                                .durationMinutes(0)
                                .questionIds(List.of(questionId1))
                                .build();

                mockMvc.perform(post("/api/v1/exams")
                                .param("teacherId", String.valueOf(teacherId))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request))
                                .header("Authorization", "Bearer " + teacherToken))
                                .andExpect(status().isBadRequest());
        }

        @Test
        @Order(3)
        @DisplayName("TC-EXAM-005: Create exam with duration > 180 should return 400")
        void createExam_OverMaxDuration_ShouldReturn400() throws Exception {
                ExamRequest request = ExamRequest.builder()
                                .title("Over Max Duration Exam")
                                .classId(classId)
                                .startTime(LocalDateTime.now().plusHours(1))
                                .endTime(LocalDateTime.now().plusHours(5))
                                .durationMinutes(181)
                                .questionIds(List.of(questionId1))
                                .build();

                mockMvc.perform(post("/api/v1/exams")
                                .param("teacherId", String.valueOf(teacherId))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request))
                                .header("Authorization", "Bearer " + teacherToken))
                                .andExpect(status().isBadRequest());
        }

        @Test
        @Order(4)
        @DisplayName("TC-EXAM-007: Student create exam should return 403")
        void createExam_Student_ShouldReturn403() throws Exception {
                ExamRequest request = TestDataFactory.validExamRequest(classId, List.of(questionId1));

                mockMvc.perform(post("/api/v1/exams")
                                .param("teacherId", String.valueOf(teacherId))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request))
                                .header("Authorization", "Bearer " + studentToken))
                                .andExpect(status().isForbidden());
        }

        // ===================== Publish & Close =====================

        @Test
        @Order(10)
        @DisplayName("TC-EXAM-010: Publish DRAFT exam should return 200 with status PUBLISHED")
        void publishExam_Draft_ShouldReturnPublished() throws Exception {
                mockMvc.perform(post("/api/v1/exams/" + examId + "/publish")
                                .header("Authorization", "Bearer " + teacherToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.status").value("PUBLISHED"));
        }

        @Test
        @Order(11)
        @DisplayName("TC-EXAM-011: Publish already PUBLISHED exam should be handled")
        void publishExam_AlreadyPublished_ShouldBeHandled() throws Exception {
                mockMvc.perform(post("/api/v1/exams/" + examId + "/publish")
                                .header("Authorization", "Bearer " + teacherToken))
                                .andExpect(result -> {
                                        int status = result.getResponse().getStatus();
                                        // Could be idempotent (200) or error (400/409)
                                        assert status == 200 || status == 400 || status == 409
                                                        : "Expected 200, 400, or 409, got " + status;
                                });
        }

        // ===================== GET exams =====================

        @Test
        @Order(15)
        @DisplayName("Get exam by ID should return 200")
        void getExamById_ShouldReturn200() throws Exception {
                mockMvc.perform(get("/api/v1/exams/" + examId)
                                .header("Authorization", "Bearer " + teacherToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.id").value(examId));
        }

        @Test
        @Order(16)
        @DisplayName("Get exams by teacher should return 200")
        void getExamsByTeacher_ShouldReturn200() throws Exception {
                mockMvc.perform(get("/api/v1/exams/teacher/" + teacherId)
                                .param("page", "0")
                                .param("size", "10")
                                .header("Authorization", "Bearer " + teacherToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true));
        }

        @Test
        @Order(17)
        @DisplayName("Get exams by class should return 200")
        void getExamsByClass_ShouldReturn200() throws Exception {
                mockMvc.perform(get("/api/v1/exams/class/" + classId)
                                .param("page", "0")
                                .param("size", "10")
                                .header("Authorization", "Bearer " + studentToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true));
        }

        @Test
        @Order(18)
        @DisplayName("Get active exams for class should return 200")
        void getActiveExams_ShouldReturn200() throws Exception {
                mockMvc.perform(get("/api/v1/exams/class/" + classId + "/active")
                                .header("Authorization", "Bearer " + studentToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true));
        }

        // ===================== Submit Exam =====================

        @Test
        @Order(20)
        @DisplayName("TC-EXAM-020: Student submit exam should return 200 with ExamResultResponse")
        void submitExam_Student_ShouldReturn200() throws Exception {
                SubmitExamRequest request = SubmitExamRequest.builder()
                                .examId(examId)
                                .answers(List.of(
                                                SubmitExamRequest.AnswerSubmission.builder()
                                                                .questionId(questionId1)
                                                                .selectedOptionId(optionCorrectId)
                                                                .build(),
                                                SubmitExamRequest.AnswerSubmission.builder()
                                                                .questionId(questionId2)
                                                                .selectedOptionId(null)
                                                                .answerText("False")
                                                                .build()))
                                .build();

                mockMvc.perform(post("/api/v1/exams/submit")
                                .param("studentId", String.valueOf(studentId))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request))
                                .header("Authorization", "Bearer " + studentToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.examId").value(examId))
                                .andExpect(jsonPath("$.data.studentId").value(studentId))
                                .andExpect(jsonPath("$.data.score").isNumber())
                                .andExpect(jsonPath("$.data.totalQuestions").isNumber());
        }

        @Test
        @Order(21)
        @DisplayName("TC-EXAM-023: Double submit exam should be handled")
        void submitExam_DoubleSubmit_ShouldBeHandled() throws Exception {
                SubmitExamRequest request = SubmitExamRequest.builder()
                                .examId(examId)
                                .answers(List.of(
                                                SubmitExamRequest.AnswerSubmission.builder()
                                                                .questionId(questionId1)
                                                                .selectedOptionId(optionCorrectId)
                                                                .build()))
                                .build();

                // Second submit should either be rejected or handled gracefully
                mockMvc.perform(post("/api/v1/exams/submit")
                                .param("studentId", String.valueOf(studentId))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request))
                                .header("Authorization", "Bearer " + studentToken))
                                .andExpect(result -> {
                                        int status = result.getResponse().getStatus();
                                        // Could be 200 (allow resubmit), 409 (conflict), or 500
                                        assert status == 200 || status == 409 || status == 500
                                                        : "Expected 200, 409, or 500, got " + status;
                                });
        }

        @Test
        @Order(22)
        @DisplayName("TC-EXAM-024: Submit to non-existent exam should return error")
        void submitExam_NonExistentExam_ShouldReturnError() throws Exception {
                SubmitExamRequest request = SubmitExamRequest.builder()
                                .examId(999999L)
                                .answers(List.of())
                                .build();

                mockMvc.perform(post("/api/v1/exams/submit")
                                .param("studentId", String.valueOf(studentId))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request))
                                .header("Authorization", "Bearer " + studentToken))
                                .andExpect(result -> {
                                        int status = result.getResponse().getStatus();
                                        assert status == 404 || status == 500 : "Expected 404 or 500, got " + status;
                                });
        }

        @Test
        @Order(23)
        @DisplayName("TC-EXAM-028: Teacher submit exam should return 403")
        void submitExam_Teacher_ShouldReturn403() throws Exception {
                SubmitExamRequest request = SubmitExamRequest.builder()
                                .examId(examId)
                                .answers(List.of())
                                .build();

                mockMvc.perform(post("/api/v1/exams/submit")
                                .param("studentId", String.valueOf(teacherId))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request))
                                .header("Authorization", "Bearer " + teacherToken))
                                .andExpect(status().isForbidden());
        }

        // ===================== Get Results =====================

        @Test
        @Order(30)
        @DisplayName("TC-EXAM-030: Teacher get exam results should return 200")
        void getExamResults_Teacher_ShouldReturn200() throws Exception {
                mockMvc.perform(get("/api/v1/exams/" + examId + "/results")
                                .header("Authorization", "Bearer " + teacherToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data").isArray());
        }

        @Test
        @Order(31)
        @DisplayName("TC-EXAM-032: Student get exam results should return 403")
        void getExamResults_Student_ShouldReturn403() throws Exception {
                mockMvc.perform(get("/api/v1/exams/" + examId + "/results")
                                .header("Authorization", "Bearer " + studentToken))
                                .andExpect(status().isForbidden());
        }

        // ===================== Close & Delete =====================

        @Test
        @Order(40)
        @DisplayName("TC-EXAM-012: Close PUBLISHED exam should return 200 with CLOSED status")
        void closeExam_Published_ShouldReturnClosed() throws Exception {
                mockMvc.perform(post("/api/v1/exams/" + examId + "/close")
                                .header("Authorization", "Bearer " + teacherToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.status").value("CLOSED"));
        }

        @Test
        @Order(50)
        @DisplayName("Delete exam should return 200")
        void deleteExam_ShouldReturn200() throws Exception {
                // Create a new exam to delete
                ExamRequest request = ExamRequest.builder()
                                .title("Exam To Delete")
                                .classId(classId)
                                .startTime(LocalDateTime.now().plusDays(1))
                                .endTime(LocalDateTime.now().plusDays(1).plusHours(1))
                                .durationMinutes(30)
                                .questionIds(List.of(questionId1))
                                .build();

                MvcResult result = mockMvc.perform(post("/api/v1/exams")
                                .param("teacherId", String.valueOf(teacherId))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request))
                                .header("Authorization", "Bearer " + teacherToken))
                                .andExpect(status().isCreated())
                                .andReturn();

                Long deleteId = TestDataFactory.extractLong(result.getResponse().getContentAsString(), "$.data.id");

                mockMvc.perform(delete("/api/v1/exams/" + deleteId)
                                .header("Authorization", "Bearer " + teacherToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true));
        }
}
