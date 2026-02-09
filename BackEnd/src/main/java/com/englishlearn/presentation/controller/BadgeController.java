package com.englishlearn.presentation.controller;

import com.englishlearn.application.dto.request.BadgeRequest;
import com.englishlearn.application.dto.response.ApiResponse;
import com.englishlearn.application.dto.response.BadgeResponse;
import com.englishlearn.application.service.BadgeService;
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
 * Badge Controller - Quản lý huy hiệu
 * 
 * RESTful API Endpoints:
 * ======================
 * GET /api/v1/badges/me - Lấy huy hiệu của user hiện tại
 * GET /api/v1/badges/users/{userId} - Lấy huy hiệu của user theo ID
 * GET /api/v1/badges/{badgeId} - Lấy thông tin huy hiệu
 * POST /api/v1/badges - Tạo huy hiệu mới
 * POST /api/v1/badges/{userId}/award/{badgeName} - Cấp huy hiệu cho user
 * DELETE /api/v1/badges/{badgeId} - Xóa huy hiệu
 * GET /api/v1/badges/users/{userId}/count - Đếm số huy hiệu
 * POST /api/v1/badges/{userId}/check-achievements - Kiểm tra và cấp huy hiệu achievements
 */
@RestController
@RequestMapping("/api/v1/badges")
@RequiredArgsConstructor
@Tag(name = "Badges", description = "API quản lý huy hiệu")
public class BadgeController {

    private final BadgeService badgeService;
    private final UserRepository userRepository;

    /**
     * GET /api/v1/badges/me - Lấy huy hiệu của user hiện tại
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lấy danh sách huy hiệu của mình")
    public ResponseEntity<ApiResponse<List<BadgeResponse>>> getMyBadges(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        List<BadgeResponse> response = badgeService.getUserBadges(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * GET /api/v1/badges/users/{userId} - Lấy huy hiệu của user theo ID
     */
    @GetMapping("/users/{userId}")
    @Operation(summary = "Lấy danh sách huy hiệu của user")
    public ResponseEntity<ApiResponse<List<BadgeResponse>>> getUserBadges(
            @PathVariable Long userId) {
        List<BadgeResponse> response = badgeService.getUserBadges(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * GET /api/v1/badges/{badgeId} - Lấy thông tin huy hiệu
     */
    @GetMapping("/{badgeId}")
    @Operation(summary = "Lấy thông tin huy hiệu theo ID")
    public ResponseEntity<ApiResponse<BadgeResponse>> getBadgeById(
            @PathVariable Long badgeId) {
        BadgeResponse response = badgeService.getBadgeById(badgeId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * POST /api/v1/badges - Tạo huy hiệu mới
     */
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Tạo huy hiệu mới cho mình")
    public ResponseEntity<ApiResponse<BadgeResponse>> createBadge(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody BadgeRequest request) {
        Long userId = getUserId(userDetails);
        BadgeResponse response = badgeService.createBadge(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    /**
     * POST /api/v1/badges/{userId}/award/{badgeName} - Cấp huy hiệu cho user
     */
    @PostMapping("/{userId}/award/{badgeName}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Cấp huy hiệu cho user (Admin/Teacher)")
    public ResponseEntity<ApiResponse<BadgeResponse>> awardBadge(
            @PathVariable Long userId,
            @PathVariable String badgeName,
            @RequestParam String description,
            @RequestParam(required = false) String iconUrl) {
        BadgeResponse response = badgeService.awardBadge(userId, badgeName, description, iconUrl);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success(response));
    }

    /**
     * DELETE /api/v1/badges/{badgeId} - Xóa huy hiệu
     */
    @DeleteMapping("/{badgeId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Xóa huy hiệu của mình")
    public ResponseEntity<ApiResponse<Void>> deleteBadge(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long badgeId) {
        Long userId = getUserId(userDetails);
        badgeService.deleteBadge(userId, badgeId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * GET /api/v1/badges/users/{userId}/count - Đếm số huy hiệu
     */
    @GetMapping("/users/{userId}/count")
    @Operation(summary = "Đếm số huy hiệu của user")
    public ResponseEntity<ApiResponse<Integer>> getBadgeCount(
            @PathVariable Long userId) {
        Integer count = badgeService.getBadgeCount(userId);
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    /**
     * POST /api/v1/badges/{userId}/check-achievements - Kiểm tra và cấp huy hiệu achievements
     */
    @PostMapping("/{userId}/check-achievements")
    @PreAuthorize("hasAnyRole('ADMIN', 'SYSTEM')")
    @Operation(summary = "Kiểm tra và cấp huy hiệu achievements (Admin/System)")
    public ResponseEntity<ApiResponse<List<BadgeResponse>>> checkAndAwardAchievements(
            @PathVariable Long userId) {
        List<BadgeResponse> response = badgeService.checkAndAwardAchievements(userId);
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
