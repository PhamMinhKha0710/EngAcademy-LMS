package com.englishlearn.controller;

import com.englishlearn.application.dto.request.LessonRequest;
import com.englishlearn.application.dto.request.VocabularyRequest;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for MistakeNotebookController.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class MistakeNotebookControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    private String teacherToken;
    private String studentToken;

    private static Long studentId;
    private static Long lessonId;
    private static Long vocabularyId;
    private static Long mistakeId;

    @BeforeEach
    void setUp() {
        teacherToken = jwtService.generateToken(TestDataFactory.teacher1UserDetails());
        studentToken = jwtService.generateToken(TestDataFactory.student1UserDetails());
    }

    @Test
    @Order(0)
    @DisplayName("Setup: Register users, create lesson and vocabulary")
    void setup() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(TestDataFactory.asJsonString(TestDataFactory.teacher1RegisterRequest())));
        MvcResult studentResult = mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(TestDataFactory.asJsonString(TestDataFactory.student1RegisterRequest())))
                .andExpect(status().isCreated())
                .andReturn();
        studentId = TestDataFactory.extractLong(studentResult.getResponse().getContentAsString(), "$.data.id");

        LessonRequest lessonRequest = LessonRequest.builder()
                .title("Mistake Notebook Test Lesson")
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

        VocabularyRequest vocabRequest = VocabularyRequest.builder()
                .lessonId(lessonId)
                .word("hello")
                .meaning("xin chào")
                .pronunciation("/həˈloʊ/")
                .build();
        MvcResult vocabResult = mockMvc.perform(post("/api/v1/vocabulary")
                .contentType(MediaType.APPLICATION_JSON)
                .content(TestDataFactory.asJsonString(vocabRequest))
                .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isCreated())
                .andReturn();
        vocabularyId = TestDataFactory.extractLong(vocabResult.getResponse().getContentAsString(), "$.data.id");
    }

    @Test
    @Order(1)
    @DisplayName("GET /api/v1/mistakes/user/{userId} - Returns 200 and list")
    void getMistakesByUser_Returns200() throws Exception {
        mockMvc.perform(get("/api/v1/mistakes/user/" + studentId)
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @Order(2)
    @DisplayName("POST /api/v1/mistakes - Add mistake returns 201")
    void addMistake_Returns201() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/mistakes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(TestDataFactory.asJsonString(
                        TestDataFactory.mistakeNotebookRequest(studentId, vocabularyId)))
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").isNumber())
                .andExpect(jsonPath("$.data.mistakeCount").value(1))
                .andReturn();
        mistakeId = TestDataFactory.extractLong(result.getResponse().getContentAsString(), "$.data.id");
    }

    @Test
    @Order(3)
    @DisplayName("GET /api/v1/mistakes/user/{userId}/count - Returns 1")
    void countMistakes_Returns1() throws Exception {
        mockMvc.perform(get("/api/v1/mistakes/user/" + studentId + "/count")
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value(1));
    }

    @Test
    @Order(4)
    @DisplayName("GET /api/v1/mistakes/user/{userId}/top - Returns list with one item")
    void getTopMistakes_ReturnsList() throws Exception {
        mockMvc.perform(get("/api/v1/mistakes/user/" + studentId + "/top")
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].word").value("hello"));
    }

    @Test
    @Order(5)
    @DisplayName("DELETE /api/v1/mistakes/{id} - Removes mistake")
    void removeMistake_Returns200() throws Exception {
        mockMvc.perform(delete("/api/v1/mistakes/" + mistakeId)
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @Order(6)
    @DisplayName("GET count after delete returns 0")
    void countAfterDelete_Returns0() throws Exception {
        mockMvc.perform(get("/api/v1/mistakes/user/" + studentId + "/count")
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value(0));
    }
}
