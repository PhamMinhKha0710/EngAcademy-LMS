package com.englishlearn.presentation.controller;

import com.englishlearn.application.dto.request.AntiCheatEventDTO;
import com.englishlearn.application.dto.request.ExamRequest;
import com.englishlearn.application.dto.request.ExamSubmitDTO;
import com.englishlearn.application.dto.request.SubmitExamRequest;
import com.englishlearn.application.dto.response.ApiResponse;
import com.englishlearn.application.dto.response.ExamResponse;
import com.englishlearn.application.dto.response.ExamResultDTO;
import com.englishlearn.application.dto.response.ExamResultResponse;
import com.englishlearn.application.dto.response.ExamTakeDTO;
import com.englishlearn.application.service.ExamService;
import com.englishlearn.domain.entity.AntiCheatEvent;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/exams")
@RequiredArgsConstructor
@Tag(name = "Exam Management", description = "APIs for managing exams")
public class ExamController {

    private final ExamService examService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL', 'TEACHER')")
    @Operation(summary = "Get all exams")
    public ResponseEntity<ApiResponse<Page<ExamResponse>>> getAllExams(Pageable pageable) {
        Page<ExamResponse> exams = examService.getAllExams(pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách bài kiểm tra thành công", exams));
    }

    @GetMapping("/teacher/{teacherId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL', 'TEACHER')")
    @Operation(summary = "Get exams by teacher")
    public ResponseEntity<ApiResponse<Page<ExamResponse>>> getExamsByTeacher(
            @PathVariable Long teacherId, Pageable pageable) {
        Page<ExamResponse> exams = examService.getExamsByTeacher(teacherId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách bài kiểm tra thành công", exams));
    }

    @GetMapping("/class/{classId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL', 'TEACHER', 'STUDENT')")
    @Operation(summary = "Get exams by class")
    public ResponseEntity<ApiResponse<Page<ExamResponse>>> getExamsByClass(
            @PathVariable Long classId, Pageable pageable) {
        Page<ExamResponse> exams = examService.getExamsByClass(classId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách bài kiểm tra thành công", exams));
    }

    @GetMapping("/class/{classId}/active")
    @PreAuthorize("hasAnyRole('TEACHER', 'STUDENT')")
    @Operation(summary = "Get active exams for student")
    public ResponseEntity<ApiResponse<List<ExamResponse>>> getActiveExams(@PathVariable Long classId) {
        List<ExamResponse> exams = examService.getActiveExamsForStudent(classId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách bài kiểm tra đang mở thành công", exams));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL', 'TEACHER')")
    @Operation(summary = "Get exam by ID (teacher/admin view - shows correct answers)")
    public ResponseEntity<ApiResponse<ExamResponse>> getExamById(@PathVariable Long id) {
        ExamResponse exam = examService.getExamById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin bài kiểm tra thành công", exam));
    }

    @GetMapping("/{id}/take")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Get exam for student to take - shuffles questions/answers, hides correct answers")
    public ResponseEntity<ApiResponse<ExamResponse>> getExamForStudent(@PathVariable Long id) {
        ExamResponse exam = examService.getExamForStudent(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy đề thi thành công", exam));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Create a new exam")
    public ResponseEntity<ApiResponse<ExamResponse>> createExam(
            @RequestParam Long teacherId,
            @Valid @RequestBody ExamRequest request) {
        ExamResponse exam = examService.createExam(teacherId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo bài kiểm tra thành công", exam));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Update an exam")
    public ResponseEntity<ApiResponse<ExamResponse>> updateExam(
            @PathVariable Long id,
            @Valid @RequestBody ExamRequest request) {
        ExamResponse exam = examService.updateExam(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật bài kiểm tra thành công", exam));
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Publish an exam")
    public ResponseEntity<ApiResponse<ExamResponse>> publishExam(@PathVariable Long id) {
        ExamResponse exam = examService.publishExam(id);
        return ResponseEntity.ok(ApiResponse.success("Công bố bài kiểm tra thành công", exam));
    }

    @PostMapping("/{id}/close")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Close an exam")
    public ResponseEntity<ApiResponse<ExamResponse>> closeExam(@PathVariable Long id) {
        ExamResponse exam = examService.closeExam(id);
        return ResponseEntity.ok(ApiResponse.success("Đóng bài kiểm tra thành công", exam));
    }

    @PostMapping("/submit")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Submit exam answers")
    public ResponseEntity<ApiResponse<ExamResultResponse>> submitExam(
            @RequestParam Long studentId,
            @Valid @RequestBody SubmitExamRequest request) {
        ExamResultResponse result = examService.submitExam(studentId, request);
        return ResponseEntity.ok(ApiResponse.success("Nộp bài kiểm tra thành công", result));
    }

    @GetMapping("/{id}/results")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL', 'TEACHER')")
    @Operation(summary = "Get exam results")
    public ResponseEntity<ApiResponse<List<ExamResultResponse>>> getExamResults(@PathVariable Long id) {
        List<ExamResultResponse> results = examService.getExamResults(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy kết quả bài kiểm tra thành công", results));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Delete an exam")
    public ResponseEntity<ApiResponse<Void>> deleteExam(@PathVariable Long id) {
        examService.deleteExam(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa bài kiểm tra thành công", null));
    }

    // ========================= ANTI-CHEAT EXAM ENDPOINTS =========================

    /**
     * POST /api/v1/exams/{examId}/start - Bắt đầu làm bài thi (tạo ExamResult, shuffle, trả về anti-cheat info)
     */
    @PostMapping("/{examId}/start")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Bắt đầu làm bài thi (có shuffle câu hỏi/đáp án, tạo phiên thi)")
    public ResponseEntity<ApiResponse<ExamTakeDTO>> startExam(
            @Parameter(description = "ID của bài thi") @PathVariable Long examId,
            @Parameter(description = "ID của sinh viên") @RequestParam Long studentId) {
        ExamTakeDTO exam = examService.takeExam(examId, studentId);
        return ResponseEntity.ok(ApiResponse.success("Bắt đầu bài thi thành công", exam));
    }

    /**
     * POST /api/v1/exams/{examId}/anti-cheat-event - Ghi nhận sự kiện anti-cheat
     */
    @PostMapping("/{examId}/anti-cheat-event")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Ghi nhận sự kiện chống gian lận (tab switch, copy/paste, v.v.)")
    public ResponseEntity<ApiResponse<Void>> logAntiCheatEvent(
            @Parameter(description = "ID của bài thi") @PathVariable Long examId,
            @RequestBody @Valid AntiCheatEventDTO dto) {
        examService.logAntiCheatEvent(dto);
        return ResponseEntity.ok(ApiResponse.success("Đã ghi nhận sự kiện"));
    }

    /**
     * POST /api/v1/exams/{examId}/submit-anticheat - Nộp bài thi với anti-cheat validation
     */
    @PostMapping("/{examId}/submit-anticheat")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Nộp bài thi (với kiểm tra thời gian và anti-cheat)")
    public ResponseEntity<ApiResponse<ExamResultDTO>> submitExamWithAntiCheat(
            @Parameter(description = "ID của bài thi") @PathVariable Long examId,
            @RequestBody @Valid ExamSubmitDTO dto) {
        ExamResultDTO result = examService.submitExamWithAntiCheat(dto);
        return ResponseEntity.ok(ApiResponse.success("Nộp bài thành công", result));
    }

    /**
     * GET /api/v1/exams/results/{examResultId}/anti-cheat-events - Lấy lịch sử vi phạm
     */
    @GetMapping("/results/{examResultId}/anti-cheat-events")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    @Operation(summary = "Lấy lịch sử các sự kiện gian lận của một bài thi")
    public ResponseEntity<ApiResponse<List<AntiCheatEvent>>> getAntiCheatEvents(
            @Parameter(description = "ID của kết quả thi") @PathVariable Long examResultId) {
        List<AntiCheatEvent> events = examService.getAntiCheatEvents(examResultId);
        return ResponseEntity.ok(ApiResponse.success(events));
    }
}
