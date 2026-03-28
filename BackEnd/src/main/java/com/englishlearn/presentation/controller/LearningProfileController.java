package com.englishlearn.presentation.controller;

import com.englishlearn.application.dto.request.CompleteOnboardingRequest;
import com.englishlearn.application.dto.request.UpdateLearningProfileRequest;
import com.englishlearn.application.dto.response.ApiResponse;
import com.englishlearn.application.dto.response.LearningProfileResponse;
import com.englishlearn.application.service.LearningProfileService;
import com.englishlearn.application.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/learning-profile")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
@Tag(name = "Learning Profile", description = "APIs cá nhân hoá học tập — onboarding, level theo skill, goals")
public class LearningProfileController {

    private final LearningProfileService profileService;
    private final UserService userService;

    @GetMapping("/me")
    @Operation(summary = "Lấy profile học tập của user hiện tại")
    public ResponseEntity<ApiResponse<LearningProfileResponse>> getMyProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = userService.getUserByUsername(userDetails.getUsername()).getId();
        LearningProfileResponse profile = profileService.getProfile(userId);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PostMapping("/onboarding")
    @Operation(summary = "Hoàn tất onboarding: thiết lập goals + time commitment + topics")
    public ResponseEntity<ApiResponse<LearningProfileResponse>> completeOnboarding(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CompleteOnboardingRequest request) {
        Long userId = userService.getUserByUsername(userDetails.getUsername()).getId();
        LearningProfileResponse profile = profileService.completeOnboarding(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Hoàn tất onboarding", profile));
    }

    @PutMapping("/me")
    @Operation(summary = "Cập nhật profile học tập (goals, daily target, topics)")
    public ResponseEntity<ApiResponse<LearningProfileResponse>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateLearningProfileRequest request) {
        Long userId = userService.getUserByUsername(userDetails.getUsername()).getId();
        LearningProfileResponse profile = profileService.updateProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật profile thành công", profile));
    }

    @GetMapping("/status")
    @Operation(summary = "Kiểm tra đã hoàn thành onboarding chưa")
    public ResponseEntity<ApiResponse<LearningProfileStatusResponse>> getOnboardingStatus(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = userService.getUserByUsername(userDetails.getUsername()).getId();
        LearningProfileResponse profile = profileService.getProfile(userId);
        boolean completed = profile != null && Boolean.TRUE.equals(profile.getOnboardingCompleted());
        return ResponseEntity.ok(ApiResponse.success(new LearningProfileStatusResponse(completed)));
    }

    record LearningProfileStatusResponse(boolean onboardingCompleted) {}
}
