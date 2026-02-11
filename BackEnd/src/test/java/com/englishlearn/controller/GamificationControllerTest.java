package com.englishlearn.controller;

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
 * Integration tests for Gamification APIs: Badge, DailyQuest, Leaderboard.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class GamificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    private String adminToken;
    private String teacherToken;
    private String studentToken;

    private static Long studentId;
    private static Long badgeId;

    @BeforeEach
    void setUp() {
        adminToken = jwtService.generateToken(TestDataFactory.adminUserDetails());
        teacherToken = jwtService.generateToken(TestDataFactory.teacher1UserDetails());
        studentToken = jwtService.generateToken(TestDataFactory.student1UserDetails());
    }

    @Test
    @Order(0)
    @DisplayName("Setup: Register student for gamification tests")
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
                .andExpect(status().isCreated())
                .andReturn();
        studentId = TestDataFactory.extractLong(studentResult.getResponse().getContentAsString(), "$.data.id");
    }

    // ===================== BADGE =====================

    @Test
    @Order(1)
    @DisplayName("GET /api/v1/badges/me - Student get my badges returns 200 and list")
    void getMyBadges_Student_Returns200() throws Exception {
        mockMvc.perform(get("/api/v1/badges/me")
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @Order(2)
    @DisplayName("POST /api/v1/badges/{userId}/award/{badgeName} - Teacher awards badge returns 201")
    void awardBadge_Teacher_Returns201() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/badges/" + studentId + "/award/First_Login")
                .param("description", "First login achievement")
                .param("iconUrl", "https://example.com/icon.png")
                .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("First_Login"))
                .andExpect(jsonPath("$.data.id").isNumber())
                .andReturn();
        badgeId = TestDataFactory.extractLong(result.getResponse().getContentAsString(), "$.data.id");
    }

    @Test
    @Order(3)
    @DisplayName("GET /api/v1/badges/users/{userId} - Get user badges returns awarded badge")
    void getUserBadges_ReturnsAwardedBadge() throws Exception {
        mockMvc.perform(get("/api/v1/badges/users/" + studentId)
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(1))
                .andExpect(jsonPath("$.data[0].name").value("First_Login"));
    }

    @Test
    @Order(4)
    @DisplayName("GET /api/v1/badges/users/{userId}/count - Returns count 1")
    void getBadgeCount_Returns1() throws Exception {
        mockMvc.perform(get("/api/v1/badges/users/" + studentId + "/count")
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").value(1));
    }

    @Test
    @Order(5)
    @DisplayName("Student award badge returns 403")
    void awardBadge_Student_Returns403() throws Exception {
        mockMvc.perform(post("/api/v1/badges/" + studentId + "/award/Another_Badge")
                .param("description", "Test")
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    // ===================== DAILY QUEST =====================

    @Test
    @Order(10)
    @DisplayName("GET /api/v1/quests/today - Student get today quest returns 200 with tasks")
    void getTodayQuest_Student_Returns200() throws Exception {
        mockMvc.perform(get("/api/v1/quests/today")
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").exists())
                .andExpect(jsonPath("$.data.tasks").isArray());
    }

    @Test
    @Order(11)
    @DisplayName("GET /api/v1/quests/today without token returns 401")
    void getTodayQuest_NoToken_Returns401() throws Exception {
        mockMvc.perform(get("/api/v1/quests/today"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(12)
    @DisplayName("GET /api/v1/quests/history - Returns 200 and list")
    void getQuestHistory_Returns200() throws Exception {
        mockMvc.perform(get("/api/v1/quests/history")
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    // ===================== LEADERBOARD =====================

    @Test
    @Order(20)
    @DisplayName("GET /api/v1/leaderboard/coins - Returns 200 and page")
    void getLeaderboardByCoins_Returns200() throws Exception {
        mockMvc.perform(get("/api/v1/leaderboard/coins")
                .param("page", "0")
                .param("size", "10")
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    @Order(21)
    @DisplayName("GET /api/v1/leaderboard/top - Returns 200 and list")
    void getTopUsers_Returns200() throws Exception {
        mockMvc.perform(get("/api/v1/leaderboard/top")
                .param("limit", "10")
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").isArray());
    }

    @Test
    @Order(22)
    @DisplayName("GET /api/v1/leaderboard/me - Student returns 200")
    void getMyRank_Student_Returns200() throws Exception {
        mockMvc.perform(get("/api/v1/leaderboard/me")
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data").exists());
    }
}
