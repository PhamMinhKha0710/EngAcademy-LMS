package com.englishlearn.presentation.controller;

import com.englishlearn.application.dto.response.ApiResponse;
import com.englishlearn.application.dto.response.ProgressResponse;
import com.englishlearn.application.service.ProgressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/progress")
@RequiredArgsConstructor
@Tag(name = "Progress", description = "APIs for tracking learning progress")
public class ProgressController {

    private final ProgressService progressService;

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    @Operation(summary = "Get all progress for user")
    public ResponseEntity<ApiResponse<List<ProgressResponse>>> getProgressByUser(@PathVariable Long userId) {
        List<ProgressResponse> progress = progressService.getProgressByUser(userId);
        return ResponseEntity.ok(ApiResponse.success("Lấy tiến độ học tập thành công", progress));
    }

    @GetMapping("/user/{userId}/completed")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    @Operation(summary = "Get completed lessons for user")
    public ResponseEntity<ApiResponse<List<ProgressResponse>>> getCompletedLessons(@PathVariable Long userId) {
        List<ProgressResponse> progress = progressService.getCompletedLessons(userId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách bài học đã hoàn thành thành công", progress));
    }

    @GetMapping("/user/{userId}/in-progress")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    @Operation(summary = "Get in-progress lessons for user")
    public ResponseEntity<ApiResponse<List<ProgressResponse>>> getInProgressLessons(@PathVariable Long userId) {
        List<ProgressResponse> progress = progressService.getInProgressLessons(userId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách bài học đang học thành công", progress));
    }

    @GetMapping("/user/{userId}/lesson/{lessonId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    @Operation(summary = "Get progress for specific lesson")
    public ResponseEntity<ApiResponse<ProgressResponse>> getProgressForLesson(
            @PathVariable Long userId, @PathVariable Long lessonId) {
        ProgressResponse progress = progressService.getProgressForLesson(userId, lessonId);
        return ResponseEntity.ok(ApiResponse.success("Lấy tiến độ bài học thành công", progress));
    }

    @PostMapping("/user/{userId}/lesson/{lessonId}")
    @PreAuthorize("hasAnyRole('STUDENT')")
    @Operation(summary = "Update progress for lesson")
    public ResponseEntity<ApiResponse<ProgressResponse>> updateProgress(
            @PathVariable Long userId,
            @PathVariable Long lessonId,
            @RequestParam Integer percentage) {
        ProgressResponse progress = progressService.updateProgress(userId, lessonId, percentage);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật tiến độ thành công", progress));
    }

    @PostMapping("/user/{userId}/lesson/{lessonId}/complete")
    @PreAuthorize("hasAnyRole('STUDENT')")
    @Operation(summary = "Mark lesson as completed")
    public ResponseEntity<ApiResponse<ProgressResponse>> completeLesson(
            @PathVariable Long userId, @PathVariable Long lessonId) {
        ProgressResponse progress = progressService.completeLesson(userId, lessonId);
        return ResponseEntity.ok(ApiResponse.success("Hoàn thành bài học thành công", progress));
    }

    @GetMapping("/user/{userId}/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    @Operation(summary = "Get learning statistics for user")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserStats(@PathVariable Long userId) {
        Long completedCount = progressService.getCompletedCount(userId);
        Double avgProgress = progressService.getAverageProgress(userId);
        Long totalLessons = progressService.getTotalLessonsCount();
        Long wordsLearned = progressService.getWordsLearnedCount(userId);

        Map<String, Object> stats = Map.of(
                "completedLessons", completedCount,
                "totalLessons", totalLessons,
                "averageScore", avgProgress,
                "totalTimeSpent", 0,
                "wordsLearned", wordsLearned);

        return ResponseEntity.ok(ApiResponse.success("Lấy thống kê học tập thành công", stats));
    }
}
