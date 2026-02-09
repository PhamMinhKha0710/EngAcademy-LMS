package com.englishlearn.presentation.controller;

import com.englishlearn.application.dto.request.QuestionRequest;
import com.englishlearn.application.dto.response.ApiResponse;
import com.englishlearn.application.dto.response.QuestionResponse;
import com.englishlearn.application.service.QuestionService;
import io.swagger.v3.oas.annotations.Operation;
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
@RequestMapping("/api/v1/questions")
@RequiredArgsConstructor
@Tag(name = "Question Management", description = "APIs for managing questions")
public class QuestionController {

    private final QuestionService questionService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Get all questions")
    public ResponseEntity<ApiResponse<List<QuestionResponse>>> getAllQuestions() {
        List<QuestionResponse> questions = questionService.getAllQuestions();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách câu hỏi thành công", questions));
    }

    @GetMapping("/type/{type}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Get questions by type")
    public ResponseEntity<ApiResponse<Page<QuestionResponse>>> getQuestionsByType(
            @PathVariable String type, Pageable pageable) {
        Page<QuestionResponse> questions = questionService.getQuestionsByType(type, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách câu hỏi thành công", questions));
    }

    @GetMapping("/lesson/{lessonId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    @Operation(summary = "Get questions by lesson")
    public ResponseEntity<ApiResponse<List<QuestionResponse>>> getQuestionsByLesson(
            @PathVariable Long lessonId) {
        List<QuestionResponse> questions = questionService.getQuestionsByLesson(lessonId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách câu hỏi thành công", questions));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    @Operation(summary = "Get question by ID")
    public ResponseEntity<ApiResponse<QuestionResponse>> getQuestionById(@PathVariable Long id) {
        QuestionResponse question = questionService.getQuestionById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin câu hỏi thành công", question));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Create a new question")
    public ResponseEntity<ApiResponse<QuestionResponse>> createQuestion(
            @Valid @RequestBody QuestionRequest request) {
        QuestionResponse question = questionService.createQuestion(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo câu hỏi thành công", question));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Update a question")
    public ResponseEntity<ApiResponse<QuestionResponse>> updateQuestion(
            @PathVariable Long id,
            @Valid @RequestBody QuestionRequest request) {
        QuestionResponse question = questionService.updateQuestion(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật câu hỏi thành công", question));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Delete a question")
    public ResponseEntity<ApiResponse<Void>> deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa câu hỏi thành công", null));
    }
}
