package com.englishlearn.presentation.controller;

import com.englishlearn.application.dto.request.BadgeRequest;
import com.englishlearn.application.dto.response.ApiResponse;
import com.englishlearn.application.dto.response.BadgeDTO;
import com.englishlearn.application.dto.response.BadgeProgressDTO;
import com.englishlearn.application.dto.response.BadgeResponse;
import com.englishlearn.application.dto.response.CheckBadgeResponse;
import com.englishlearn.application.service.BadgeCheckService;
import com.englishlearn.application.service.BadgeDefinitionService;
import com.englishlearn.application.service.BadgeProgressService;
import com.englishlearn.application.service.BadgeService;
import com.englishlearn.domain.entity.User;
import com.englishlearn.domain.enums.BadgeGroup;
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
 * QUY TẮC BẢO MẬT:
 * - STUDENT: chỉ xem dữ liệu của chính mình qua /me endpoints
 * - TEACHER/ADMIN: xem dữ liệu của bất kỳ user nào qua /users/{userId} endpoints
 */
@RestController
@RequestMapping("/api/v1/badges")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
@Tag(name = "Badges", description = "API quản lý huy hiệu")
public class BadgeController {

    private final BadgeService badgeService;
    private final BadgeDefinitionService badgeDefinitionService;
    private final BadgeProgressService badgeProgressService;
    private final BadgeCheckService badgeCheckService;
    private final UserRepository userRepository;

    // ========== STUDENT: /me endpoints ==========

    /**
     * GET /api/v1/badges/me - Lấy huy hiệu của user hiện tại (STUDENT)
     */
    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Lấy danh sách huy hiệu của mình")
    public ResponseEntity<ApiResponse<List<BadgeResponse>>> getMyBadges(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        List<BadgeResponse> response = badgeService.getUserBadges(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * GET /api/v1/badges/me/earned - Badge đã đạt của mình (STUDENT)
     */
    @GetMapping("/me/earned")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Lấy badge đã đạt của chính mình")
    public ResponseEntity<ApiResponse<List<BadgeDTO>>> getMyEarnedBadges(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        List<BadgeDTO> response = badgeDefinitionService.getUserEarnedBadges(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * GET /api/v1/badges/me/progress - Tiến trình badge chưa đạt của mình (STUDENT)
     */
    @GetMapping("/me/progress")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Lấy tiến trình badge chưa đạt của chính mình")
    public ResponseEntity<ApiResponse<List<BadgeProgressDTO>>> getMyBadgeProgress(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        List<BadgeProgressDTO> response = badgeProgressService.getAllProgress(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ========== TEACHER/ADMIN: /users/{userId} endpoints ==========

    /**
     * GET /api/v1/badges/users/{userId} - Lấy huy hiệu của user (TEACHER/ADMIN)
     */
    @GetMapping("/users/{userId}")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    @Operation(summary = "Lấy danh sách huy hiệu của người dùng (Teacher/Admin)")
    public ResponseEntity<ApiResponse<List<BadgeResponse>>> getUserBadges(
            @PathVariable Long userId) {
        List<BadgeResponse> response = badgeService.getUserBadges(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * GET /api/v1/badges/users/{userId}/count - Đếm số huy hiệu (TEACHER/ADMIN)
     */
    @GetMapping("/users/{userId}/count")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    @Operation(summary = "Đếm số huy hiệu của người dùng (Teacher/Admin)")
    public ResponseEntity<ApiResponse<Integer>> getBadgeCount(
            @PathVariable Long userId) {
        Integer count = badgeService.getBadgeCount(userId);
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    /**
     * GET /api/v1/badges/users/{userId}/earned - Badge đã đạt của user (TEACHER/ADMIN)
     */
    @GetMapping("/users/{userId}/earned")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    @Operation(summary = "Lấy badge đã đạt của người dùng (Teacher/Admin)")
    public ResponseEntity<ApiResponse<List<BadgeDTO>>> getUserEarnedBadges(
            @PathVariable Long userId) {
        List<BadgeDTO> response = badgeDefinitionService.getUserEarnedBadges(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * GET /api/v1/badges/users/{userId}/progress - Tiến trình badge chưa đạt (TEACHER/ADMIN)
     */
    @GetMapping("/users/{userId}/progress")
    @PreAuthorize("hasRole('TEACHER') or hasRole('ADMIN')")
    @Operation(summary = "Lấy tiến trình badge chưa đạt của người dùng (Teacher/Admin)")
    public ResponseEntity<ApiResponse<List<BadgeProgressDTO>>> getUserBadgeProgress(
            @PathVariable Long userId) {
        List<BadgeProgressDTO> response = badgeProgressService.getAllProgress(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ========== Badge definitions - PUBLIC ==========

    /**
     * GET /api/v1/badges/definitions - Toàn bộ badge definitions, filter theo group
     * (PUBLIC - không cần auth)
     */
    @GetMapping("/definitions")
    @PreAuthorize("permitAll()")
    @Operation(summary = "Lấy danh sách badge definitions (có filter group) - PUBLIC")
    public ResponseEntity<ApiResponse<List<BadgeDTO>>> getBadgeDefinitions(
            @RequestParam(required = false) BadgeGroup group) {
        List<BadgeDTO> response = badgeDefinitionService.getAllBadges(group);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ========== Badge CRUD ==========

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
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Tạo huy hiệu mới (Admin)")
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
    @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL', 'TEACHER')")
    @Operation(summary = "Cấp huy hiệu cho user (Admin/School/Teacher)")
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
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Xóa huy hiệu (Admin)")
    public ResponseEntity<ApiResponse<Void>> deleteBadge(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long badgeId) {
        Long userId = getUserId(userDetails);
        badgeService.deleteBadge(userId, badgeId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    /**
     * POST /api/v1/badges/{userId}/check-achievements - Kiểm tra và cấp huy hiệu
     */
    @PostMapping("/{userId}/check-achievements")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL', 'SYSTEM')")
    @Operation(summary = "Kiểm tra và cấp huy hiệu achievements (Admin/School/System)")
    public ResponseEntity<ApiResponse<List<BadgeResponse>>> checkAndAwardAchievements(
            @PathVariable Long userId) {
        List<BadgeResponse> response = badgeService.checkAndAwardAchievements(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * POST /api/v1/badges/me/check - Trigger check & trao badge cho chính mình (STUDENT)
     */
    @PostMapping("/me/check")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Kiểm tra và trao badge cho chính mình, trả về badge mới đạt được")
    public ResponseEntity<ApiResponse<CheckBadgeResponse>> checkAndAwardBadgesForMe(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        CheckBadgeResponse response = badgeCheckService.checkAndAward(userId);
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
