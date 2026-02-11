package com.englishlearn.e2e;

import com.englishlearn.application.dto.request.*;
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


import java.time.LocalDateTime;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * E2E-02: Luong Giao Vien Tao & Quan Ly Bai Thi
 *
 * Kich ban thuc te:
 * 1. Giao vien dang nhap
 * 2. Tao bai hoc
 * 3. Tao 3 cau hoi cho bai hoc
 * 4. Tao de thi tu cac cau hoi
 * 5. Xuat ban de thi
 * 6. Hoc sinh nop bai
 * 7. Giao vien xem ket qua
 * 8. Dong bai thi
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class TeacherExamFlowE2ETest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    private static String teacherToken;
    private static String studentToken;
    private static Long teacherId;
    private static Long studentId;
    private static Long schoolId;
    private static Long classId;
    private static Long lessonId;
    private static Long q1Id, q2Id, q3Id;
    private static Long q1CorrectOptionId;
    private static Long examId;

    @Test
    @Order(0)
    @DisplayName("Setup: Register users, create school and class")
    void setup() throws Exception {
        // Register admin
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(TestDataFactory.asJsonString(TestDataFactory.adminRegisterRequest())));

        String adminToken = jwtService.generateToken(TestDataFactory.adminUserDetails());

        // Register teacher
        MvcResult teacherResult = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestDataFactory.asJsonString(TestDataFactory.teacher1RegisterRequest())))
                .andReturn();
        teacherId = TestDataFactory.extractLong(teacherResult.getResponse().getContentAsString(), "$.data.id");
        teacherToken = TestDataFactory.extractString(teacherResult.getResponse().getContentAsString(), "$.data.accessToken");

        // Register student
        MvcResult studentResult = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestDataFactory.asJsonString(TestDataFactory.student1RegisterRequest())))
                .andReturn();
        studentId = TestDataFactory.extractLong(studentResult.getResponse().getContentAsString(), "$.data.id");
        studentToken = TestDataFactory.extractString(studentResult.getResponse().getContentAsString(), "$.data.accessToken");

        // Create school
        MvcResult schoolResult = mockMvc.perform(post("/api/v1/schools")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestDataFactory.asJsonString(TestDataFactory.validSchoolRequest()))
                        .header("Authorization", "Bearer " + adminToken))
                .andReturn();
        schoolId = TestDataFactory.extractLong(schoolResult.getResponse().getContentAsString(), "$.data.id");

        // Create class
        MvcResult classResult = mockMvc.perform(post("/api/v1/classes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestDataFactory.asJsonString(TestDataFactory.validClassRoomRequest(schoolId, teacherId)))
                        .header("Authorization", "Bearer " + adminToken))
                .andReturn();
        classId = TestDataFactory.extractLong(classResult.getResponse().getContentAsString(), "$.data.id");

        // Add student to class
        mockMvc.perform(post("/api/v1/classes/" + classId + "/students/" + studentId)
                .header("Authorization", "Bearer " + adminToken));
    }

    @Test
    @Order(1)
    @DisplayName("Step 1: Giao vien dang nhap")
    void step1_TeacherLogin() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestDataFactory.asJsonString(TestDataFactory.teacher1LoginRequest())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.roles[0]").value("ROLE_TEACHER"))
                .andReturn();

        teacherToken = TestDataFactory.extractString(result.getResponse().getContentAsString(), "$.data.accessToken");
    }

    @Test
    @Order(2)
    @DisplayName("Step 2: Tao bai hoc moi")
    void step2_CreateLesson() throws Exception {
        LessonRequest request = LessonRequest.builder()
                .title("E2E: Unit Test - Grammar Basics")
                .contentHtml("<h1>Grammar Basics</h1><p>Subject-Verb Agreement</p>")
                .difficultyLevel(2)
                .orderIndex(1)
                .isPublished(true)
                .build();

        MvcResult result = mockMvc.perform(post("/api/v1/lessons")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestDataFactory.asJsonString(request))
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isCreated())
                .andReturn();

        lessonId = TestDataFactory.extractLong(result.getResponse().getContentAsString(), "$.data.id");
    }

    @Test
    @Order(3)
    @DisplayName("Step 3: Tao 3 cau hoi cho bai hoc")
    void step3_CreateQuestions() throws Exception {
        // Question 1: Multiple Choice
        MvcResult q1Result = mockMvc.perform(post("/api/v1/questions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestDataFactory.asJsonString(TestDataFactory.validMultipleChoiceQuestion(lessonId)))
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isCreated())
                .andReturn();
        q1Id = TestDataFactory.extractLong(q1Result.getResponse().getContentAsString(), "$.data.id");
        q1CorrectOptionId = TestDataFactory.extractLong(q1Result.getResponse().getContentAsString(), "$.data.options[0].id");

        // Question 2: True/False
        MvcResult q2Result = mockMvc.perform(post("/api/v1/questions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestDataFactory.asJsonString(TestDataFactory.validTrueFalseQuestion(lessonId)))
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isCreated())
                .andReturn();
        q2Id = TestDataFactory.extractLong(q2Result.getResponse().getContentAsString(), "$.data.id");

        // Question 3: Fill in blank
        MvcResult q3Result = mockMvc.perform(post("/api/v1/questions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestDataFactory.asJsonString(TestDataFactory.validFillInBlankQuestion(lessonId)))
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isCreated())
                .andReturn();
        q3Id = TestDataFactory.extractLong(q3Result.getResponse().getContentAsString(), "$.data.id");
    }

    @Test
    @Order(4)
    @DisplayName("Step 4: Tao de thi tu cac cau hoi")
    void step4_CreateExam() throws Exception {
        ExamRequest request = ExamRequest.builder()
                .title("Kiểm tra 15 phút - Grammar Basics")
                .classId(classId)
                .startTime(LocalDateTime.now().plusMinutes(5))
                .endTime(LocalDateTime.now().plusHours(2))
                .durationMinutes(15)
                .shuffleQuestions(true)
                .shuffleAnswers(false)
                .antiCheatEnabled(false)
                .questionIds(List.of(q1Id, q2Id, q3Id))
                .build();

        MvcResult result = mockMvc.perform(post("/api/v1/exams")
                        .param("teacherId", String.valueOf(teacherId))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestDataFactory.asJsonString(request))
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status").value("DRAFT"))
                .andReturn();

        examId = TestDataFactory.extractLong(result.getResponse().getContentAsString(), "$.data.id");
    }

    @Test
    @Order(5)
    @DisplayName("Step 5: Xuat ban de thi")
    void step5_PublishExam() throws Exception {
        mockMvc.perform(post("/api/v1/exams/" + examId + "/publish")
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("PUBLISHED"));
    }

    @Test
    @Order(6)
    @DisplayName("Step 6: Hoc sinh nop bai")
    void step6_StudentSubmitsExam() throws Exception {
        SubmitExamRequest request = SubmitExamRequest.builder()
                .examId(examId)
                .answers(List.of(
                        SubmitExamRequest.AnswerSubmission.builder()
                                .questionId(q1Id)
                                .selectedOptionId(q1CorrectOptionId)
                                .build(),
                        SubmitExamRequest.AnswerSubmission.builder()
                                .questionId(q2Id)
                                .answerText("False")
                                .build(),
                        SubmitExamRequest.AnswerSubmission.builder()
                                .questionId(q3Id)
                                .answerText("meet")
                                .build()
                ))
                .build();

        mockMvc.perform(post("/api/v1/exams/submit")
                        .param("studentId", String.valueOf(studentId))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestDataFactory.asJsonString(request))
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.score").isNumber())
                .andExpect(jsonPath("$.data.totalQuestions").value(3));
    }

    @Test
    @Order(7)
    @DisplayName("Step 7: Giao vien xem ket qua")
    void step7_TeacherViewResults() throws Exception {
        mockMvc.perform(get("/api/v1/exams/" + examId + "/results")
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data[0].studentId").value(studentId));
    }

    @Test
    @Order(8)
    @DisplayName("Step 8: Dong bai thi")
    void step8_CloseExam() throws Exception {
        mockMvc.perform(post("/api/v1/exams/" + examId + "/close")
                        .header("Authorization", "Bearer " + teacherToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CLOSED"));
    }
}
