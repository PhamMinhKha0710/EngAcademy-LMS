package com.englishlearn.config;

import com.englishlearn.security.JwtService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for SecurityConfig.
 * Tests endpoint access control and role-based authorization.
 */
@SpringBootTest
@AutoConfigureMockMvc
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Test
    @DisplayName("Public auth endpoints should be accessible without authentication")
    void publicAuthEndpoints_ShouldBeAccessibleWithoutAuth() throws Exception {
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"username\":\"test\",\"password\":\"test\"}"))
                .andExpect(status().isUnauthorized()); // Will fail auth but endpoint is accessible
    }

    @Test
    @DisplayName("Swagger UI should be accessible without authentication")
    void swaggerEndpoints_ShouldBeAccessibleWithoutAuth() throws Exception {
        mockMvc.perform(get("/swagger-ui/index.html"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Protected endpoints should return 401 without authentication")
    void protectedEndpoints_ShouldReturn401WithoutAuth() throws Exception {
        mockMvc.perform(get("/api/v1/users/profile"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Admin endpoints should return 403 for non-admin users")
    void adminEndpoints_WithStudentRole_ShouldReturn403() throws Exception {
        // Given - Create a student token
        UserDetails studentUser = new User(
                "student01",
                "password",
                List.of(new SimpleGrantedAuthority("ROLE_STUDENT")));
        String studentToken = jwtService.generateToken(studentUser);

        // When/Then
        mockMvc.perform(get("/api/v1/admin/users")
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Admin endpoints should be accessible for admin users")
    void adminEndpoints_WithAdminRole_ShouldBeAccessible() throws Exception {
        // Given - Create an admin token
        UserDetails adminUser = new User(
                "admin",
                "password",
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));
        String adminToken = jwtService.generateToken(adminUser);

        // When/Then - The endpoint may not exist but should not return 403
        mockMvc.perform(get("/api/v1/admin/dashboard")
                .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound()); // Endpoint doesn't exist but auth passed
    }

    @Test
    @DisplayName("Teacher endpoints should be accessible for teacher users")
    void teacherEndpoints_WithTeacherRole_ShouldBeAccessible() throws Exception {
        // Given - Create a teacher token
        UserDetails teacherUser = new User(
                "teacher01",
                "password",
                List.of(new SimpleGrantedAuthority("ROLE_TEACHER")));
        String teacherToken = jwtService.generateToken(teacherUser);

        // When/Then
        mockMvc.perform(get("/api/v1/teacher/classes")
                .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isNotFound()); // Endpoint doesn't exist but auth passed
    }

    @Test
    @DisplayName("School endpoints should be accessible for school users")
    void schoolEndpoints_WithSchoolRole_ShouldBeAccessible() throws Exception {
        // Given - Create a school manager token
        UserDetails schoolUser = new User(
                "school01",
                "password",
                List.of(new SimpleGrantedAuthority("ROLE_SCHOOL")));
        String schoolToken = jwtService.generateToken(schoolUser);

        // When/Then
        mockMvc.perform(get("/api/v1/school/teachers")
                .header("Authorization", "Bearer " + schoolToken))
                .andExpect(status().isNotFound()); // Endpoint doesn't exist but auth passed
    }

    @Test
    @DisplayName("School endpoints should return 403 for student users")
    void schoolEndpoints_WithStudentRole_ShouldReturn403() throws Exception {
        // Given - Create a student token
        UserDetails studentUser = new User(
                "student01",
                "password",
                List.of(new SimpleGrantedAuthority("ROLE_STUDENT")));
        String studentToken = jwtService.generateToken(studentUser);

        // When/Then
        mockMvc.perform(get("/api/v1/school/teachers")
                .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Invalid token should return 401")
    void invalidToken_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/users/profile")
                .header("Authorization", "Bearer invalid.token.here"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Published lessons should be accessible without authentication")
    void publishedLessons_ShouldBeAccessibleWithoutAuth() throws Exception {
        mockMvc.perform(get("/api/v1/lessons/published"))
                .andExpect(status().isOk());
    }
}
