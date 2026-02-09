package com.englishlearn.e2e;

import com.englishlearn.application.dto.request.ClassRoomRequest;
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
 * E2E-03: Luong Admin Quan Ly Truong & Lop
 *
 * Kich ban thuc te:
 * 1. Admin dang nhap
 * 2. Tao truong hoc
 * 3. Tao lop hoc thuoc truong
 * 4. Gan giao vien cho lop
 * 5. Them hoc sinh vao lop
 * 6. Xem danh sach lop theo truong
 * 7. Xoa hoc sinh khoi lop
 * 8. Xoa truong (kiem tra cascade)
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class AdminSchoolFlowE2ETest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    private static String adminToken;
    private static Long teacherId;
    private static Long studentId;
    private static Long schoolId;
    private static Long classId;

    @Test
    @Order(0)
    @DisplayName("Setup: Register all users")
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
        teacherId = TestDataFactory.extractLong(teacherResult.getResponse().getContentAsString(), "$.data.id");

        MvcResult studentResult = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestDataFactory.asJsonString(TestDataFactory.student1RegisterRequest())))
                .andReturn();
        studentId = TestDataFactory.extractLong(studentResult.getResponse().getContentAsString(), "$.data.id");
    }

    @Test
    @Order(1)
    @DisplayName("Step 1: Admin dang nhap")
    void step1_AdminLogin() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestDataFactory.asJsonString(TestDataFactory.adminLoginRequest())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.roles[0]").value("ROLE_ADMIN"))
                .andReturn();

        adminToken = TestDataFactory.extractString(result.getResponse().getContentAsString(), "$.data.accessToken");
    }

    @Test
    @Order(2)
    @DisplayName("Step 2: Tao truong hoc")
    void step2_CreateSchool() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/schools")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestDataFactory.asJsonString(TestDataFactory.validSchoolRequest()))
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("Trường THPT Nguyễn Huệ - Quận 1"))
                .andReturn();

        schoolId = TestDataFactory.extractLong(result.getResponse().getContentAsString(), "$.data.id");
    }

    @Test
    @Order(3)
    @DisplayName("Step 3: Tao lop hoc thuoc truong")
    void step3_CreateClassRoom() throws Exception {
        ClassRoomRequest request = TestDataFactory.validClassRoomRequest(schoolId, teacherId);

        MvcResult result = mockMvc.perform(post("/api/v1/classes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestDataFactory.asJsonString(request))
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("Lớp 10A1 - Tiếng Anh Nâng Cao"))
                .andReturn();

        classId = TestDataFactory.extractLong(result.getResponse().getContentAsString(), "$.data.id");
    }

    @Test
    @Order(4)
    @DisplayName("Step 4: Gan giao vien cho lop")
    void step4_AssignTeacher() throws Exception {
        mockMvc.perform(post("/api/v1/classes/" + classId + "/teacher/" + teacherId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @Order(5)
    @DisplayName("Step 5: Them hoc sinh vao lop")
    void step5_AddStudent() throws Exception {
        mockMvc.perform(post("/api/v1/classes/" + classId + "/students/" + studentId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @Order(6)
    @DisplayName("Step 6: Xem danh sach lop theo truong")
    void step6_ViewClassesBySchool() throws Exception {
        mockMvc.perform(get("/api/v1/classes/school/" + schoolId)
                        .param("page", "0")
                        .param("size", "10")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    @Order(7)
    @DisplayName("Step 7: Xoa hoc sinh khoi lop")
    void step7_RemoveStudent() throws Exception {
        mockMvc.perform(delete("/api/v1/classes/" + classId + "/students/" + studentId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @Order(8)
    @DisplayName("Step 8: Cap nhat thong tin truong")
    void step8_UpdateSchool() throws Exception {
        SchoolRequest updated = SchoolRequest.builder()
                .name("Trường THPT Nguyễn Huệ - Quận 1 (Updated)")
                .address("123 Nguyễn Huệ, Q1, HCM Updated")
                .phone("02838221999")
                .email("nguyenhue.updated@edu.vn")
                .trialEndDate(LocalDate.now().plusYears(1))
                .isActive(true)
                .build();

        mockMvc.perform(put("/api/v1/schools/" + schoolId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestDataFactory.asJsonString(updated))
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @Order(9)
    @DisplayName("Step 9: Tim kiem truong theo ten")
    void step9_SearchSchool() throws Exception {
        mockMvc.perform(get("/api/v1/schools/search")
                        .param("name", "Nguyễn Huệ")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());
    }
}
