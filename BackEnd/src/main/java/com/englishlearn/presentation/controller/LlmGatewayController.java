package com.englishlearn.presentation.controller;

import com.englishlearn.application.dto.request.WritingFeedbackRequest;
import com.englishlearn.application.dto.response.ApiResponse;
import com.englishlearn.application.service.LlmGatewayService;
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
@RequestMapping("/api/v1/llm")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
@Tag(name = "LLM", description = "LLM-powered writing feedback — Phase 4")
public class LlmGatewayController {

    private final LlmGatewayService llmService;
    private final UserService userService;

    @PostMapping("/writing-feedback")
    @Operation(summary = "Sinh personalized feedback cho bài viết dựa trên CEFR level + weak areas của user")
    public ResponseEntity<ApiResponse<String>> getWritingFeedback(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody WritingFeedbackRequest request) {
        Long userId = userService.getUserByUsername(userDetails.getUsername()).getId();
        String feedback = llmService.generateWritingFeedback(
                userId, request.getContentType(), request.getContentId(), request.getUserText());
        return ResponseEntity.ok(ApiResponse.success("Feedback generated", feedback));
    }
}
