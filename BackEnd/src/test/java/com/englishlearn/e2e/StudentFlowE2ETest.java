package com.englishlearn.e2e;

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


import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * E2E-01: Luong Hoc Sinh Moi Tham Gia He Thong
 *
 * Kich ban thuc te:
 * 1. Hoc sinh dang ky tai khoan
 * 2. Dang nhap -> nhan token
 * 3. Xem danh sach bai hoc da xuat ban
 * 4. Xem chi tiet bai hoc
 * 5. Hoc tu vung
 * 6. On tap flashcard
 * 7. Cap nhat tien do hoc tap (30% -> 100%)
 * 8. Danh dau hoan thanh bai hoc
 * 9. Xem thong ke hoc tap
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class StudentFlowE2ETest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    private static String studentToken;
    private static Long studentId;
    private static Long lessonId;

    @Test
    @Order(0)
    @DisplayName("Setup: Register teacher and create lesson")
    void setup() throws Exception {
        // Teacher creates content
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(TestDataFactory.asJsonString(TestDataFactory.teacher1RegisterRequest())));

        String teacherToken = jwtService.generateToken(TestDataFactory.teacher1UserDetails());

        LessonRequest lesson = LessonRequest.builder()
                .title("E2E: Basic English Conversation")
                .contentHtml("<h1>Basic Conversation</h1><p>Learn everyday English phrases.</p>")
                .audioUrl("https://cdn.englishlearn.vn/audio/e2e-basic.mp3")
                .difficultyLevel(1)
                .orderIndex(1)
                .isPublished(true)
                .build();

        MvcResult lessonResult = mockMvc.perform(post("/api/v1/lessons")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestDataFactory.asJsonString(lesson))
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isCreated())
                .andReturn();

        lessonId = TestDataFactory.extractLong(lessonResult.getResponse().getContentAsString(), "$.data.id");
    }

    @Test
    @Order(1)
    @DisplayName("Step 1: Hoc sinh Ngoc Linh dang ky tai khoan")
    void step1_Register() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestDataFactory.asJsonString(TestDataFactory.student1RegisterRequest())))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.username").value(TestDataFactory.STUDENT1_USERNAME))
                .andExpect(jsonPath("$.data.roles[0]").value("ROLE_STUDENT"))
                .andReturn();

        studentToken = TestDataFactory.extractString(result.getResponse().getContentAsString(), "$.data.accessToken");
        studentId = TestDataFactory.extractLong(result.getResponse().getContentAsString(), "$.data.id");
    }

    @Test
    @Order(2)
    @DisplayName("Step 2: Dang nhap va nhan token moi")
    void step2_Login() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestDataFactory.asJsonString(TestDataFactory.student1LoginRequest())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andReturn();

        studentToken = TestDataFactory.extractString(result.getResponse().getContentAsString(), "$.data.accessToken");
    }

    @Test
    @Order(3)
    @DisplayName("Step 3: Xem danh sach bai hoc da xuat ban (khong can token)")
    void step3_ViewPublishedLessons() throws Exception {
        mockMvc.perform(get("/api/v1/lessons")
                        .param("published", "true")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @Order(4)
    @DisplayName("Step 4: Xem chi tiet bai hoc")
    void step4_ViewLessonDetail() throws Exception {
        mockMvc.perform(get("/api/v1/lessons/" + lessonId)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.title").isNotEmpty())
                .andExpect(jsonPath("$.data.contentHtml").isNotEmpty());
    }

    @Test
    @Order(5)
    @DisplayName("Step 5: Hoc tu vung cua bai hoc")
    void step5_LearnVocabulary() throws Exception {
        mockMvc.perform(get("/api/v1/vocabulary/lesson/" + lessonId)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @Order(6)
    @DisplayName("Step 6: On tap flashcard")
    void step6_PracticeFlashcards() throws Exception {
        mockMvc.perform(get("/api/v1/vocabulary/flashcards/" + lessonId)
                        .param("count", "5")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @Order(7)
    @DisplayName("Step 7: Cap nhat tien do 30%")
    void step7_UpdateProgress30() throws Exception {
        mockMvc.perform(post("/api/v1/progress/user/" + studentId + "/lesson/" + lessonId)
                        .param("percentage", "30")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.completionPercentage").value(30));
    }

    @Test
    @Order(8)
    @DisplayName("Step 8: Cap nhat tien do 100%")
    void step8_UpdateProgress100() throws Exception {
        mockMvc.perform(post("/api/v1/progress/user/" + studentId + "/lesson/" + lessonId)
                        .param("percentage", "100")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.completionPercentage").value(100));
    }

    @Test
    @Order(9)
    @DisplayName("Step 9: Danh dau hoan thanh bai hoc")
    void step9_CompleteLesson() throws Exception {
        mockMvc.perform(post("/api/v1/progress/user/" + studentId + "/lesson/" + lessonId + "/complete")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.isCompleted").value(true));
    }

    @Test
    @Order(10)
    @DisplayName("Step 10: Xem thong ke hoc tap")
    void step10_ViewStats() throws Exception {
        mockMvc.perform(get("/api/v1/progress/user/" + studentId + "/stats")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.completedLessons").isNumber())
                .andExpect(jsonPath("$.data.averageProgress").isNumber());
    }

    @Test
    @Order(11)
    @DisplayName("Step 11: Xem profile ca nhan")
    void step11_ViewProfile() throws Exception {
        mockMvc.perform(get("/api/v1/users/me")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.username").value(TestDataFactory.STUDENT1_USERNAME))
                .andExpect(jsonPath("$.data.email").value(TestDataFactory.STUDENT1_EMAIL));
    }
}
