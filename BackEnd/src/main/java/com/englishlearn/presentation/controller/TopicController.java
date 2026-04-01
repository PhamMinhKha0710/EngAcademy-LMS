package com.englishlearn.presentation.controller;

import com.englishlearn.application.dto.response.ApiResponse;
import com.englishlearn.application.dto.response.LessonResponse;
import com.englishlearn.application.dto.response.VocabularyResponse;
import com.englishlearn.application.service.LessonService;
import com.englishlearn.application.service.VocabularyService;
import com.englishlearn.domain.entity.User;
import com.englishlearn.infrastructure.persistence.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/topics")
@RequiredArgsConstructor
@Tag(name = "Topics", description = "APIs for topic-based vocabulary learning")
public class TopicController {

    private final LessonService lessonService;
    private final VocabularyService vocabularyService;
    private final UserRepository userRepository;

    @GetMapping("/{topicId}/lessons")
    @Operation(summary = "Lấy danh sách bài học theo chủ đề")
    public ResponseEntity<ApiResponse<List<LessonResponse>>> getLessonsByTopic(
            @PathVariable Long topicId) {
        List<LessonResponse> lessons = lessonService.getLessonsByTopic(topicId);
        return ResponseEntity.ok(ApiResponse.success(lessons));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    @Operation(summary = "Lấy tất cả chủ đề với tiến độ học tập của user hiện tại")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTopicsWithProgress(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        List<Map<String, Object>> topics = vocabularyService.getTopicsWithProgress(userId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách chủ đề thành công", topics));
    }

    @GetMapping("/{topicId}/learn")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER')")
    @Operation(summary = "Lấy tối đa 20 từ chưa thành thạo cho một chủ đề của user hiện tại")
    public ResponseEntity<ApiResponse<List<VocabularyResponse>>> getWordsToLearn(
            @PathVariable Long topicId,
            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserId(userDetails);
        List<VocabularyResponse> words = vocabularyService.getWordsToLearn(userId, topicId);
        return ResponseEntity.ok(ApiResponse.success("Lấy từ vựng cần học thành công", words));
    }

    private Long getUserId(UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
