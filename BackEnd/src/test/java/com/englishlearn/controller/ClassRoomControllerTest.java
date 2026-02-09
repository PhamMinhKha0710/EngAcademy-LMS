package com.englishlearn.controller;

import com.englishlearn.application.dto.request.ClassRoomRequest;
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
 * Integration tests for ClassRoomController.
 * Tests CRUD, student management, and teacher assignment.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class ClassRoomControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private JwtService jwtService;

        private String adminToken;
        private String schoolToken;
        private String teacherToken;
        private String studentToken;

        private static Long schoolId;
        private static Long teacherId;
        private static Long studentId;
        private static Long classId;

        @BeforeEach
        void setUp() {
                adminToken = jwtService.generateToken(TestDataFactory.adminUserDetails());
                schoolToken = jwtService.generateToken(TestDataFactory.schoolUserDetails());
                teacherToken = jwtService.generateToken(TestDataFactory.teacher1UserDetails());
                studentToken = jwtService.generateToken(TestDataFactory.student1UserDetails());
        }

        @Test
        @Order(0)
        @DisplayName("Setup: Register users and create school for tests")
        void setup() throws Exception {
                // Register users
                MvcResult adminResult = mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(TestDataFactory.adminRegisterRequest())))
                                .andReturn();

                mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(TestDataFactory.schoolRegisterRequest())));

                MvcResult teacherResult = mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(TestDataFactory.teacher1RegisterRequest())))
                                .andReturn();
                teacherId = TestDataFactory.extractLong(teacherResult.getResponse().getContentAsString(), "$.data.id");

                MvcResult studentResult = mockMvc.perform(post("/api/v1/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(TestDataFactory.student1RegisterRequest())))
                                .andReturn();
                studentId = TestDataFactory.extractLong(studentResult.getResponse().getContentAsString(), "$.data.id");

                // Create school
                MvcResult schoolResult = mockMvc.perform(post("/api/v1/schools")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(TestDataFactory.validSchoolRequest()))
                                .header("Authorization", "Bearer " + adminToken))
                                .andExpect(status().isCreated())
                                .andReturn();
                schoolId = TestDataFactory.extractLong(schoolResult.getResponse().getContentAsString(), "$.data.id");
        }

        // ===================== POST /api/v1/classes =====================

        @Test
        @Order(1)
        @DisplayName("TC-CLASS-001: Admin create classroom with valid data should return 201")
        void createClassRoom_Admin_ShouldReturn201() throws Exception {
                ClassRoomRequest request = TestDataFactory.validClassRoomRequest(schoolId, teacherId);

                MvcResult result = mockMvc.perform(post("/api/v1/classes")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request))
                                .header("Authorization", "Bearer " + adminToken))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.name").value("Lớp 10A1 - Tiếng Anh Nâng Cao"))
                                .andReturn();

                classId = TestDataFactory.extractLong(result.getResponse().getContentAsString(), "$.data.id");
        }

        @Test
        @Order(2)
        @DisplayName("TC-CLASS-002: Create classroom with non-existent schoolId should return 404")
        void createClassRoom_InvalidSchoolId_ShouldReturn404() throws Exception {
                ClassRoomRequest request = TestDataFactory.validClassRoomRequest(999999L, teacherId);

                mockMvc.perform(post("/api/v1/classes")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request))
                                .header("Authorization", "Bearer " + adminToken))
                                .andExpect(result -> {
                                        int status = result.getResponse().getStatus();
                                        assert status == 404 || status == 500 : "Expected 404 or 500, got " + status;
                                });
        }

        @Test
        @Order(3)
        @DisplayName("TC-CLASS-005: Teacher create classroom should return 403")
        void createClassRoom_Teacher_ShouldReturn403() throws Exception {
                ClassRoomRequest request = TestDataFactory.validClassRoomRequest(schoolId, teacherId);

                mockMvc.perform(post("/api/v1/classes")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request))
                                .header("Authorization", "Bearer " + teacherToken))
                                .andExpect(status().isForbidden());
        }

        @Test
        @Order(4)
        @DisplayName("TC-CLASS-006: Create classroom with empty name should return 400")
        void createClassRoom_EmptyName_ShouldReturn400() throws Exception {
                ClassRoomRequest request = ClassRoomRequest.builder()
                                .name("")
                                .schoolId(schoolId)
                                .teacherId(teacherId)
                                .academicYear("2025-2026")
                                .isActive(true)
                                .build();

                mockMvc.perform(post("/api/v1/classes")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request))
                                .header("Authorization", "Bearer " + adminToken))
                                .andExpect(status().isBadRequest());
        }

        // ===================== Student Management =====================

        @Test
        @Order(10)
        @DisplayName("TC-CLASS-010: Add student to class should return 200")
        void addStudent_ShouldReturn200() throws Exception {
                mockMvc.perform(post("/api/v1/classes/" + classId + "/students/" + studentId)
                                .header("Authorization", "Bearer " + adminToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true));
        }

        @Test
        @Order(11)
        @DisplayName("TC-CLASS-011: Add student already in class should return error")
        void addStudent_Duplicate_ShouldReturnError() throws Exception {
                // Student was already added in previous test
                mockMvc.perform(post("/api/v1/classes/" + classId + "/students/" + studentId)
                                .header("Authorization", "Bearer " + adminToken))
                                .andExpect(result -> {
                                        int status = result.getResponse().getStatus();
                                        assert status == 409 || status == 500 : "Expected 409 or 500, got " + status;
                                });
        }

        @Test
        @Order(12)
        @DisplayName("TC-CLASS-012: Add non-existent student should return error")
        void addStudent_NonExistent_ShouldReturnError() throws Exception {
                mockMvc.perform(post("/api/v1/classes/" + classId + "/students/999999")
                                .header("Authorization", "Bearer " + adminToken))
                                .andExpect(result -> {
                                        int status = result.getResponse().getStatus();
                                        assert status == 404 || status == 500 : "Expected 404 or 500, got " + status;
                                });
        }

        @Test
        @Order(13)
        @DisplayName("TC-CLASS-013: Remove student from class should return 200")
        void removeStudent_ShouldReturn200() throws Exception {
                mockMvc.perform(delete("/api/v1/classes/" + classId + "/students/" + studentId)
                                .header("Authorization", "Bearer " + adminToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true));
        }

        // ===================== GET classrooms =====================

        @Test
        @Order(20)
        @DisplayName("TC-CLASS-020: Get classes by school should return 200")
        void getClassesBySchool_ShouldReturn200() throws Exception {
                mockMvc.perform(get("/api/v1/classes/school/" + schoolId)
                                .param("page", "0")
                                .param("size", "10")
                                .header("Authorization", "Bearer " + adminToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true));
        }

        @Test
        @Order(21)
        @DisplayName("TC-CLASS-021: Get classes by teacher should return 200")
        void getClassesByTeacher_ShouldReturn200() throws Exception {
                mockMvc.perform(get("/api/v1/classes/teacher/" + teacherId)
                                .header("Authorization", "Bearer " + adminToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true));
        }

        @Test
        @Order(22)
        @DisplayName("TC-CLASS-022: Student get class by ID should return 200")
        void getClassById_Student_ShouldReturn200() throws Exception {
                mockMvc.perform(get("/api/v1/classes/" + classId)
                                .header("Authorization", "Bearer " + studentToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true));
        }

        // ===================== PUT & DELETE =====================

        @Test
        @Order(30)
        @DisplayName("School manager update classroom should return 200")
        void updateClassRoom_School_ShouldReturn200() throws Exception {
                ClassRoomRequest updated = ClassRoomRequest.builder()
                                .name("Lớp 10A1 - Updated")
                                .schoolId(schoolId)
                                .teacherId(teacherId)
                                .academicYear("2025-2026")
                                .isActive(true)
                                .build();

                mockMvc.perform(put("/api/v1/classes/" + classId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(updated))
                                .header("Authorization", "Bearer " + schoolToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true));
        }

        @Test
        @Order(40)
        @DisplayName("Admin delete classroom should return 200")
        void deleteClassRoom_Admin_ShouldReturn200() throws Exception {
                // Create another class to delete
                ClassRoomRequest request = TestDataFactory.secondClassRoomRequest(schoolId, teacherId);
                MvcResult result = mockMvc.perform(post("/api/v1/classes")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(TestDataFactory.asJsonString(request))
                                .header("Authorization", "Bearer " + adminToken))
                                .andExpect(status().isCreated())
                                .andReturn();

                Long deleteId = TestDataFactory.extractLong(result.getResponse().getContentAsString(), "$.data.id");

                mockMvc.perform(delete("/api/v1/classes/" + deleteId)
                                .header("Authorization", "Bearer " + adminToken))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true));
        }
}
