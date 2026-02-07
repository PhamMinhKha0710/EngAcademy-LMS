package com.englishlearn.controller;

import com.englishlearn.dto.request.ExamRequest;
import com.englishlearn.dto.request.SubmitExamRequest;
import com.englishlearn.dto.response.ApiResponse;
import com.englishlearn.dto.response.ExamResponse;
import com.englishlearn.dto.response.ExamResultResponse;
import com.englishlearn.service.ExamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/exams")
@RequiredArgsConstructor
@Tag(name = "Exam Management", description = "APIs for managing exams")
public class ExamController {

    private final ExamService examService;

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
    @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL', 'TEACHER', 'STUDENT')")
    @Operation(summary = "Get exam by ID")
    public ResponseEntity<ApiResponse<ExamResponse>> getExamById(@PathVariable Long id) {
        ExamResponse exam = examService.getExamById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin bài kiểm tra thành công", exam));
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
}
