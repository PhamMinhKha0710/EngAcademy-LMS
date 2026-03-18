package com.englishlearn.presentation.controller;

import com.englishlearn.application.dto.request.MistakeNotebookRequest;
import com.englishlearn.application.dto.response.ApiResponse;
import com.englishlearn.application.dto.response.MistakeNotebookDTO;
import com.englishlearn.application.service.MistakeNotebookService;
import com.englishlearn.domain.entity.User;
import com.englishlearn.infrastructure.persistence.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * MistakeNotebookController - API quản lý sổ tay lỗi sai
 */
@RestController
@RequestMapping("/api/v1/mistakes")
@RequiredArgsConstructor
@Tag(name = "Mistake Notebook", description = "API quản lý sổ tay lỗi sai từ vựng")
public class MistakeNotebookController {

    private final MistakeNotebookService mistakeNotebookService;
    private final UserRepository userRepository;

    /**
     * GET /api/v1/mistakes/user/{userId} - Lấy danh sách lỗi sai của user
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER') or hasRole('ADMIN')")
    @Operation(summary = "Lấy danh sách lỗi sai của người dùng")
    public ResponseEntity<ApiResponse<List<MistakeNotebookDTO>>> getMistakesByUser(
            @Parameter(description = "ID của người dùng") @PathVariable Long userId) {
        List<MistakeNotebookDTO> mistakes = mistakeNotebookService.getMistakesByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(mistakes));
    }

    /**
     * GET /api/v1/mistakes/user/{userId}/top - Lấy top 10 lỗi sai nhiều nhất
     */
    @GetMapping("/user/{userId}/top")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER') or hasRole('ADMIN')")
    @Operation(summary = "Lấy top 10 lỗi sai nhiều nhất của người dùng")
    public ResponseEntity<ApiResponse<List<MistakeNotebookDTO>>> getTopMistakes(
            @Parameter(description = "ID của người dùng") @PathVariable Long userId) {
        List<MistakeNotebookDTO> mistakes = mistakeNotebookService.getTopMistakes(userId);
        return ResponseEntity.ok(ApiResponse.success(mistakes));
    }

    /**
     * GET /api/v1/mistakes/user/{userId}/count - Đếm số lỗi sai
     */
    @GetMapping("/user/{userId}/count")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER') or hasRole('ADMIN')")
    @Operation(summary = "Đếm số lỗi sai của người dùng")
    public ResponseEntity<ApiResponse<Long>> countMistakes(
            @Parameter(description = "ID của người dùng") @PathVariable Long userId) {
        long count = mistakeNotebookService.countMistakes(userId);
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    /**
     * POST /api/v1/mistakes - Thêm lỗi sai vào sổ tay
     */
    @PostMapping
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER') or hasRole('ADMIN')")
    @Operation(summary = "Thêm lỗi sai vào sổ tay (tự động tăng count nếu đã tồn tại)")
    public ResponseEntity<ApiResponse<MistakeNotebookDTO>> addMistake(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody @Valid MistakeNotebookRequest request) {
        request.setUserId(getUserId(userDetails));
        MistakeNotebookDTO mistake = mistakeNotebookService.addMistake(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đã thêm vào sổ tay lỗi sai", mistake));
    }

    /**
     * DELETE /api/v1/mistakes/{id} - Xóa lỗi sai khỏi sổ tay
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('STUDENT') or hasRole('TEACHER') or hasRole('ADMIN')")
    @Operation(summary = "Xóa lỗi sai khỏi sổ tay")
    public ResponseEntity<ApiResponse<Void>> removeMistake(
            @Parameter(description = "ID của lỗi sai") @PathVariable Long id) {
        mistakeNotebookService.removeMistake(id);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa khỏi sổ tay lỗi sai"));
    }

    private Long getUserId(UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
