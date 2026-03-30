package com.englishlearn.presentation.controller;

import com.englishlearn.application.dto.response.ApiResponse;
import com.englishlearn.application.dto.response.ProgressResponse;
import com.englishlearn.application.service.ProgressService;
import com.englishlearn.domain.entity.User;
import com.englishlearn.infrastructure.persistence.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/progress")
@RequiredArgsConstructor
@Tag(name = "Progress", description = "APIs for tracking learning progress")
public class ProgressController {

    private final ProgressService progressService;
    private final UserRepository userRepository;

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    @Operation(summary = "Lấy tất cả tiến độ học tập của user hiện tại")
    public ResponseEntity<ApiResponse<List<ProgressResponse>>> getMyProgress(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        List<ProgressResponse> progress = progressService.getProgressByUser(userId);
        return ResponseEntity.ok(ApiResponse.success("Lấy tiến độ học tập thành công", progress));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Lấy tất cả tiến độ học tập của user (Teacher/Admin)")
    public ResponseEntity<ApiResponse<List<ProgressResponse>>> getProgressByUser(@PathVariable Long userId) {
        List<ProgressResponse> progress = progressService.getProgressByUser(userId);
        return ResponseEntity.ok(ApiResponse.success("Lấy tiến độ học tập thành công", progress));
    }

    @GetMapping("/me/completed")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    @Operation(summary = "Lấy các bài học đã hoàn thành của user hiện tại")
    public ResponseEntity<ApiResponse<List<ProgressResponse>>> getMyCompletedLessons(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        List<ProgressResponse> progress = progressService.getCompletedLessons(userId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách bài học đã hoàn thành thành công", progress));
    }

    @GetMapping("/user/{userId}/completed")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Lấy các bài học đã hoàn thành của user (Teacher/Admin)")
    public ResponseEntity<ApiResponse<List<ProgressResponse>>> getCompletedLessons(@PathVariable Long userId) {
        List<ProgressResponse> progress = progressService.getCompletedLessons(userId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách bài học đã hoàn thành thành công", progress));
    }

    @GetMapping("/me/in-progress")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    @Operation(summary = "Lấy các bài học đang học của user hiện tại")
    public ResponseEntity<ApiResponse<List<ProgressResponse>>> getMyInProgressLessons(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        List<ProgressResponse> progress = progressService.getInProgressLessons(userId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách bài học đang học thành công", progress));
    }

    @GetMapping("/user/{userId}/in-progress")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Lấy các bài học đang học của user (Teacher/Admin)")
    public ResponseEntity<ApiResponse<List<ProgressResponse>>> getInProgressLessons(@PathVariable Long userId) {
        List<ProgressResponse> progress = progressService.getInProgressLessons(userId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách bài học đang học thành công", progress));
    }

    @GetMapping("/me/lesson/{lessonId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    @Operation(summary = "Lấy tiến độ bài học cụ thể của user hiện tại")
    public ResponseEntity<ApiResponse<ProgressResponse>> getMyProgressForLesson(
            @PathVariable Long lessonId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        ProgressResponse progress = progressService.getProgressForLesson(userId, lessonId);
        return ResponseEntity.ok(ApiResponse.success("Lấy tiến độ bài học thành công", progress));
    }

    @GetMapping("/user/{userId}/lesson/{lessonId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Lấy tiến độ bài học cụ thể của user (Teacher/Admin)")
    public ResponseEntity<ApiResponse<ProgressResponse>> getProgressForLesson(
            @PathVariable Long userId, @PathVariable Long lessonId) {
        ProgressResponse progress = progressService.getProgressForLesson(userId, lessonId);
        return ResponseEntity.ok(ApiResponse.success("Lấy tiến độ bài học thành công", progress));
    }

    @PostMapping("/me/lesson/{lessonId}")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Cập nhật tiến độ bài học cho user hiện tại")
    public ResponseEntity<ApiResponse<ProgressResponse>> updateMyProgress(
            @PathVariable Long lessonId,
            @RequestParam Integer percentage,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        ProgressResponse progress = progressService.updateProgress(userId, lessonId, percentage);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật tiến độ thành công", progress));
    }

    @PostMapping("/user/{userId}/lesson/{lessonId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Cập nhật tiến độ bài học cho user (Teacher/Admin)")
    public ResponseEntity<ApiResponse<ProgressResponse>> updateProgress(
            @PathVariable Long userId,
            @PathVariable Long lessonId,
            @RequestParam Integer percentage) {
        ProgressResponse progress = progressService.updateProgress(userId, lessonId, percentage);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật tiến độ thành công", progress));
    }

    @PostMapping("/me/lesson/{lessonId}/complete")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Đánh dấu bài học hoàn thành cho user hiện tại")
    public ResponseEntity<ApiResponse<ProgressResponse>> completeMyLesson(
            @PathVariable Long lessonId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        ProgressResponse progress = progressService.completeLesson(userId, lessonId);
        return ResponseEntity.ok(ApiResponse.success("Hoàn thành bài học thành công", progress));
    }

    @PostMapping("/user/{userId}/lesson/{lessonId}/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Đánh dấu bài học hoàn thành cho user (Teacher/Admin)")
    public ResponseEntity<ApiResponse<ProgressResponse>> completeLesson(
            @PathVariable Long userId, @PathVariable Long lessonId) {
        ProgressResponse progress = progressService.completeLesson(userId, lessonId);
        return ResponseEntity.ok(ApiResponse.success("Hoàn thành bài học thành công", progress));
    }

    @GetMapping("/me/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    @Operation(summary = "Lấy thống kê học tập của user hiện tại")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMyStats(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        return getStatsResponse(userId);
    }

    @GetMapping("/user/{userId}/stats")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Lấy thống kê học tập của user (Teacher/Admin)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserStats(@PathVariable Long userId) {
        return getStatsResponse(userId);
    }

    private ResponseEntity<ApiResponse<Map<String, Object>>> getStatsResponse(Long userId) {
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

    private Long getUserId(UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
