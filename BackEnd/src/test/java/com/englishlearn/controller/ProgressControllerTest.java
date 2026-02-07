package com.englishlearn.controller;

import com.englishlearn.dto.request.LessonRequest;
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


import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for ProgressController.
 * Tests progress tracking, completion, stats, and edge cases for percentage values.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class ProgressControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    private String adminToken;
    private String teacherToken;
    private String studentToken;

    private static Long studentId;
    private static Long lessonId;

    @BeforeEach
    void setUp() {
        adminToken = jwtService.generateToken(TestDataFactory.adminUserDetails());
        teacherToken = jwtService.generateToken(TestDataFactory.teacher1UserDetails());
        studentToken = jwtService.generateToken(TestDataFactory.student1UserDetails());
    }

    @Test
    @Order(0)
    @DisplayName("Setup: Register users and create lesson for progress tests")
    void setup() throws Exception {
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(TestDataFactory.asJsonString(TestDataFactory.adminRegisterRequest())));
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(TestDataFactory.asJsonString(TestDataFactory.teacher1RegisterRequest())));

        MvcResult studentResult = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestDataFactory.asJsonString(TestDataFactory.student1RegisterRequest())))
                .andReturn();
        studentId = TestDataFactory.extractLong(studentResult.getResponse().getContentAsString(), "$.data.id");

        // Create lesson
        LessonRequest lessonRequest = LessonRequest.builder()
                .title("Progress Test Lesson")
                .contentHtml("<p>Progress content</p>")
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
    }

    // ===================== POST progress update =====================

    @Test
    @Order(1)
    @DisplayName("TC-PROG-001: Student update progress to 50% should return 200")
    void updateProgress_50Percent_ShouldReturn200() throws Exception {
        mockMvc.perform(post("/api/v1/progress/user/" + studentId + "/lesson/" + lessonId)
                        .param("percentage", "50")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.completionPercentage").value(50));
    }

    @Test
    @Order(2)
    @DisplayName("TC-PROG-002: Student complete lesson should return 200 with isCompleted=true")
    void completeLesson_ShouldReturn200() throws Exception {
        mockMvc.perform(post("/api/v1/progress/user/" + studentId + "/lesson/" + lessonId + "/complete")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.isCompleted").value(true));
    }

    @Test
    @Order(3)
    @DisplayName("TC-PROG-012: Complete already completed lesson should be idempotent")
    void completeLesson_AlreadyComplete_ShouldBeIdempotent() throws Exception {
        mockMvc.perform(post("/api/v1/progress/user/" + studentId + "/lesson/" + lessonId + "/complete")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isCompleted").value(true));
    }

    // ===================== Edge Cases =====================

    @Test
    @Order(10)
    @DisplayName("TC-PROG-007: Update progress > 100% should be handled")
    void updateProgress_Over100_ShouldBeHandled() throws Exception {
        mockMvc.perform(post("/api/v1/progress/user/" + studentId + "/lesson/" + lessonId)
                        .param("percentage", "150")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assert status == 200 || status == 400 :
                            "Expected 200 or 400, got " + status;
                });
    }

    @Test
    @Order(11)
    @DisplayName("TC-PROG-008: Update progress < 0% should be handled")
    void updateProgress_Negative_ShouldBeHandled() throws Exception {
        mockMvc.perform(post("/api/v1/progress/user/" + studentId + "/lesson/" + lessonId)
                        .param("percentage", "-10")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assert status == 200 || status == 400 :
                            "Expected 200 or 400, got " + status;
                });
    }

    @Test
    @Order(12)
    @DisplayName("TC-PROG-009: Get progress for non-existent userId should return 200 empty or 404")
    void getProgress_NonExistentUser_ShouldBeHandled() throws Exception {
        mockMvc.perform(get("/api/v1/progress/user/999999")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assert status == 200 || status == 404 :
                            "Expected 200 or 404, got " + status;
                });
    }

    @Test
    @Order(13)
    @DisplayName("TC-PROG-010: Get progress for non-existent lesson should be handled")
    void getProgress_NonExistentLesson_ShouldBeHandled() throws Exception {
        mockMvc.perform(get("/api/v1/progress/user/" + studentId + "/lesson/999999")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assert status == 200 || status == 404 :
                            "Expected 200 or 404, got " + status;
                });
    }

    // ===================== GET progress =====================

    @Test
    @Order(20)
    @DisplayName("TC-PROG-003: Get all progress for user should return 200")
    void getProgressByUser_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/progress/user/" + studentId)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @Order(21)
    @DisplayName("TC-PROG-004: Get completed lessons should return 200")
    void getCompletedLessons_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/progress/user/" + studentId + "/completed")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @Order(22)
    @DisplayName("TC-PROG-005: Get in-progress lessons should return 200")
    void getInProgressLessons_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/progress/user/" + studentId + "/in-progress")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @Order(23)
    @DisplayName("TC-PROG-006: Get user stats should return 200 with completedLessons and averageProgress")
    void getUserStats_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/progress/user/" + studentId + "/stats")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.completedLessons").isNumber())
                .andExpect(jsonPath("$.data.averageProgress").isNumber());
    }

    @Test
    @Order(24)
    @DisplayName("TC-PROG-011: Teacher view student progress should return 200")
    void getProgress_Teacher_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/progress/user/" + studentId)
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @Order(25)
    @DisplayName("Get specific lesson progress should return 200")
    void getProgressForLesson_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/progress/user/" + studentId + "/lesson/" + lessonId)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    // ===================== Authorization =====================

    @Test
    @Order(30)
    @DisplayName("Unauthenticated user cannot access progress")
    void getProgress_NoAuth_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/progress/user/" + studentId))
                .andExpect(status().isUnauthorized());
    }
}
