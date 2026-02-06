package com.englishlearn.controller;

import com.englishlearn.dto.request.LessonRequest;
import com.englishlearn.dto.response.ApiResponse;
import com.englishlearn.dto.response.LessonResponse;
import com.englishlearn.service.LessonService;
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

/**
 * Lesson Controller - Quản lý bài học
 * 
 * RESTful API Naming Conventions:
 * ================================
 * 1. Sử dụng danh từ số nhiều (plural nouns): /lessons, /users, /topics
 * 2. Sử dụng chữ thường và dấu gạch nối: /daily-quests, /exam-results
 * 3. HTTP Methods quyết định hành động:
 * - GET : Lấy dữ liệu (Read)
 * - POST : Tạo mới (Create)
 * - PUT : Cập nhật toàn bộ (Update - full)
 * - PATCH : Cập nhật một phần (Update - partial)
 * - DELETE : Xóa (Delete)
 * 4. Nested resources cho quan hệ: /topics/{topicId}/lessons
 * 5. Query params cho filtering: ?published=true&level=1
 * 6. API versioning: /api/v1/...
 */
@RestController
@RequestMapping("/api/v1/lessons")
@RequiredArgsConstructor
@Tag(name = "Lessons", description = "API quản lý bài học")
public class LessonController {

    private final LessonService lessonService;

    /**
     * GET /api/v1/lessons/{id} - Lấy chi tiết một bài học
     */
    @GetMapping("/{id}")
    @Operation(summary = "Lấy bài học theo ID")
    public ResponseEntity<ApiResponse<LessonResponse>> getById(
            @Parameter(description = "ID của bài học") @PathVariable Long id) {
        LessonResponse lesson = lessonService.getLessonById(id);
        return ResponseEntity.ok(ApiResponse.success(lesson));
    }

    /**
     * GET /api/v1/lessons - Lấy danh sách bài học (có phân trang)
     */
    @GetMapping
    @Operation(summary = "Lấy danh sách tất cả bài học (phân trang)")
    public ResponseEntity<ApiResponse<Page<LessonResponse>>> getAll(Pageable pageable) {
        Page<LessonResponse> lessons = lessonService.getAllLessons(pageable);
        return ResponseEntity.ok(ApiResponse.success(lessons));
    }

    /**
     * GET /api/v1/lessons?published=true - Lấy bài học đã xuất bản
     * Sử dụng query param thay vì path riêng
     */
    @GetMapping(params = "published=true")
    @Operation(summary = "Lấy danh sách bài học đã xuất bản")
    public ResponseEntity<ApiResponse<List<LessonResponse>>> getPublished() {
        List<LessonResponse> lessons = lessonService.getPublishedLessons();
        return ResponseEntity.ok(ApiResponse.success(lessons));
    }

    /**
     * POST /api/v1/lessons - Tạo bài học mới
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    @Operation(summary = "Tạo bài học mới")
    public ResponseEntity<ApiResponse<LessonResponse>> create(
            @RequestBody @Valid LessonRequest request) {
        LessonResponse lesson = lessonService.createLesson(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo bài học thành công", lesson));
    }

    /**
     * PUT /api/v1/lessons/{id} - Cập nhật bài học
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('TEACHER')")
    @Operation(summary = "Cập nhật bài học")
    public ResponseEntity<ApiResponse<LessonResponse>> update(
            @PathVariable Long id,
            @RequestBody @Valid LessonRequest request) {
        LessonResponse lesson = lessonService.updateLesson(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thành công", lesson));
    }

    /**
     * DELETE /api/v1/lessons/{id} - Xóa bài học
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa bài học")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        lessonService.deleteLesson(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa bài học thành công"));
    }
}
