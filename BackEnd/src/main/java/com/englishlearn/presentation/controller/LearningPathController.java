package com.englishlearn.presentation.controller;

import com.englishlearn.application.dto.response.ApiResponse;
import com.englishlearn.application.dto.response.LearningPathResponse;
import com.englishlearn.application.service.LearningPathService;
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
@RequestMapping("/api/v1/learning-path")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
@Tag(name = "Learning Path", description = "Personalized learning path — ML-ready with rule-based fallback")
public class LearningPathController {

    private final LearningPathService learningPathService;
    private final UserService userService;

    @GetMapping("/recommended")
    @Operation(summary = "Lấy lộ trình học cá nhân — gọi ML service hoặc fallback rule-based")
    public ResponseEntity<ApiResponse<LearningPathResponse>> getRecommendedPath(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = userService.getUserByUsername(userDetails.getUsername()).getId();
        LearningPathResponse path = learningPathService.getRecommendedPath(userId);
        return ResponseEntity.ok(ApiResponse.success(path));
    }
}
