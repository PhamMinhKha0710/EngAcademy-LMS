package com.englishlearn.controller;

import com.englishlearn.application.dto.request.SchoolRequest;
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

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Integration tests for SchoolController.
 * Tests CRUD operations, search, soft/hard delete, and role-based access.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class SchoolControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private JwtService jwtService;

        private String adminToken;
        private String schoolToken;
        private String teacherToken;
        private String studentToken;

        @BeforeEach
        void setUp() {
                adminToken = jwtService.generateToken(TestDataFactory.adminUserDetails());
                schoolToken = jwtService.generateToken(TestDataFactory.schoolUserDetails());
                teacherToken = jwtService.generateToken(TestDataFactory.teacher1UserDetails());
                studentToken = jwtService.generateToken(TestDataFactory.student1UserDetails());
        }

        private void registerUsers() throws Exception {
                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(TestDataFactory.adminRegisterRequest())));
                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(TestDataFactory.schoolRegisterRequest())));
                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(TestDataFactory.teacher1RegisterRequest())));
                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(TestDataFactory.student1RegisterRequest())));
        }

        // ===================== POST /api/v1/schools =====================

        @Test
        @Order(1)
        @DisplayName("TC-SCHOOL-001: Admin create school with valid data should return 201")
        void createSchool_Admin_ValidData_ShouldReturn201() throws Exception {
                registerUsers();

                mockMvc.perform(post("/api/v1/schools")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(TestDataFactory.validSchoolRequest()))
                                .header("Authorization", "Bearer " + adminToken))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.name").value("Trường THPT Nguyễn Huệ - Quận 1"))
                                .andExpect(jsonPath("$.data.id").isNumber());
        }

        @Test
        @Order(2)
        @DisplayName("TC-SCHOOL-003: Create school with invalid email should return 400")
        void createSchool_InvalidEmail_ShouldReturn400() throws Exception {
                SchoolRequest request = SchoolRequest.builder()
                                .name("Trường Test Invalid Email")
                                .address("123 Test Street")
                                .phone("02838221234")
                                .email("not-a-valid-email")
                                .trialEndDate(LocalDate.now().plusMonths(1))
                                .isActive(true)
                                .build();

                mockMvc.perform(post("/api/v1/schools")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request))
                                .header("Authorization", "Bearer " + adminToken))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.success").value(false));
        }

        @Test
        @Order(3)
        @DisplayName("TC-SCHOOL-005: Create school with null name should return 400")
        void createSchool_NullName_ShouldReturn400() throws Exception {
                SchoolRequest request = SchoolRequest.builder()
                                .name(null)
                                .address("123 Test Street")
                                .phone("02838221234")
                                .email("valid@edu.vn")
                                .isActive(true)
                                .build();

                mockMvc.perform(post("/api/v1/schools")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request))
                                .header("Authorization", "Bearer " + adminToken))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.success").value(false));
        }

        @Test
        @Order(4)
        @DisplayName("TC-SCHOOL-006: Teacher create school should return 403")
        void createSchool_Teacher_ShouldReturn403() throws Exception {
                mockMvc.perform(post("/api/v1/schools")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(TestDataFactory.validSchoolRequest()))
                                .header("Authorization", "Bearer " + teacherToken))
                                .andExpect(status().isForbidden());
        }

        @Test
        @Order(5)
        @DisplayName("TC-SCHOOL-007: Student create school should return 403")
        void createSchool_Student_ShouldReturn403() throws Exception {
                mockMvc.perform(post("/api/v1/schools")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(TestDataFactory.validSchoolRequest()))
                                .header("Authorization", "Bearer " + studentToken))
                                .andExpect(status().isForbidden());
        }

        @Test
        @Order(6)
        @DisplayName("TC-SCHOOL-004: Create school with past trialEndDate should be handled")
        void createSchool_PastTrialEndDate_ShouldBeHandled() throws Exception {
                SchoolRequest request = SchoolRequest.builder()
                                .name("Trường Test Past Date")
                                .address("456 Past Road")
                                .phone("02838009876")
                                .email("pastdate@edu.vn")
                                .trialEndDate(LocalDate.now().minusMonths(1))
                                .isActive(true)
                                .build();

                mockMvc.perform(post("/api/v1/schools")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request))
                                .header("Authorization", "Bearer " + adminToken))
                                .andExpect(result -> {
                                        int status = result.getResponse().getStatus();
                                        assert status == 201 || status == 400 : "Expected 201 or 400, got " + status;
                                });
        }

        // ===================== GET /api/v1/schools =====================

        @Test
        @Order(10)
        @DisplayName("TC-SCHOOL-010: Admin get all schools should return 200")
        void getAllSchools_Admin_ShouldReturn200() throws Exception {
                mockMvc.perform(get("/api/v1/schools")
                                .header("Authorization", "Bearer " + adminToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data").isArray());
        }

        @Test
        @Order(11)
        @DisplayName("TC-SCHOOL-011: Get school by ID should return 200")
        void getSchoolById_ShouldReturn200() throws Exception {
                mockMvc.perform(get("/api/v1/schools/1")
                                .header("Authorization", "Bearer " + adminToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.id").value(1));
        }

        @Test
        @Order(12)
        @DisplayName("TC-SCHOOL-012: Get non-existent school should return 404")
        void getSchoolById_NonExistent_ShouldReturn404() throws Exception {
                mockMvc.perform(get("/api/v1/schools/999999")
                                .header("Authorization", "Bearer " + adminToken))
                                .andExpect(status().isNotFound())
                                .andExpect(jsonPath("$.success").value(false));
        }

        @Test
        @Order(13)
        @DisplayName("TC-SCHOOL-013: Get active schools with pagination should return 200")
        void getActiveSchools_ShouldReturn200() throws Exception {
                mockMvc.perform(get("/api/v1/schools/active")
                                .param("page", "0")
                                .param("size", "10")
                                .header("Authorization", "Bearer " + adminToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true));
        }

        @Test
        @Order(14)
        @DisplayName("TC-SCHOOL-014: Search schools by name should return 200")
        void searchSchools_ShouldReturn200() throws Exception {
                mockMvc.perform(get("/api/v1/schools/search")
                                .param("name", "Nguyễn Huệ")
                                .header("Authorization", "Bearer " + adminToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true));
        }

        @Test
        @Order(15)
        @DisplayName("TC-SCHOOL-015: Search non-existent school name should return empty list")
        void searchSchools_NotFound_ShouldReturnEmpty() throws Exception {
                mockMvc.perform(get("/api/v1/schools/search")
                                .param("name", "NonExistentSchoolXYZ123")
                                .header("Authorization", "Bearer " + adminToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.data").isArray());
        }

        @Test
        @Order(16)
        @DisplayName("TC-SCHOOL-016: Student GET schools should return 403")
        void getAllSchools_Student_ShouldReturn403() throws Exception {
                mockMvc.perform(get("/api/v1/schools")
                                .header("Authorization", "Bearer " + studentToken))
                                .andExpect(status().isForbidden());
        }

        // ===================== PUT /api/v1/schools/{id} =====================

        @Test
        @Order(20)
        @DisplayName("TC-SCHOOL-020: Admin update school should return 200")
        void updateSchool_Admin_ShouldReturn200() throws Exception {
                SchoolRequest updated = SchoolRequest.builder()
                                .name("Trường THPT Nguyễn Huệ - Updated")
                                .address("123 Nguyễn Huệ Updated, Q1, HCM")
                                .phone("02838221235")
                                .email("nguyenhue.updated@edu.vn")
                                .trialEndDate(LocalDate.now().plusMonths(6))
                                .isActive(true)
                                .build();

                mockMvc.perform(put("/api/v1/schools/1")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(updated))
                                .header("Authorization", "Bearer " + adminToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.name").value("Trường THPT Nguyễn Huệ - Updated"));
        }

        @Test
        @Order(21)
        @DisplayName("TC-SCHOOL-021: School manager update should return 200")
        void updateSchool_SchoolManager_ShouldReturn200() throws Exception {
                SchoolRequest updated = SchoolRequest.builder()
                                .name("Trường THPT Nguyễn Huệ - School Edit")
                                .address("123 Nguyễn Huệ, Q1, HCM")
                                .phone("02838221236")
                                .email("nguyenhue.school@edu.vn")
                                .trialEndDate(LocalDate.now().plusMonths(6))
                                .isActive(true)
                                .build();

                mockMvc.perform(put("/api/v1/schools/1")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(updated))
                                .header("Authorization", "Bearer " + schoolToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true));
        }

        // ===================== DELETE /api/v1/schools/{id} =====================

        @Test
        @Order(30)
        @DisplayName("TC-SCHOOL-025: Teacher delete school should return 403")
        void deleteSchool_Teacher_ShouldReturn403() throws Exception {
                mockMvc.perform(delete("/api/v1/schools/1")
                                .header("Authorization", "Bearer " + teacherToken))
                                .andExpect(status().isForbidden());
        }

        @Test
        @Order(31)
        @DisplayName("TC-SCHOOL-022: Admin soft delete should return 200")
        void softDeleteSchool_Admin_ShouldReturn200() throws Exception {
                // Create a school to delete
                MvcResult result = mockMvc.perform(post("/api/v1/schools")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(TestDataFactory.secondSchoolRequest()))
                                .header("Authorization", "Bearer " + adminToken))
                                .andExpect(status().isCreated())
                                .andReturn();

                // Extract id from response
                String responseBody = result.getResponse().getContentAsString();
                // Delete it
                mockMvc.perform(delete("/api/v1/schools/2")
                                .header("Authorization", "Bearer " + adminToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true));
        }

        @Test
        @Order(32)
        @DisplayName("TC-SCHOOL-023: Admin permanent delete should return 200")
        void hardDeleteSchool_Admin_ShouldReturn200() throws Exception {
                // Create another school
                SchoolRequest request = SchoolRequest.builder()
                                .name("Trường Sẽ Bị Xóa Vĩnh Viễn")
                                .address("789 Delete Road")
                                .phone("02838999888")
                                .email("delete.permanent@edu.vn")
                                .isActive(true)
                                .build();

                mockMvc.perform(post("/api/v1/schools")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request))
                                .header("Authorization", "Bearer " + adminToken))
                                .andExpect(status().isCreated());

                mockMvc.perform(delete("/api/v1/schools/3/permanent")
                                .header("Authorization", "Bearer " + adminToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true));
        }
}
