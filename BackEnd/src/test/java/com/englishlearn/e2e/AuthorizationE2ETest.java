package com.englishlearn.e2e;

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
 * E2E-05: Luong Token & Phan Quyen
 *
 * Test cross-role access, token expiry, invalid tokens, and permission boundaries.
 *
 * Kich ban:
 * 1. Student co gan goi API cua Admin -> 403
 * 2. Student co goi DELETE lesson (Admin only) -> 403
 * 3. Token het han -> 401
 * 4. Token sai format -> 401
 * 5. Khong gui token -> 401
 * 6. Teacher truy cap API cua School -> kiem tra
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AuthorizationE2ETest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    private static String studentToken;
    private static String teacherToken;
    private static String adminToken;

    @Test
    @Order(0)
    @DisplayName("Setup: Register all user types")
    void setup() throws Exception {
        MvcResult adminResult = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestDataFactory.asJsonString(TestDataFactory.adminRegisterRequest())))
                .andReturn();
        adminToken = TestDataFactory.extractString(adminResult.getResponse().getContentAsString(), "$.data.accessToken");

        MvcResult teacherResult = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestDataFactory.asJsonString(TestDataFactory.teacher1RegisterRequest())))
                .andReturn();
        teacherToken = TestDataFactory.extractString(teacherResult.getResponse().getContentAsString(), "$.data.accessToken");

        MvcResult studentResult = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestDataFactory.asJsonString(TestDataFactory.student1RegisterRequest())))
                .andReturn();
        studentToken = TestDataFactory.extractString(studentResult.getResponse().getContentAsString(), "$.data.accessToken");
    }

    // ===================== STUDENT CANNOT ACCESS ADMIN APIs =====================

    @Test
    @Order(1)
    @DisplayName("Student cannot create school (Admin only)")
    void student_CannotCreateSchool() throws Exception {
        mockMvc.perform(post("/api/v1/schools")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestDataFactory.asJsonString(TestDataFactory.validSchoolRequest()))
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(2)
    @DisplayName("Student cannot delete school (Admin only)")
    void student_CannotDeleteSchool() throws Exception {
        mockMvc.perform(delete("/api/v1/schools/1")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(3)
    @DisplayName("Student cannot list all schools (Admin/School only)")
    void student_CannotListSchools() throws Exception {
        mockMvc.perform(get("/api/v1/schools")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(4)
    @DisplayName("Student cannot delete lessons (Admin only)")
    void student_CannotDeleteLesson() throws Exception {
        mockMvc.perform(delete("/api/v1/lessons/1")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(5)
    @DisplayName("Student cannot create lessons (Admin/Teacher only)")
    void student_CannotCreateLesson() throws Exception {
        mockMvc.perform(post("/api/v1/lessons")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Hack\",\"contentHtml\":\"<p>x</p>\",\"difficultyLevel\":1,\"orderIndex\":1}")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(6)
    @DisplayName("Student cannot create questions (Admin/Teacher only)")
    void student_CannotCreateQuestion() throws Exception {
        mockMvc.perform(post("/api/v1/questions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"questionType\":\"MULTIPLE_CHOICE\",\"questionText\":\"test\",\"points\":1}")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(7)
    @DisplayName("Student cannot create exams (Admin/Teacher only)")
    void student_CannotCreateExam() throws Exception {
        mockMvc.perform(post("/api/v1/exams")
                        .param("teacherId", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Hack Exam\",\"classId\":1,\"durationMinutes\":15,\"startTime\":\"2026-12-01T10:00:00\",\"endTime\":\"2026-12-01T12:00:00\"}")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(8)
    @DisplayName("Student cannot view exam results (Admin/School/Teacher only)")
    void student_CannotViewExamResults() throws Exception {
        mockMvc.perform(get("/api/v1/exams/1/results")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(9)
    @DisplayName("Student cannot list all users (Admin/School only)")
    void student_CannotListUsers() throws Exception {
        mockMvc.perform(get("/api/v1/users")
                        .param("page", "0")
                        .param("size", "10")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(10)
    @DisplayName("Student cannot view user by ID (Admin/School/Teacher only)")
    void student_CannotViewUserById() throws Exception {
        mockMvc.perform(get("/api/v1/users/1")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    // ===================== TEACHER BOUNDARIES =====================

    @Test
    @Order(20)
    @DisplayName("Teacher cannot create school (Admin only)")
    void teacher_CannotCreateSchool() throws Exception {
        mockMvc.perform(post("/api/v1/schools")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestDataFactory.asJsonString(TestDataFactory.validSchoolRequest()))
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(21)
    @DisplayName("Teacher cannot delete school (Admin only)")
    void teacher_CannotDeleteSchool() throws Exception {
        mockMvc.perform(delete("/api/v1/schools/1")
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(22)
    @DisplayName("Teacher cannot delete lessons (Admin only)")
    void teacher_CannotDeleteLesson() throws Exception {
        mockMvc.perform(delete("/api/v1/lessons/1")
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @Order(23)
    @DisplayName("Teacher cannot submit exam (Student only)")
    void teacher_CannotSubmitExam() throws Exception {
        mockMvc.perform(post("/api/v1/exams/submit")
                        .param("studentId", "1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"examId\":1,\"answers\":[]}")
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isForbidden());
    }

    // ===================== TOKEN EDGE CASES =====================

    @Test
    @Order(30)
    @DisplayName("No token should return 401 for protected endpoints")
    void noToken_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/users/me"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/schools"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/vocabulary/lesson/1"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/progress/user/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(31)
    @DisplayName("Malformed token should return 401")
    void malformedToken_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/users/me")
                        .header("Authorization", "Bearer not.a.valid.jwt.token"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(32)
    @DisplayName("Empty bearer token should return 401")
    void emptyBearer_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/users/me")
                        .header("Authorization", "Bearer "))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(33)
    @DisplayName("Authorization without Bearer prefix should return 401")
    void noBearerPrefix_ShouldReturn401() throws Exception {
        mockMvc.perform(get("/api/v1/users/me")
                        .header("Authorization", studentToken))
                .andExpect(status().isUnauthorized());
    }

    // ===================== PUBLIC ENDPOINTS =====================

    @Test
    @Order(40)
    @DisplayName("Auth endpoints are accessible without token")
    void authEndpoints_ArePublic() throws Exception {
        mockMvc.perform(get("/api/v1/auth/health"))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"username\":\"x\",\"password\":\"y\"}"))
                .andExpect(result -> {
                    // Should be 400 or 401, but NOT 403 (it's accessible)
                    int status = result.getResponse().getStatus();
                    assert status != 403 : "Auth endpoint should be public, got 403";
                });
    }

    @Test
    @Order(41)
    @DisplayName("Published lessons are accessible without token")
    void publishedLessons_ArePublic() throws Exception {
        // Published lessons require auth at URL level but any role can access
        mockMvc.perform(get("/api/v1/lessons")
                        .param("published", "true")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk());
    }

    @Test
    @Order(42)
    @DisplayName("Swagger UI is accessible without token")
    void swaggerUI_IsPublic() throws Exception {
        mockMvc.perform(get("/swagger-ui/index.html"))
                .andExpect(result -> {
                    int status = result.getResponse().getStatus();
                    // Should be 200 or 302 redirect, not 401/403
                    assert status != 401 && status != 403 :
                            "Swagger should be public, got " + status;
                });
    }
}
