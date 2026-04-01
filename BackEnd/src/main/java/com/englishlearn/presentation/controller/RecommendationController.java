package com.englishlearn.presentation.controller;

import com.englishlearn.application.dto.response.ApiResponse;
import com.englishlearn.application.dto.response.RecommendationResponse;
import com.englishlearn.application.service.RecommendationService;
import com.englishlearn.application.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/recommendations")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
@Tag(name = "Recommendations", description = "Rule-based daily recommendations + nightly weakness analysis")
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final UserService userService;

    @GetMapping("/daily")
    @Operation(summary = "Lấy bài học được cá nhân hoá cho hôm nay — ưu tiên weak skills → topic → level")
    public ResponseEntity<ApiResponse<RecommendationResponse>> getDailyRecommendations(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = userService.getUserByUsername(userDetails.getUsername()).getId();
        RecommendationResponse rec = recommendationService.getDailyRecommendations(userId);
        return ResponseEntity.ok(ApiResponse.success(rec));
    }
}
