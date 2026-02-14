package com.englishlearn.controller;

import com.englishlearn.application.dto.request.ExamRequest;
import com.englishlearn.application.dto.request.ExamSubmitDTO;
import com.englishlearn.application.dto.request.LessonRequest;
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

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for Exam anti-cheat endpoints: start, log event,
 * submit-anticheat, get events.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class ExamAntiCheatControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private JwtService jwtService;

        private String teacherToken;
        private String studentToken;

        private static Long teacherId;
        private static Long studentId;
        private static Long student2Id; // For security tests
        private static Long schoolId;
        private static Long classId;
        private static Long lessonId;
        private static Long questionId1;
        private static Long questionId2;
        private static Long examId;
        private static Long optionCorrectId1;
        private static Long optionCorrectId2;
        private static Long examResultId;

        @BeforeEach
        void setUp() {
                teacherToken = jwtService.generateToken(TestDataFactory.teacher1UserDetails());
                studentToken = jwtService.generateToken(TestDataFactory.student1UserDetails());
        }

        @Test
        @Order(0)
        @DisplayName("Setup: Create exam environment for anti-cheat tests")
        void setup() throws Exception {
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

                MvcResult schoolResult = mockMvc.perform(post("/api/v1/schools")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(TestDataFactory.validSchoolRequest()))
                                .header("Authorization",
                                                "Bearer " + jwtService
                                                                .generateToken(TestDataFactory.adminUserDetails())))
                                .andExpect(status().isCreated())
                                .andReturn();
                schoolId = TestDataFactory.extractLong(schoolResult.getResponse().getContentAsString(), "$.data.id");

                MvcResult classResult = mockMvc.perform(post("/api/v1/classes")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(
                                                TestDataFactory.validClassRoomRequest(schoolId, teacherId)))
                                .header("Authorization",
                                                "Bearer " + jwtService
                                                                .generateToken(TestDataFactory.adminUserDetails())))
                                .andExpect(status().isCreated())
                                .andReturn();
                classId = TestDataFactory.extractLong(classResult.getResponse().getContentAsString(), "$.data.id");

                mockMvc.perform(post("/api/v1/classes/" + classId + "/students/" + studentId)
                                .header("Authorization", "Bearer "
                                                + jwtService.generateToken(TestDataFactory.adminUserDetails())));

                LessonRequest lessonRequest = LessonRequest.builder()
                                .title("Anti-cheat Exam Lesson")
                                .contentHtml("<p>Content</p>")
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

                MvcResult q1Result = mockMvc.perform(post("/api/v1/questions")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory
                                                .asJsonString(TestDataFactory.validMultipleChoiceQuestion(lessonId)))
                                .header("Authorization", "Bearer " + teacherToken))
                                .andExpect(status().isCreated())
                                .andReturn();
                questionId1 = TestDataFactory.extractLong(q1Result.getResponse().getContentAsString(), "$.data.id");
                optionCorrectId1 = TestDataFactory.extractLong(q1Result.getResponse().getContentAsString(),
                                "$.data.options[0].id");

                MvcResult q2Result = mockMvc.perform(post("/api/v1/questions")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(TestDataFactory.validTrueFalseQuestion(lessonId)))
                                .header("Authorization", "Bearer " + teacherToken))
                                .andExpect(status().isCreated())
                                .andReturn();
                questionId2 = TestDataFactory.extractLong(q2Result.getResponse().getContentAsString(), "$.data.id");
                optionCorrectId2 = TestDataFactory.extractLong(q2Result.getResponse().getContentAsString(),
                                "$.data.options[1].id");

                ExamRequest examRequest = TestDataFactory.examRequestAlreadyStarted(classId,
                                List.of(questionId1, questionId2));
                MvcResult examResult = mockMvc.perform(post("/api/v1/exams")
                                .param("teacherId", String.valueOf(teacherId))
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(examRequest))
                                .header("Authorization", "Bearer " + teacherToken))
                                .andExpect(status().isCreated())
                                .andReturn();
                examId = TestDataFactory.extractLong(examResult.getResponse().getContentAsString(), "$.data.id");

                mockMvc.perform(post("/api/v1/exams/" + examId + "/publish")
                                .header("Authorization", "Bearer " + teacherToken))
                                .andExpect(status().isOk());
        }

        @Test
        @Order(1)
        @DisplayName("POST /exams/{examId}/start - Student starts exam, returns examResultId and questions")
        void startExam_Returns200WithExamResultId() throws Exception {
                MvcResult result = mockMvc.perform(post("/api/v1/exams/" + examId + "/start")
                                .param("studentId", String.valueOf(studentId))
                                .header("Authorization", "Bearer " + studentToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.examResultId").isNumber())
                                .andExpect(jsonPath("$.data.questions").isArray())
                                .andExpect(jsonPath("$.data.antiCheatEnabled").value(true))
                                .andExpect(jsonPath("$.data.totalQuestions").value(2))
                                .andReturn();
                examResultId = TestDataFactory.extractLong(result.getResponse().getContentAsString(),
                                "$.data.examResultId");
        }

        @Test
        @Order(2)
        @DisplayName("POST /exams/{examId}/anti-cheat-event - Log event returns 200")
        void logAntiCheatEvent_Returns200() throws Exception {
                mockMvc.perform(post("/api/v1/exams/" + examId + "/anti-cheat-event")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(
                                                TestDataFactory.antiCheatEventDTO(examResultId, "TAB_SWITCH")))
                                .header("Authorization", "Bearer " + studentToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true));
        }

        @Test
        @Order(3)
        @DisplayName("POST /exams/{examId}/submit-anticheat - Submit returns 200 with score and status")
        void submitExamWithAntiCheat_Returns200() throws Exception {
                List<ExamSubmitDTO.AnswerDTO> answers = List.of(
                                TestDataFactory.examSubmitAnswerDTO(questionId1, optionCorrectId1),
                                TestDataFactory.examSubmitAnswerDTO(questionId2, optionCorrectId2));
                ExamSubmitDTO submitDto = TestDataFactory.examSubmitDTO(examResultId, answers);

                mockMvc.perform(post("/api/v1/exams/" + examId + "/submit-anticheat")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(submitDto))
                                .header("Authorization", "Bearer " + studentToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.score").isNumber())
                                .andExpect(jsonPath("$.data.correctCount").value(2))
                                .andExpect(jsonPath("$.data.totalQuestions").value(2))
                                .andExpect(jsonPath("$.data.status").value("COMPLETED"));
        }

        @Test
        @Order(4)
        @DisplayName("GET /exams/results/{examResultId}/anti-cheat-events - Teacher gets events")
        void getAntiCheatEvents_Teacher_Returns200() throws Exception {
                mockMvc.perform(get("/api/v1/exams/results/" + examResultId + "/anti-cheat-events")
                                .header("Authorization", "Bearer " + teacherToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data").isArray())
                                .andExpect(jsonPath("$.data.length()").value(1))
                                .andExpect(jsonPath("$.data[0].eventType").value("TAB_SWITCH"));
        }

        @Test
        @Order(5)
        @DisplayName("POST submit-anticheat again for same examResultId returns error")
        void submitExamWithAntiCheat_SecondTime_ReturnsError() throws Exception {
                List<ExamSubmitDTO.AnswerDTO> answers = List.of(
                                TestDataFactory.examSubmitAnswerDTO(questionId1, optionCorrectId1));
                ExamSubmitDTO submitDto = TestDataFactory.examSubmitDTO(examResultId, answers);

                mockMvc.perform(post("/api/v1/exams/" + examId + "/submit-anticheat")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(submitDto))
                                .header("Authorization", "Bearer " + studentToken))
                                .andExpect(result -> {
                                        int status = result.getResponse().getStatus();
                                        assert status >= 400 && status < 600
                                                        : "Expected client or server error, got " + status;
                                });
        }

        @Test
        @Order(6)
        @DisplayName("POST /exams/{examId}/start - Student tries to start with different studentId returns 403")
        void startExam_WithOtherStudentId_ShouldReturn403() throws Exception {
                // Create a second student
                MvcResult student2Result = mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(TestDataFactory.student2RegisterRequest())))
                                .andReturn();
                student2Id = TestDataFactory.extractLong(student2Result.getResponse().getContentAsString(),
                                "$.data.id");

                // Add student2 to class for later tests
                mockMvc.perform(post("/api/v1/classes/" + classId + "/students/" + student2Id)
                                .header("Authorization", "Bearer "
                                                + jwtService.generateToken(TestDataFactory.adminUserDetails())));

                // Student 1 tries to start exam with Student 2's ID
                mockMvc.perform(post("/api/v1/exams/" + examId + "/start")
                                .param("studentId", String.valueOf(student2Id))
                                .header("Authorization", "Bearer " + studentToken))
                                .andExpect(status().isForbidden())
                                .andExpect(jsonPath("$.success").value(false));
        }

        @Test
        @Order(7)
        @DisplayName("POST /exams/{examId}/anti-cheat-event - Student tries to log event for another student's exam returns 400")
        void logAntiCheatEvent_WithOtherStudentExamResult_ShouldReturn400() throws Exception {
                // Reuse student2 created in test Order(6)
                String student2Token = jwtService.generateToken(TestDataFactory.student2UserDetails());

                // Student 2 attempts to log event for Student 1's exam
                mockMvc.perform(post("/api/v1/exams/" + examId + "/anti-cheat-event")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(
                                                TestDataFactory.antiCheatEventDTO(examResultId, "TAB_SWITCH")))
                                .header("Authorization", "Bearer " + student2Token))
                                .andExpect(status().isBadRequest());
        }

        @Test
        @Order(8)
        @DisplayName("POST /exams/{examId}/submit-anticheat - Student tries to submit another student's exam returns 400")
        void submitExamWithAntiCheat_WithOtherStudentExamResult_ShouldReturn400() throws Exception {
                // Reuse student2 from test Order(6)
                String student2Token = jwtService.generateToken(TestDataFactory.student2UserDetails());

                // Student 2 attempts to submit Student 1's exam
                List<ExamSubmitDTO.AnswerDTO> answers = List.of(
                                TestDataFactory.examSubmitAnswerDTO(questionId1, optionCorrectId1));
                ExamSubmitDTO submitDto = TestDataFactory.examSubmitDTO(examResultId, answers);

                mockMvc.perform(post("/api/v1/exams/" + examId + "/submit-anticheat")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(submitDto))
                                .header("Authorization", "Bearer " + student2Token))
                                .andExpect(status().isBadRequest());
        }
}
