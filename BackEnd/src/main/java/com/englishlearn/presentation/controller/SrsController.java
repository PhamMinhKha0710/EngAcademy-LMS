package com.englishlearn.presentation.controller;

import com.englishlearn.application.dto.request.SrsReviewRequest;
import com.englishlearn.application.dto.response.ApiResponse;
import com.englishlearn.application.dto.response.SrsDueResponse;
import com.englishlearn.application.service.SrsService;
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
@RequestMapping("/api/v1/srs")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
@Tag(name = "SRS", description = "Spaced Repetition System — SM-2 algorithm flashcard review")
public class SrsController {

    private final SrsService srsService;
    private final UserService userService;

    @GetMapping("/due-today")
    @Operation(summary = "Lấy danh sách flashcard cần ôn hôm nay (đã sort theo overdue + EF)")
    public ResponseEntity<ApiResponse<SrsDueResponse>> getDueToday(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = userService.getUserByUsername(userDetails.getUsername()).getId();
        SrsDueResponse response = srsService.getDueToday(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/review")
    @Operation(summary = "Submit review với quality 0–5 — SM-2 cập nhật schedule tự động")
    public ResponseEntity<ApiResponse<SrsDueResponse>> submitReview(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody SrsReviewRequest request) {
        Long userId = userService.getUserByUsername(userDetails.getUsername()).getId();
        SrsDueResponse response = srsService.submitReview(userId, request);
        return ResponseEntity.ok(ApiResponse.success("Đã ghi nhận review", response));
    }
}
