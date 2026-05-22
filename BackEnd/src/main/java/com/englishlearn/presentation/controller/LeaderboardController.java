package com.englishlearn.presentation.controller;

import com.englishlearn.application.dto.response.ApiResponse;
import com.englishlearn.application.dto.response.LeaderboardResponse;
import com.englishlearn.application.dto.response.UserResponse;
import com.englishlearn.application.service.LeaderboardService;
import com.englishlearn.application.service.UserService;
import com.englishlearn.domain.entity.User;
import com.englishlearn.infrastructure.persistence.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Leaderboard Controller - Bảng xếp hạng
 * 
 * RESTful API Endpoints:
 * ======================
 * GET /api/v1/leaderboard/coins - Bảng xếp hạng theo coins
 * GET /api/v1/leaderboard/streak - Bảng xếp hạng theo streak
 * GET /api/v1/leaderboard/global - Bảng xếp hạng tổng hợp
 * GET /api/v1/leaderboard/top - Top 10/100 users
 * GET /api/v1/leaderboard/me - Vị trí của user hiện tại
 * GET /api/v1/leaderboard/around-me - Bảng xếp hạng xung quanh user
 * GET /api/v1/leaderboard/compare - So sánh users
 */
@RestController
@RequestMapping("/api/v1/leaderboard")
@RequiredArgsConstructor
@Tag(name = "Leaderboard", description = "API bảng xếp hạng")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;
    private final UserRepository userRepository;
    private final UserService userService;

    /**
     * GET /api/v1/leaderboard/coins - Bảng xếp hạng theo coins
     */
    @GetMapping("/coins")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lấy bảng xếp hạng theo coins")
    public ResponseEntity<ApiResponse<Page<LeaderboardResponse>>> getLeaderboardByCoins(
            @RequestParam(required = false) Long schoolId,
            Pageable pageable,
            @AuthenticationPrincipal UserDetails userDetails) {
        UserResponse caller = userService.getUserByUsername(userDetails.getUsername());
        Long scopedSchoolId = resolveSchoolId(caller, schoolId);
        Page<LeaderboardResponse> response = leaderboardService.getLeaderboardByCoins(scopedSchoolId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * GET /api/v1/leaderboard/streak - Bảng xếp hạng theo streak
     */
    @GetMapping("/streak")
    @Operation(summary = "Lấy bảng xếp hạng theo streak")
    public ResponseEntity<ApiResponse<List<LeaderboardResponse>>> getLeaderboardByStreak(
            @RequestParam(required = false) Long schoolId,
            @RequestParam(defaultValue = "100") int limit) {
        List<LeaderboardResponse> response = leaderboardService.getLeaderboardByStreak(schoolId, limit);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * GET /api/v1/leaderboard/global - Bảng xếp hạng tổng hợp
     */
    @GetMapping("/global")
    @Operation(summary = "Lấy bảng xếp hạng tổng hợp (coins + streak)")
    public ResponseEntity<ApiResponse<List<LeaderboardResponse>>> getGlobalLeaderboard(
            @RequestParam(required = false) Long schoolId,
            @RequestParam(defaultValue = "100") int limit) {
        List<LeaderboardResponse> response = leaderboardService.getGlobalLeaderboard(schoolId, limit);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * GET /api/v1/leaderboard/top - Top users
     */
    @GetMapping("/top")
    @Operation(summary = "Lấy top users theo coins")
    public ResponseEntity<ApiResponse<List<LeaderboardResponse>>> getTopUsers(
            @RequestParam(required = false) Long schoolId,
            @RequestParam(defaultValue = "10") int limit) {
        List<LeaderboardResponse> response = leaderboardService.getTopUsersByCoins(schoolId, limit);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * GET /api/v1/leaderboard/me - Vị trí của user hiện tại
     */
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lấy vị trí (rank) của user hiện tại")
    public ResponseEntity<ApiResponse<LeaderboardResponse>> getMyRank(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) Long schoolId) {
        UserResponse caller = userService.getUserByUsername(userDetails.getUsername());
        Long scopedSchoolId = resolveSchoolId(caller, schoolId);
        LeaderboardResponse response = leaderboardService.getUserRank(caller.getId(), scopedSchoolId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * GET /api/v1/leaderboard/users/{userId} - Vị trí của user theo ID
     */
    @GetMapping("/users/{userId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lấy vị trí (rank) của user theo ID")
    public ResponseEntity<ApiResponse<LeaderboardResponse>> getUserRank(
            @PathVariable Long userId,
            @RequestParam(required = false) Long schoolId,
            @AuthenticationPrincipal UserDetails userDetails) {
        UserResponse caller = userService.getUserByUsername(userDetails.getUsername());
        assertCanViewLeaderboardUser(caller, userId);
        Long scopedSchoolId = resolveSchoolId(caller, schoolId);
        LeaderboardResponse response = leaderboardService.getUserRank(userId, scopedSchoolId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * GET /api/v1/leaderboard/around-me - Bảng xếp hạng xung quanh user
     */
    @GetMapping("/around-me")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lấy bảng xếp hạng xung quanh vị trí user hiện tại")
    public ResponseEntity<ApiResponse<List<LeaderboardResponse>>> getLeaderboardAroundMe(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) Long schoolId,
            @RequestParam(defaultValue = "10") int rangeSize) {
        UserResponse caller = userService.getUserByUsername(userDetails.getUsername());
        Long scopedSchoolId = resolveSchoolId(caller, schoolId);
        List<LeaderboardResponse> response = leaderboardService.getLeaderboardAroundUser(caller.getId(), scopedSchoolId,
                rangeSize);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * GET /api/v1/leaderboard/around-user/{userId} - Bảng xếp hạng xung quanh user
     * theo ID
     */
    @GetMapping("/around-user/{userId}")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Lấy bảng xếp hạng xung quanh vị trí user theo ID")
    public ResponseEntity<ApiResponse<List<LeaderboardResponse>>> getLeaderboardAroundUser(
            @PathVariable Long userId,
            @RequestParam(required = false) Long schoolId,
            @RequestParam(defaultValue = "10") int rangeSize,
            @AuthenticationPrincipal UserDetails userDetails) {
        UserResponse caller = userService.getUserByUsername(userDetails.getUsername());
        assertCanViewLeaderboardUser(caller, userId);
        Long scopedSchoolId = resolveSchoolId(caller, schoolId);
        List<LeaderboardResponse> response = leaderboardService.getLeaderboardAroundUser(userId, scopedSchoolId, rangeSize);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * GET /api/v1/leaderboard/compare - So sánh users
     */
    @GetMapping("/compare")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "So sánh vị trí của nhiều users")
    public ResponseEntity<ApiResponse<List<LeaderboardResponse>>> compareUsers(
            @RequestParam(required = false) Long schoolId,
            @RequestParam List<Long> userIds,
            @AuthenticationPrincipal UserDetails userDetails) {
        UserResponse caller = userService.getUserByUsername(userDetails.getUsername());
        for (Long userId : userIds) {
            assertCanViewLeaderboardUser(caller, userId);
        }
        Long scopedSchoolId = resolveSchoolId(caller, schoolId);
        List<LeaderboardResponse> response = leaderboardService.compareUsers(userIds, scopedSchoolId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    private boolean isAdmin(UserResponse user) {
        return user.getRoles() != null && user.getRoles().contains("ROLE_ADMIN");
    }

    /** BUG-BLOCKER-002: Non-admin must use their school; null schoolId means caller's school, not global. */
    private Long resolveSchoolId(UserResponse caller, Long requestedSchoolId) {
        if (isAdmin(caller)) {
            return requestedSchoolId;
        }
        if (caller.getSchoolId() == null) {
            throw new AccessDeniedException("Tài khoản không thuộc trường, không thể xem bảng xếp hạng");
        }
        if (requestedSchoolId != null && !requestedSchoolId.equals(caller.getSchoolId())) {
            throw new AccessDeniedException("Không thể xem bảng xếp hạng của trường khác");
        }
        return caller.getSchoolId();
    }

    private void assertCanViewLeaderboardUser(UserResponse caller, Long targetUserId) {
        if (isAdmin(caller)) {
            return;
        }
        UserResponse target = userService.getUserById(targetUserId);
        if (caller.getSchoolId() == null || target.getSchoolId() == null
                || !caller.getSchoolId().equals(target.getSchoolId())) {
            throw new AccessDeniedException("Không thể xem bảng xếp hạng của người dùng thuộc trường khác");
        }
    }

}
