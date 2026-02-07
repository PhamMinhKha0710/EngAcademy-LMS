package com.englishlearn.config;

import com.englishlearn.dto.RegisterRequest;
import com.englishlearn.fixtures.TestDataFactory;
import com.englishlearn.security.JwtService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for SecurityConfig.
 * Tests endpoint access control and role-based authorization.
 * Uses real registered users so the JWT filter can validate tokens against the DB.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    private static String adminToken;
    private static String studentToken;
    private static String teacherToken;
    private static String schoolToken;

    @Test
    @Order(0)
    @DisplayName("Setup: Register users for security tests")
    void setup() throws Exception {
        // Register all users first so JWT filter can validate them
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(TestDataFactory.asJsonString(TestDataFactory.adminRegisterRequest())));
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(TestDataFactory.asJsonString(TestDataFactory.student1RegisterRequest())));
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(TestDataFactory.asJsonString(TestDataFactory.teacher1RegisterRequest())));
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(TestDataFactory.asJsonString(TestDataFactory.schoolRegisterRequest())));

        // Generate tokens using the registered usernames
        adminToken = jwtService.generateToken(TestDataFactory.adminUserDetails());
        studentToken = jwtService.generateToken(TestDataFactory.student1UserDetails());
        teacherToken = jwtService.generateToken(TestDataFactory.teacher1UserDetails());
        schoolToken = jwtService.generateToken(TestDataFactory.schoolUserDetails());
    }

    @Test
    @Order(1)
    @DisplayName("Public auth endpoints should be accessible without authentication")
    void publicAuthEndpoints_ShouldBeAccessibleWithoutAuth() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"nonexistent\",\"password\":\"test\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(2)
    @DisplayName("Health endpoint should be accessible without authentication")
    void healthEndpoint_ShouldBeAccessibleWithoutAuth() throws Exception {
        mockMvc.perform(get("/api/v1/auth/health"))
                .andExpect(status().isOk());
    }

    @Test
    @Order(3)
    @DisplayName("Swagger UI should be accessible without authentication")
    void swaggerEndpoints_ShouldBeAccessibleWithoutAuth() throws Exception {
        mockMvc.perform(get("/swagger-ui/index.html"))
                .andExpect(status().isOk());
    }

    @Test
    @Order(4)
    @DisplayName("Protected endpoints should return 401 without authentication")
    void protectedEndpoints_ShouldReturn401WithoutAuth() throws Exception {
        mockMvc.perform(get("/api/v1/users/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(5)
    @DisplayName("Admin endpoints should return 403 for student users")
    void adminEndpoints_WithStudentRole_ShouldReturn403() throws Exception {
        mockMvc.perform(get("/api/v1/admin/users")
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(6)
    @DisplayName("Admin endpoints should be accessible for admin users")
    void adminEndpoints_WithAdminRole_ShouldBeAccessible() throws Exception {
        // Endpoint doesn't exist at /api/v1/admin/dashboard but auth should pass (not 403)
        mockMvc.perform(get("/api/v1/admin/dashboard")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assert status != 403 : "Admin should not get 403, got " + status;
                });
    }

    @Test
    @Order(7)
    @DisplayName("School endpoints should return 403 for student users")
    void schoolEndpoints_WithStudentRole_ShouldReturn403() throws Exception {
        mockMvc.perform(get("/api/v1/school/teachers")
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(8)
    @DisplayName("School endpoints should be accessible for school users")
    void schoolEndpoints_WithSchoolRole_ShouldBeAccessible() throws Exception {
        mockMvc.perform(get("/api/v1/school/teachers")
                .header("Authorization", "Bearer " + schoolToken))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assert status != 403 : "School role should not get 403, got " + status;
                });
    }

    @Test
    @Order(9)
    @DisplayName("Invalid token should return 401")
    void invalidToken_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/users/me")
                .header("Authorization", "Bearer invalid.token.here"))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    assert status == 401 || status == 403 :
                            "Expected 401 or 403, got " + status;
                });
    }

    @Test
    @Order(10)
    @DisplayName("Authenticated user can access generic endpoints")
    void authenticatedUser_CanAccessGenericEndpoints() throws Exception {
        mockMvc.perform(get("/api/v1/users/me")
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk());
    }
}
