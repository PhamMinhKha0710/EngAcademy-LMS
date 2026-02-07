package com.englishlearn.controller;

import com.englishlearn.dto.request.LessonRequest;
import com.englishlearn.dto.request.QuestionRequest;
import com.englishlearn.fixtures.TestDataFactory;
import com.englishlearn.security.JwtService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Collections;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for QuestionController.
 * Tests CRUD for questions with options, type filtering, and validation.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class QuestionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    private String adminToken;
    private String teacherToken;
    private String studentToken;

    private static Long lessonId;
    private static Long questionId;

    @BeforeEach
    void setUp() {
        adminToken = jwtService.generateToken(TestDataFactory.adminUserDetails());
        teacherToken = jwtService.generateToken(TestDataFactory.teacher1UserDetails());
        studentToken = jwtService.generateToken(TestDataFactory.student1UserDetails());
    }

    @Test
    @Order(0)
    @DisplayName("Setup: Register users and create lesson for question tests")
    void setup() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(TestDataFactory.asJsonString(TestDataFactory.adminRegisterRequest())));
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(TestDataFactory.asJsonString(TestDataFactory.teacher1RegisterRequest())));
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(TestDataFactory.asJsonString(TestDataFactory.student1RegisterRequest())));

        // Create a lesson
        LessonRequest lessonRequest = LessonRequest.builder()
                .title("Lesson for Questions")
                .contentHtml("<p>Question lesson content</p>")
                .difficultyLevel(1)
                .orderIndex(1)
                .isPublished(true)
                .build();

        MvcResult result = mockMvc.perform(post("/api/v1/lessons")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestDataFactory.asJsonString(lessonRequest))
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isCreated())
                .andReturn();

        lessonId = TestDataFactory.extractLong(result.getResponse().getContentAsString(), "$.data.id");
    }

    // ===================== POST /api/v1/questions =====================

    @Test
    @Order(1)
    @DisplayName("TC-QUES-001: Create MULTIPLE_CHOICE question with 4 options should return 201")
    void createQuestion_MultipleChoice_ShouldReturn201() throws Exception {
        QuestionRequest request = TestDataFactory.validMultipleChoiceQuestion(lessonId);

        MvcResult result = mockMvc.perform(post("/api/v1/questions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestDataFactory.asJsonString(request))
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.questionType").value("MULTIPLE_CHOICE"))
                .andExpect(jsonPath("$.data.options").isArray())
                .andReturn();

        questionId = TestDataFactory.extractLong(result.getResponse().getContentAsString(), "$.data.id");
    }

    @Test
    @Order(2)
    @DisplayName("TC-QUES-005: Create question with empty questionText should return 400")
    void createQuestion_EmptyText_ShouldReturn400() throws Exception {
        QuestionRequest request = QuestionRequest.builder()
                .lessonId(lessonId)
                .questionType("MULTIPLE_CHOICE")
                .questionText("")
                .points(10)
                .options(Collections.emptyList())
                .build();

        mockMvc.perform(post("/api/v1/questions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestDataFactory.asJsonString(request))
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @Order(3)
    @DisplayName("TC-QUES-006: Student create question should return 403")
    void createQuestion_Student_ShouldReturn403() throws Exception {
        QuestionRequest request = TestDataFactory.validMultipleChoiceQuestion(lessonId);

        mockMvc.perform(post("/api/v1/questions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestDataFactory.asJsonString(request))
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(4)
    @DisplayName("Create TRUE_FALSE question should return 201")
    void createQuestion_TrueFalse_ShouldReturn201() throws Exception {
        QuestionRequest request = TestDataFactory.validTrueFalseQuestion(lessonId);

        mockMvc.perform(post("/api/v1/questions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestDataFactory.asJsonString(request))
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.questionType").value("TRUE_FALSE"));
    }

    @Test
    @Order(5)
    @DisplayName("Create FILL_IN_BLANK question should return 201")
    void createQuestion_FillInBlank_ShouldReturn201() throws Exception {
        QuestionRequest request = TestDataFactory.validFillInBlankQuestion(lessonId);

        mockMvc.perform(post("/api/v1/questions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestDataFactory.asJsonString(request))
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.questionType").value("FILL_IN_BLANK"));
    }

    // ===================== GET questions =====================

    @Test
    @Order(10)
    @DisplayName("TC-QUES-010: Get all questions should return 200")
    void getAllQuestions_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/questions")
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @Order(11)
    @DisplayName("TC-QUES-011: Get questions by lesson should return 200")
    void getQuestionsByLesson_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/questions/lesson/" + lessonId)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @Order(12)
    @DisplayName("TC-QUES-012: Student get question by ID should return 200")
    void getQuestionById_Student_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/questions/" + questionId)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(questionId));
    }

    @Test
    @Order(13)
    @DisplayName("Get questions by type should return 200")
    void getQuestionsByType_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/questions/type/MULTIPLE_CHOICE")
                        .param("page", "0")
                        .param("size", "10")
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    // ===================== PUT & DELETE =====================

    @Test
    @Order(20)
    @DisplayName("TC-QUES-013: Update question should return 200")
    void updateQuestion_ShouldReturn200() throws Exception {
        QuestionRequest updated = QuestionRequest.builder()
                .lessonId(lessonId)
                .questionType("MULTIPLE_CHOICE")
                .questionText("Updated: What is the correct greeting in the morning?")
                .points(15)
                .explanation("Updated explanation")
                .options(TestDataFactory.validMultipleChoiceQuestion(lessonId).getOptions())
                .build();

        mockMvc.perform(put("/api/v1/questions/" + questionId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestDataFactory.asJsonString(updated))
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @Order(30)
    @DisplayName("Delete question should return 200")
    void deleteQuestion_ShouldReturn200() throws Exception {
        // Create a question to delete
        QuestionRequest request = TestDataFactory.validTrueFalseQuestion(lessonId);
        MvcResult result = mockMvc.perform(post("/api/v1/questions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestDataFactory.asJsonString(request))
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isCreated())
                .andReturn();

        Long deleteId = TestDataFactory.extractLong(result.getResponse().getContentAsString(), "$.data.id");

        mockMvc.perform(delete("/api/v1/questions/" + deleteId)
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
