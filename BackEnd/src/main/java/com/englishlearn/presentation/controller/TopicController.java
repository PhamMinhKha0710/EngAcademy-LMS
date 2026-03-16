package com.englishlearn.presentation.controller;

import com.englishlearn.application.dto.response.ApiResponse;
import com.englishlearn.application.dto.response.LessonResponse;
import com.englishlearn.application.dto.response.VocabularyResponse;
import com.englishlearn.application.service.LessonService;
import com.englishlearn.application.service.VocabularyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
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

    @GetMapping("/{topicId}/lessons")
    public ResponseEntity<ApiResponse<List<LessonResponse>>> getLessonsByTopic(
            @PathVariable Long topicId) {
        List<LessonResponse> lessons = lessonService.getLessonsByTopic(topicId);
        return ResponseEntity.ok(ApiResponse.success(lessons));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    @Operation(summary = "Get all topics with user learning progress")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTopicsWithProgress(
            @RequestParam Long userId) {
        List<Map<String, Object>> topics = vocabularyService.getTopicsWithProgress(userId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách chủ đề thành công", topics));
    }

    @GetMapping("/{topicId}/learn")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER')")
    @Operation(summary = "Get max 20 unmastered words for a topic")
    public ResponseEntity<ApiResponse<List<VocabularyResponse>>> getWordsToLearn(
            @PathVariable Long topicId,
            @RequestParam Long userId) {
        List<VocabularyResponse> words = vocabularyService.getWordsToLearn(userId, topicId);
        return ResponseEntity.ok(ApiResponse.success("Lấy từ vựng cần học thành công", words));
    }
}
