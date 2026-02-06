package com.englishlearn.controller;

import com.englishlearn.dto.response.ApiResponse;
import com.englishlearn.dto.response.LessonResponse;
import com.englishlearn.service.LessonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Topic Controller - Quản lý chủ đề và bài học theo chủ đề
 * 
 * API Naming Convention:
 * - GET /api/v1/topics/{topicId}/lessons → Lấy danh sách bài học theo chủ đề
 */
@RestController
@RequestMapping("/api/v1/topics")
@RequiredArgsConstructor
public class TopicController {

    private final LessonService lessonService;

    /**
     * Lấy danh sách bài học theo chủ đề (nested resource)
     * GET /api/v1/topics/{topicId}/lessons
     */
    @GetMapping("/{topicId}/lessons")
    public ResponseEntity<ApiResponse<List<LessonResponse>>> getLessonsByTopic(
            @PathVariable Long topicId) {
        List<LessonResponse> lessons = lessonService.getLessonsByTopic(topicId);
        return ResponseEntity.ok(ApiResponse.success(lessons));
    }
}
