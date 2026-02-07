package com.englishlearn.controller;

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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for UserController.
 * Tests GET /me, GET /{id}, GET (pageable), PATCH /me, POST /{id}/coins.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    private String adminToken;
    private String teacherToken;
    private String studentToken;
    private String schoolToken;

    @BeforeEach
    void setUp() {
        adminToken = jwtService.generateToken(TestDataFactory.adminUserDetails());
        teacherToken = jwtService.generateToken(TestDataFactory.teacher1UserDetails());
        studentToken = jwtService.generateToken(TestDataFactory.student1UserDetails());
        schoolToken = jwtService.generateToken(TestDataFactory.schoolUserDetails());
    }

    // ===================== GET /api/v1/users/me =====================

    @Test
    @Order(1)
    @DisplayName("TC-USER-001: GET /me with valid token should return 200 and user info")
    void getMe_ValidToken_ShouldReturn200() throws Exception {
        // First register the admin user
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestDataFactory.asJsonString(TestDataFactory.adminRegisterRequest())))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/v1/users/me")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.username").value(TestDataFactory.ADMIN_USERNAME));
    }

    @Test
    @Order(2)
    @DisplayName("TC-USER-002: GET /me without token should return 401")
    void getMe_NoToken_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/users/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(3)
    @DisplayName("TC-USER-003: GET /me with expired token should return 401")
    void getMe_ExpiredToken_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/users/me")
                        .header("Authorization", "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJleHBpcmVkIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMDAwMDF9.invalid"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(4)
    @DisplayName("TC-USER-004: GET /me with malformed token should return 401")
    void getMe_MalformedToken_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/users/me")
                        .header("Authorization", "Bearer invalid.token.format"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(5)
    @DisplayName("TC-USER-005: GET /me with random string as token should return 401")
    void getMe_RandomStringToken_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/users/me")
                        .header("Authorization", "Bearer this-is-not-a-jwt"))
                .andExpect(status().isUnauthorized());
    }

    // ===================== GET /api/v1/users/{id} =====================

    @Test
    @Order(10)
    @DisplayName("TC-USER-010: Admin GET user by ID should return 200")
    void getUserById_Admin_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/users/1")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").isNumber());
    }

    @Test
    @Order(11)
    @DisplayName("TC-USER-011: Teacher GET user by ID should return 200")
    void getUserById_Teacher_ShouldReturn200() throws Exception {
        // Register teacher first
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestDataFactory.asJsonString(TestDataFactory.teacher1RegisterRequest())))
                .andReturn();

        mockMvc.perform(get("/api/v1/users/1")
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @Order(12)
    @DisplayName("TC-USER-012: Student GET user by ID should return 403")
    void getUserById_Student_ShouldReturn403() throws Exception {
        // Register student first
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestDataFactory.asJsonString(TestDataFactory.student1RegisterRequest())))
                .andReturn();

        mockMvc.perform(get("/api/v1/users/1")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(13)
    @DisplayName("TC-USER-013: GET non-existent user ID should return 404")
    void getUserById_NonExistent_ShouldReturn404() throws Exception {
        mockMvc.perform(get("/api/v1/users/999999")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @Order(14)
    @DisplayName("TC-USER-014: GET user with negative ID should return 404 or 400")
    void getUserById_NegativeId_ShouldReturnError() throws Exception {
        mockMvc.perform(get("/api/v1/users/-1")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assert status == 400 || status == 404 :
                            "Expected 400 or 404, got " + status;
                });
    }

    // ===================== GET /api/v1/users (Pageable) =====================

    @Test
    @Order(20)
    @DisplayName("TC-USER-020: Admin GET all users with pagination should return 200")
    void getAllUsers_Admin_ShouldReturn200() throws Exception {
        mockMvc.perform(get("/api/v1/users")
                        .param("page", "0")
                        .param("size", "10")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    @Order(21)
    @DisplayName("TC-USER-024: Student GET all users should return 403")
    void getAllUsers_Student_ShouldReturn403() throws Exception {
        mockMvc.perform(get("/api/v1/users")
                        .param("page", "0")
                        .param("size", "10")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(22)
    @DisplayName("TC-USER-022: School GET all users should return 200")
    void getAllUsers_School_ShouldReturn200() throws Exception {
        // Register school first
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestDataFactory.asJsonString(TestDataFactory.schoolRegisterRequest())))
                .andReturn();

        mockMvc.perform(get("/api/v1/users")
                        .param("page", "0")
                        .param("size", "10")
                        .header("Authorization", "Bearer " + schoolToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    // ===================== PATCH /api/v1/users/me =====================

    @Test
    @Order(30)
    @DisplayName("TC-USER-030: Update fullName should return 200")
    void updateProfile_FullName_ShouldReturn200() throws Exception {
        mockMvc.perform(patch("/api/v1/users/me")
                        .param("fullName", "Nguyễn Văn An Updated")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.fullName").value("Nguyễn Văn An Updated"));
    }

    @Test
    @Order(31)
    @DisplayName("TC-USER-031: Update avatarUrl should return 200")
    void updateProfile_AvatarUrl_ShouldReturn200() throws Exception {
        mockMvc.perform(patch("/api/v1/users/me")
                        .param("avatarUrl", "https://cdn.englishlearn.vn/avatars/admin_nguyen.jpg")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @Order(32)
    @DisplayName("TC-USER-032: Update both fullName and avatarUrl should return 200")
    void updateProfile_Both_ShouldReturn200() throws Exception {
        mockMvc.perform(patch("/api/v1/users/me")
                        .param("fullName", "Nguyễn Văn An Final")
                        .param("avatarUrl", "https://cdn.englishlearn.vn/avatars/final.jpg")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @Order(33)
    @DisplayName("TC-USER-033: Update with no params should be handled")
    void updateProfile_NoParams_ShouldBeHandled() throws Exception {
        mockMvc.perform(patch("/api/v1/users/me")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assert status == 200 || status == 400 :
                            "Expected 200 or 400, got " + status;
                });
    }

    // ===================== POST /api/v1/users/{id}/coins =====================

    @Test
    @Order(40)
    @DisplayName("TC-USER-040: Admin add 100 coins should return 200")
    void addCoins_Admin_ShouldReturn200() throws Exception {
        mockMvc.perform(post("/api/v1/users/1/coins")
                        .param("amount", "100")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @Order(41)
    @DisplayName("TC-USER-041: Add negative coins should be handled")
    void addCoins_NegativeAmount_ShouldBeHandled() throws Exception {
        mockMvc.perform(post("/api/v1/users/1/coins")
                        .param("amount", "-50")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    // Accept both 200 (if allowed to deduct) or 400 (if validation rejects)
                    assert status == 200 || status == 400 :
                            "Expected 200 or 400, got " + status;
                });
    }

    @Test
    @Order(42)
    @DisplayName("TC-USER-043: Student add coins to self should return 403")
    void addCoins_Student_ShouldReturn403() throws Exception {
        mockMvc.perform(post("/api/v1/users/1/coins")
                        .param("amount", "50")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(43)
    @DisplayName("TC-USER-044: Add coins to non-existent user should return 404")
    void addCoins_NonExistentUser_ShouldReturn404() throws Exception {
        mockMvc.perform(post("/api/v1/users/999999/coins")
                        .param("amount", "100")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound());
    }

    @Test
    @Order(44)
    @DisplayName("TC-USER-042: Teacher add coins should return 200")
    void addCoins_Teacher_ShouldReturn200() throws Exception {
        mockMvc.perform(post("/api/v1/users/1/coins")
                        .param("amount", "50")
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isOk());
    }
}
