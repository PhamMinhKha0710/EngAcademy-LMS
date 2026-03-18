package com.englishlearn.presentation.controller;

import com.englishlearn.application.dto.response.ApiResponse;
import com.englishlearn.application.dto.response.LeaderboardResponse;
import com.englishlearn.application.service.LeaderboardService;
import com.englishlearn.domain.entity.User;
import com.englishlearn.infrastructure.persistence.UserRepository;
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

    /**
     * GET /api/v1/leaderboard/coins - Bảng xếp hạng theo coins
     */
    @GetMapping("/coins")
    @Operation(summary = "Lấy bảng xếp hạng theo coins")
    public ResponseEntity<ApiResponse<Page<LeaderboardResponse>>> getLeaderboardByCoins(
            @RequestParam(required = false) Long schoolId,
            Pageable pageable) {
        Page<LeaderboardResponse> response = leaderboardService.getLeaderboardByCoins(schoolId, pageable);
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
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        LeaderboardResponse response = leaderboardService.getUserRank(user.getId(), schoolId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * GET /api/v1/leaderboard/users/{userId} - Vị trí của user theo ID
     */
    @GetMapping("/users/{userId}")
    @Operation(summary = "Lấy vị trí (rank) của user theo ID")
    public ResponseEntity<ApiResponse<LeaderboardResponse>> getUserRank(
            @PathVariable Long userId,
            @RequestParam(required = false) Long schoolId) {
        LeaderboardResponse response = leaderboardService.getUserRank(userId, schoolId);
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
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<LeaderboardResponse> response = leaderboardService.getLeaderboardAroundUser(user.getId(), schoolId,
                rangeSize);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * GET /api/v1/leaderboard/around-user/{userId} - Bảng xếp hạng xung quanh user
     * theo ID
     */
    @GetMapping("/around-user/{userId}")
    @Operation(summary = "Lấy bảng xếp hạng xung quanh vị trí user theo ID")
    public ResponseEntity<ApiResponse<List<LeaderboardResponse>>> getLeaderboardAroundUser(
            @PathVariable Long userId,
            @RequestParam(required = false) Long schoolId,
            @RequestParam(defaultValue = "10") int rangeSize) {
        List<LeaderboardResponse> response = leaderboardService.getLeaderboardAroundUser(userId, schoolId, rangeSize);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * GET /api/v1/leaderboard/compare - So sánh users
     */
    @GetMapping("/compare")
    @Operation(summary = "So sánh vị trí của nhiều users")
    public ResponseEntity<ApiResponse<List<LeaderboardResponse>>> compareUsers(
            @RequestParam(required = false) Long schoolId,
            @RequestParam List<Long> userIds) {
        List<LeaderboardResponse> response = leaderboardService.compareUsers(userIds, schoolId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

}
