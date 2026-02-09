package com.englishlearn.controller;

import com.englishlearn.application.dto.request.LoginRequest;
import com.englishlearn.application.dto.request.RegisterRequest;
import com.englishlearn.fixtures.TestDataFactory;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for AuthController.
 * Tests registration, login, and health check endpoints.
 *
 * Test data uses realistic Vietnamese user personas.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AuthControllerTest {

        @Autowired
        private MockMvc mockMvc;

        // ===================== HEALTH CHECK =====================

        @Test
        @Order(1)
        @DisplayName("TC-AUTH-031: Health check should return 200 OK")
        void healthCheck_ShouldReturn200() throws Exception {
                mockMvc.perform(get("/api/v1/auth/health"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data").value("OK"));
        }

        // ===================== REGISTER - HAPPY PATH =====================

        @Test
        @Order(10)
        @DisplayName("TC-AUTH-001: Register student with valid data should return 201 and token")
        void register_ValidStudent_ShouldReturn201() throws Exception {
                RegisterRequest request = TestDataFactory.student1RegisterRequest();

                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                                .andExpect(jsonPath("$.data.refreshToken").isNotEmpty())
                                .andExpect(jsonPath("$.data.username").value(TestDataFactory.STUDENT1_USERNAME))
                                .andExpect(jsonPath("$.data.email").value(TestDataFactory.STUDENT1_EMAIL))
                                .andExpect(jsonPath("$.data.roles[0]").value("ROLE_STUDENT"));
        }

        @Test
        @Order(11)
        @DisplayName("TC-AUTH-002: Register teacher with valid data should return 201 with TEACHER role")
        void register_ValidTeacher_ShouldReturn201WithTeacherRole() throws Exception {
                RegisterRequest request = TestDataFactory.teacher1RegisterRequest();

                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.roles[0]").value("ROLE_TEACHER"));
        }

        @Test
        @Order(12)
        @DisplayName("TC-AUTH-003: Register without role should default to STUDENT")
        void register_NoRole_ShouldDefaultToStudent() throws Exception {
                RegisterRequest request = TestDataFactory.studentDefaultRoleRequest();

                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.data.roles[0]").value("ROLE_STUDENT"));
        }

        // ===================== REGISTER - NEGATIVE TESTS =====================

        @Test
        @Order(20)
        @DisplayName("TC-AUTH-004: Register with existing username should return error")
        void register_DuplicateUsername_ShouldReturnError() throws Exception {
                // First register succeeds (already done in TC-AUTH-001)
                // Second register with same username should fail
                RegisterRequest request = RegisterRequest.builder()
                                .username(TestDataFactory.STUDENT1_USERNAME) // already exists
                                .email("different.email@gmail.com")
                                .password("Differ3nt!Pass2026")
                                .fullName("Another User")
                                .role("STUDENT")
                                .build();

                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request)))
                                .andExpect(status().isConflict())
                                .andExpect(jsonPath("$.success").value(false));
        }

        @Test
        @Order(21)
        @DisplayName("TC-AUTH-005: Register with existing email should return error")
        void register_DuplicateEmail_ShouldReturnError() throws Exception {
                RegisterRequest request = RegisterRequest.builder()
                                .username("completely_new_user")
                                .email(TestDataFactory.STUDENT1_EMAIL) // already exists
                                .password("NewUs3r!Pass2026")
                                .fullName("Completely New User")
                                .role("STUDENT")
                                .build();

                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request)))
                                .andExpect(status().isConflict())
                                .andExpect(jsonPath("$.success").value(false));
        }

        @Test
        @Order(22)
        @DisplayName("TC-AUTH-006: Register with username < 3 chars should return 400")
        void register_ShortUsername_ShouldReturn400() throws Exception {
                RegisterRequest request = RegisterRequest.builder()
                                .username("ab")
                                .email("short.user@gmail.com")
                                .password("Valid!Pass2026")
                                .fullName("Short Username")
                                .role("STUDENT")
                                .build();

                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request)))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.success").value(false));
        }

        @Test
        @Order(23)
        @DisplayName("TC-AUTH-007: Register with username > 50 chars should return 400")
        void register_LongUsername_ShouldReturn400() throws Exception {
                String longUsername = "a".repeat(51);
                RegisterRequest request = RegisterRequest.builder()
                                .username(longUsername)
                                .email("longuser@gmail.com")
                                .password("Valid!Pass2026")
                                .fullName("Long Username User")
                                .role("STUDENT")
                                .build();

                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request)))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.success").value(false));
        }

        @Test
        @Order(24)
        @DisplayName("TC-AUTH-008: Register with invalid email format should return 400")
        void register_InvalidEmail_ShouldReturn400() throws Exception {
                RegisterRequest request = RegisterRequest.builder()
                                .username("valid_user_email")
                                .email("not-an-email")
                                .password("Valid!Pass2026")
                                .fullName("Invalid Email User")
                                .role("STUDENT")
                                .build();

                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request)))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.success").value(false));
        }

        @Test
        @Order(25)
        @DisplayName("TC-AUTH-009: Register with password < 6 chars should return 400")
        void register_ShortPassword_ShouldReturn400() throws Exception {
                RegisterRequest request = RegisterRequest.builder()
                                .username("short_pass_user")
                                .email("shortpass@gmail.com")
                                .password("Ab1!")
                                .fullName("Short Password")
                                .role("STUDENT")
                                .build();

                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request)))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.success").value(false));
        }

        @Test
        @Order(26)
        @DisplayName("TC-AUTH-010: Register with null username should return 400")
        void register_NullUsername_ShouldReturn400() throws Exception {
                RegisterRequest request = RegisterRequest.builder()
                                .username(null)
                                .email("nulluser@gmail.com")
                                .password("Valid!Pass2026")
                                .fullName("Null Username")
                                .role("STUDENT")
                                .build();

                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request)))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.success").value(false));
        }

        @Test
        @Order(27)
        @DisplayName("TC-AUTH-011: Register with empty password should return 400")
        void register_EmptyPassword_ShouldReturn400() throws Exception {
                RegisterRequest request = RegisterRequest.builder()
                                .username("empty_pass_user")
                                .email("emptypass@gmail.com")
                                .password("")
                                .fullName("Empty Password")
                                .role("STUDENT")
                                .build();

                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request)))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.success").value(false));
        }

        @Test
        @Order(28)
        @DisplayName("TC-AUTH-012: Register with invalid role should return error")
        void register_InvalidRole_ShouldReturnError() throws Exception {
                RegisterRequest request = RegisterRequest.builder()
                                .username("invalid_role_user")
                                .email("invalidrole@gmail.com")
                                .password("Valid!Pass2026")
                                .fullName("Invalid Role User")
                                .role("SUPERADMIN")
                                .build();

                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request)))
                                .andExpect(status().isNotFound())
                                .andExpect(jsonPath("$.success").value(false));
        }

        // ===================== REGISTER - EDGE CASES =====================

        @Test
        @Order(30)
        @DisplayName("TC-AUTH-013: Register with special characters in username")
        void register_SpecialCharsUsername_ShouldBeHandled() throws Exception {
                RegisterRequest request = RegisterRequest.builder()
                                .username("user@#$special")
                                .email("specialchar@gmail.com")
                                .password("Valid!Pass2026")
                                .fullName("Special Char User")
                                .role("STUDENT")
                                .build();

                // Should either succeed or return validation error - not a 500
                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request)))
                                .andExpect(result -> {
                                        int status = result.getResponse().getStatus();
                                        assert status == 201 || status == 400 : "Expected 201 or 400, got " + status;
                                });
        }

        @Test
        @Order(31)
        @DisplayName("TC-AUTH-014: Register with long domain email should work")
        void register_LongDomainEmail_ShouldWork() throws Exception {
                RegisterRequest request = RegisterRequest.builder()
                                .username("long_domain_user")
                                .email("user@subdomain.university.edu.vn")
                                .password("Valid!Pass2026")
                                .fullName("Long Domain Email User")
                                .role("STUDENT")
                                .build();

                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.success").value(true));
        }

        @Test
        @Order(32)
        @DisplayName("TC-AUTH-015: Register with exactly 6 char password (boundary)")
        void register_ExactMinPassword_ShouldWork() throws Exception {
                RegisterRequest request = RegisterRequest.builder()
                                .username("boundary_pass_user")
                                .email("boundary.pass@gmail.com")
                                .password("Abc12!") // exactly 6 chars
                                .fullName("Boundary Password User")
                                .role("STUDENT")
                                .build();

                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.success").value(true));
        }

        @Test
        @Order(33)
        @DisplayName("TC-AUTH-016: Register with Vietnamese Unicode fullName")
        void register_VietnameseFullName_ShouldWork() throws Exception {
                RegisterRequest request = RegisterRequest.builder()
                                .username("unicode_name_user")
                                .email("unicode.name@gmail.com")
                                .password("Unicod3!Pass")
                                .fullName("Nguyễn Thị Ánh Tuyết")
                                .role("STUDENT")
                                .build();

                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.data.username").value("unicode_name_user"));
        }

        @Test
        @Order(34)
        @DisplayName("TC-AUTH-017: Double submit registration should fail on second attempt")
        void register_DoubleSubmit_SecondShouldFail() throws Exception {
                RegisterRequest request = RegisterRequest.builder()
                                .username("double_submit_user")
                                .email("double.submit@gmail.com")
                                .password("Doubl3!Submit2026")
                                .fullName("Double Submit User")
                                .role("STUDENT")
                                .build();

                // First attempt should succeed
                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request)))
                                .andExpect(status().isCreated());

                // Second attempt with same data should fail
                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request)))
                                .andExpect(jsonPath("$.success").value(false));
        }

        // ===================== LOGIN - HAPPY PATH =====================

        @Test
        @Order(40)
        @DisplayName("TC-AUTH-020: Login with valid credentials should return 200 and token")
        void login_ValidCredentials_ShouldReturn200() throws Exception {
                // Student1 was registered in TC-AUTH-001
                LoginRequest request = TestDataFactory.student1LoginRequest();

                mockMvc.perform(post("/api/v1/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                                .andExpect(jsonPath("$.data.refreshToken").isNotEmpty())
                                .andExpect(jsonPath("$.data.username").value(TestDataFactory.STUDENT1_USERNAME));
        }

        @Test
        @Order(41)
        @DisplayName("TC-AUTH-021: Login with different roles returns correct role in token")
        void login_TeacherRole_ShouldReturnCorrectRole() throws Exception {
                // Teacher1 was registered in TC-AUTH-002
                LoginRequest request = TestDataFactory.teacher1LoginRequest();

                mockMvc.perform(post("/api/v1/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data.roles[0]").value("ROLE_TEACHER"));
        }

        // ===================== LOGIN - NEGATIVE TESTS =====================

        @Test
        @Order(50)
        @DisplayName("TC-AUTH-022: Login with wrong password should return 401")
        void login_WrongPassword_ShouldReturn401() throws Exception {
                LoginRequest request = LoginRequest.builder()
                                .username(TestDataFactory.STUDENT1_USERNAME)
                                .password("WrongP@ssword!")
                                .build();

                mockMvc.perform(post("/api/v1/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request)))
                                .andExpect(status().isUnauthorized())
                                .andExpect(jsonPath("$.success").value(false));
        }

        @Test
        @Order(51)
        @DisplayName("TC-AUTH-023: Login with non-existent username should return 401")
        void login_NonExistentUser_ShouldReturn401() throws Exception {
                LoginRequest request = LoginRequest.builder()
                                .username("non_existent_user_xyz")
                                .password("SomeP@ss123")
                                .build();

                mockMvc.perform(post("/api/v1/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request)))
                                .andExpect(status().isUnauthorized())
                                .andExpect(jsonPath("$.success").value(false));
        }

        @Test
        @Order(52)
        @DisplayName("TC-AUTH-024: Login with missing username should return 400")
        void login_MissingUsername_ShouldReturn400() throws Exception {
                LoginRequest request = LoginRequest.builder()
                                .username(null)
                                .password("SomeP@ss123")
                                .build();

                mockMvc.perform(post("/api/v1/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request)))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.success").value(false));
        }

        @Test
        @Order(53)
        @DisplayName("TC-AUTH-025: Login with missing password should return 400")
        void login_MissingPassword_ShouldReturn400() throws Exception {
                LoginRequest request = LoginRequest.builder()
                                .username(TestDataFactory.STUDENT1_USERNAME)
                                .password(null)
                                .build();

                mockMvc.perform(post("/api/v1/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request)))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.success").value(false));
        }

        @Test
        @Order(54)
        @DisplayName("TC-AUTH-026: Login with both fields empty should return 400")
        void login_BothFieldsEmpty_ShouldReturn400() throws Exception {
                LoginRequest request = LoginRequest.builder()
                                .username("")
                                .password("")
                                .build();

                mockMvc.perform(post("/api/v1/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request)))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.success").value(false));
        }

        // ===================== LOGIN - EDGE CASES =====================

        @Test
        @Order(60)
        @DisplayName("TC-AUTH-029: Login with empty body should return 400")
        void login_EmptyBody_ShouldReturn400() throws Exception {
                mockMvc.perform(post("/api/v1/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{}"))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.success").value(false));
        }

        // ===================== REGISTER ADMIN & SCHOOL (for subsequent tests)
        // =====================

        @Test
        @Order(70)
        @DisplayName("Register admin user for subsequent tests")
        void register_Admin_ForSubsequentTests() throws Exception {
                RegisterRequest request = TestDataFactory.adminRegisterRequest();

                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.data.roles[0]").value("ROLE_ADMIN"));
        }

        @Test
        @Order(71)
        @DisplayName("Register school manager for subsequent tests")
        void register_SchoolManager_ForSubsequentTests() throws Exception {
                RegisterRequest request = TestDataFactory.schoolRegisterRequest();

                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.data.roles[0]").value("ROLE_SCHOOL"));
        }

        @Test
        @Order(72)
        @DisplayName("Register student2 for subsequent tests")
        void register_Student2_ForSubsequentTests() throws Exception {
                RegisterRequest request = TestDataFactory.student2RegisterRequest();

                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request)))
                                .andExpect(status().isCreated());
        }
}
