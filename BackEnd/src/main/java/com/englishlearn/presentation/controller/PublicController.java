package com.englishlearn.presentation.controller;

import com.englishlearn.application.dto.response.ApiResponse;
import com.englishlearn.infrastructure.persistence.LessonRepository;
import com.englishlearn.infrastructure.persistence.UserRepository;
import com.englishlearn.infrastructure.persistence.VocabularyRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Public API - không yêu cầu xác thực.
 * Dùng cho landing page, thống kê công khai.
 */
@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
@Tag(name = "Public", description = "APIs công khai (không cần đăng nhập)")
public class PublicController {

    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;
    private final VocabularyRepository vocabularyRepository;

    @GetMapping("/stats")
    @Operation(summary = "Thống kê tổng quan (học sinh, bài học, từ vựng)")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getPublicStats() {
        long studentCount = userRepository.countStudents();
        long lessonCount = lessonRepository.count();
        long vocabularyCount = vocabularyRepository.count();

        Map<String, Long> stats = Map.of(
                "studentCount", studentCount,
                "lessonCount", lessonCount,
                "vocabularyCount", vocabularyCount
        );
        return ResponseEntity.ok(ApiResponse.success("Lấy thống kê thành công", stats));
    }
}
