package com.englishlearn.security;

import io.jsonwebtoken.ExpiredJwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for JwtService.
 * Tests token generation, validation, and claim extraction.
 */
@ExtendWith(MockitoExtension.class)
class JwtServiceTest {

    private JwtService jwtService;
    private UserDetails userDetails;

    // Test secret key (base64 encoded, 256-bit minimum for HS256)
    private static final String SECRET_KEY = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private static final long JWT_EXPIRATION = 86400000; // 24 hours
    private static final long REFRESH_EXPIRATION = 604800000; // 7 days

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();

        // Set the private fields using reflection
        ReflectionTestUtils.setField(jwtService, "secretKey", SECRET_KEY);
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", JWT_EXPIRATION);
        ReflectionTestUtils.setField(jwtService, "refreshExpiration", REFRESH_EXPIRATION);

        // Create a test user
        userDetails = new User(
                "testuser",
                "password123",
                List.of(new SimpleGrantedAuthority("ROLE_STUDENT")));
    }

    @Test
    @DisplayName("generateToken should return a valid JWT token")
    void generateToken_ShouldReturnValidToken() {
        // When
        String token = jwtService.generateToken(userDetails);

        // Then
        assertThat(token).isNotNull();
        assertThat(token).isNotEmpty();
        assertThat(token.split("\\.")).hasSize(3); // JWT has 3 parts
    }

    @Test
    @DisplayName("extractUsername should return correct username from token")
    void extractUsername_ShouldReturnCorrectUsername() {
        // Given
        String token = jwtService.generateToken(userDetails);

        // When
        String username = jwtService.extractUsername(token);

        // Then
        assertThat(username).isEqualTo("testuser");
    }

    @Test
    @DisplayName("isTokenValid should return true for valid token")
    void isTokenValid_WithValidToken_ShouldReturnTrue() {
        // Given
        String token = jwtService.generateToken(userDetails);

        // When
        boolean isValid = jwtService.isTokenValid(token, userDetails);

        // Then
        assertThat(isValid).isTrue();
    }

    @Test
    @DisplayName("isTokenValid should return false for different user")
    void isTokenValid_WithDifferentUser_ShouldReturnFalse() {
        // Given
        String token = jwtService.generateToken(userDetails);
        UserDetails differentUser = new User(
                "differentuser",
                "password123",
                List.of(new SimpleGrantedAuthority("ROLE_STUDENT")));

        // When
        boolean isValid = jwtService.isTokenValid(token, differentUser);

        // Then
        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("isTokenValid should return false for expired token")
    void isTokenValid_WithExpiredToken_ShouldReturnFalse() {
        // Given - Create a token with very short expiration
        JwtService shortExpirationService = new JwtService();
        ReflectionTestUtils.setField(shortExpirationService, "secretKey", SECRET_KEY);
        ReflectionTestUtils.setField(shortExpirationService, "jwtExpiration", 1L); // 1ms
        ReflectionTestUtils.setField(shortExpirationService, "refreshExpiration", 1L);

        String token = shortExpirationService.generateToken(userDetails);

        // Wait for token to expire
        try {
            Thread.sleep(10);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // When/Then - Should throw ExpiredJwtException
        assertThatThrownBy(() -> shortExpirationService.isTokenValid(token, userDetails))
                .isInstanceOf(ExpiredJwtException.class);
    }

    @Test
    @DisplayName("generateRefreshToken should create a valid token")
    void generateRefreshToken_ShouldReturnValidToken() {
        // When
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        // Then
        assertThat(refreshToken).isNotNull();
        assertThat(refreshToken).isNotEmpty();
        assertThat(jwtService.extractUsername(refreshToken)).isEqualTo("testuser");
    }

    @Test
    @DisplayName("Token for admin user should be valid")
    void generateToken_ForAdminUser_ShouldBeValid() {
        // Given
        UserDetails adminUser = new User(
                "admin",
                "adminpass",
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN")));

        // When
        String token = jwtService.generateToken(adminUser);

        // Then
        assertThat(jwtService.isTokenValid(token, adminUser)).isTrue();
        assertThat(jwtService.extractUsername(token)).isEqualTo("admin");
    }

    @Test
    @DisplayName("Token for teacher user should be valid")
    void generateToken_ForTeacherUser_ShouldBeValid() {
        // Given
        UserDetails teacherUser = new User(
                "teacher01",
                "teacherpass",
                List.of(
                        new SimpleGrantedAuthority("ROLE_TEACHER"),
                        new SimpleGrantedAuthority("ROLE_STUDENT")));

        // When
        String token = jwtService.generateToken(teacherUser);

        // Then
        assertThat(jwtService.isTokenValid(token, teacherUser)).isTrue();
        assertThat(jwtService.extractUsername(token)).isEqualTo("teacher01");
    }
}
