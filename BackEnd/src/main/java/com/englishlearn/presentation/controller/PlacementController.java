package com.englishlearn.presentation.controller;

import com.englishlearn.application.dto.request.PlacementAnswerRequest;
import com.englishlearn.application.dto.response.ApiResponse;
import com.englishlearn.application.dto.response.PlacementAnswerAccepted;
import com.englishlearn.application.dto.response.PlacementQuestionResponse;
import com.englishlearn.application.dto.response.PlacementResultResponse;
import com.englishlearn.application.service.PlacementService;
import com.englishlearn.application.service.UserService;
import com.englishlearn.domain.exception.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/placement")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
@Validated
@Tag(name = "Placement", description = "Adaptive placement test — xác định CEFR level theo 4 kỹ năng")
public class PlacementController {

    private final PlacementService placementService;
    private final UserService userService;

    @PostMapping("/session")
    @Operation(summary = "Tạo placement session mới, trả về sessionId")
    public ResponseEntity<ApiResponse<PlacementSessionResponse>> createSession(
            @AuthenticationPrincipal UserDetails userDetails) {
        String sessionId = placementService.createSession();
        return ResponseEntity.ok(ApiResponse.success("Tạo phiên placement thành công",
                new PlacementSessionResponse(sessionId)));
    }

    @GetMapping("/question")
    @Operation(summary = "Lấy câu hỏi tiếp theo (adaptive)")
    public ResponseEntity<ApiResponse<PlacementQuestionResponse>> getNextQuestion(
            @RequestParam @NotBlank String sessionId) {
        PlacementQuestionResponse question = placementService.getNextQuestion(sessionId);
        if (question == null) {
            return ResponseEntity.ok(ApiResponse.success("Bài test hoàn tất", null));
        }
        return ResponseEntity.ok(ApiResponse.success(question));
    }

    @PostMapping("/answer")
    @Operation(summary = "Submit đáp án — trả kết quả cuối nếu hoàn thành")
    public ResponseEntity<ApiResponse<PlacementAnswerAccepted>> submitAnswer(
            @RequestParam @NotBlank String sessionId,
            @Valid @RequestBody PlacementAnswerRequest answer,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = userService.getUserByUsername(userDetails.getUsername()).getId();

        PlacementAnswerAccepted accepted = placementService.submitAnswer(sessionId, answer, userId);

        if (!accepted.isNextQuestionAvailable() && accepted.getResult() != null) {
            return ResponseEntity.ok(ApiResponse.success("Hoàn tất bài test placement", accepted));
        }
        return ResponseEntity.ok(ApiResponse.success("Đáp án đã ghi nhận, tiếp tục...", accepted));
    }

    @GetMapping("/result")
    @Operation(summary = "Lấy kết quả placement (sau khi hoàn thành)")
    public ResponseEntity<ApiResponse<PlacementResultResponse>> getResult(
            @RequestParam @NotBlank String sessionId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = userService.getUserByUsername(userDetails.getUsername()).getId();

        PlacementResultResponse result = placementService.getResult(sessionId, userId);
        if (result == null) {
            return ResponseEntity.ok(ApiResponse.<PlacementResultResponse>builder()
                    .success(true)
                    .message("Phiên placement chưa hoàn tất")
                    .data(null)
                    .build());
        }
        return ResponseEntity.ok(ApiResponse.success(result));
    }

    record PlacementSessionResponse(String sessionId) {}
}
