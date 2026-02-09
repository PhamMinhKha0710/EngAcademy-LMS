package com.englishlearn.presentation.controller;

import com.englishlearn.application.dto.request.DailyQuestRequest;
import com.englishlearn.application.dto.response.ApiResponse;
import com.englishlearn.application.dto.response.DailyQuestResponse;
import com.englishlearn.application.service.DailyQuestService;
import com.englishlearn.application.service.UserService;
import com.englishlearn.domain.entity.User;
import com.englishlearn.infrastructure.persistence.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Daily Quest Controller - Quản lý nhiệm vụ hàng ngày
 * 
 * RESTful API Endpoints:
 * ======================
 * GET /api/v1/quests/today - Lấy quest hôm nay (hoặc tạo mới)
 * POST /api/v1/quests - Tạo quest mới với tasks tùy chỉnh
 * PATCH /api/v1/quests/tasks/{taskId} - Cập nhật tiến độ task
 * POST /api/v1/quests/complete - Hoàn thành quest
 * GET /api/v1/quests/history - Lịch sử quests
 */
@RestController
@RequestMapping("/api/v1/quests")
@RequiredArgsConstructor
@Tag(name = "Daily Quests", description = "API quản lý nhiệm vụ hàng ngày")
public class DailyQuestController {

    private final DailyQuestService dailyQuestService;
    private final UserRepository userRepository;

    /**
     * GET /api/v1/quests/today - Lấy quest hôm nay
     */
    @GetMapping("/today")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lấy quest của hôm nay")
    public ResponseEntity<ApiResponse<DailyQuestResponse>> getTodayQuest(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        DailyQuestResponse response = dailyQuestService.getTodayQuest(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * POST /api/v1/quests - Tạo quest mới
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Tạo quest mới với tasks tùy chỉnh")
    public ResponseEntity<ApiResponse<DailyQuestResponse>> createQuest(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody DailyQuestRequest request) {
        Long userId = getUserId(userDetails);
        DailyQuestResponse response = dailyQuestService.createDailyQuest(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    /**
     * PATCH /api/v1/quests/tasks/{taskId} - Cập nhật tiến độ task
     */
    @PatchMapping("/tasks/{taskId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Cập nhật tiến độ hoàn thành của task")
    public ResponseEntity<ApiResponse<DailyQuestResponse>> updateTaskProgress(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long taskId,
            @RequestParam Integer progress) {
        Long userId = getUserId(userDetails);
        DailyQuestResponse response = dailyQuestService.updateTaskProgress(userId, taskId, progress);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * POST /api/v1/quests/complete - Hoàn thành quest
     */
    @PostMapping("/complete")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Hoàn thành quest hôm nay")
    public ResponseEntity<ApiResponse<DailyQuestResponse>> completeQuest(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        DailyQuestResponse response = dailyQuestService.completeQuest(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * GET /api/v1/quests/history - Lịch sử quests
     */
    @GetMapping("/history")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lấy lịch sử quests")
    public ResponseEntity<ApiResponse<List<DailyQuestResponse>>> getQuestHistory(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        List<DailyQuestResponse> response = dailyQuestService.getQuestHistory(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * Helper method to extract userId from UserDetails
     */
    private Long getUserId(UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
