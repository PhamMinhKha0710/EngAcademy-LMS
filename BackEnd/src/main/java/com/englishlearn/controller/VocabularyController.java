package com.englishlearn.controller;

import com.englishlearn.dto.response.ApiResponse;
import com.englishlearn.dto.response.VocabularyResponse;
import com.englishlearn.service.VocabularyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/vocabulary")
@RequiredArgsConstructor
@Tag(name = "Vocabulary", description = "APIs for vocabulary and flashcards")
public class VocabularyController {

    private final VocabularyService vocabularyService;

    @GetMapping("/lesson/{lessonId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    @Operation(summary = "Get vocabulary by lesson")
    public ResponseEntity<ApiResponse<List<VocabularyResponse>>> getVocabularyByLesson(
            @PathVariable Long lessonId) {
        List<VocabularyResponse> vocabs = vocabularyService.getVocabularyByLesson(lessonId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách từ vựng thành công", vocabs));
    }

    @GetMapping("/lesson/{lessonId}/paged")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    @Operation(summary = "Get vocabulary by lesson with pagination")
    public ResponseEntity<ApiResponse<Page<VocabularyResponse>>> getVocabularyByLessonPaged(
            @PathVariable Long lessonId, Pageable pageable) {
        Page<VocabularyResponse> vocabs = vocabularyService.getVocabularyByLessonPaged(lessonId, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách từ vựng thành công", vocabs));
    }

    @GetMapping("/topic/{topicId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    @Operation(summary = "Get vocabulary by topic")
    public ResponseEntity<ApiResponse<List<VocabularyResponse>>> getVocabularyByTopic(
            @PathVariable Long topicId) {
        List<VocabularyResponse> vocabs = vocabularyService.getVocabularyByTopic(topicId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách từ vựng thành công", vocabs));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    @Operation(summary = "Get vocabulary by ID")
    public ResponseEntity<ApiResponse<VocabularyResponse>> getVocabularyById(@PathVariable Long id) {
        VocabularyResponse vocab = vocabularyService.getVocabularyById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin từ vựng thành công", vocab));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    @Operation(summary = "Search vocabulary")
    public ResponseEntity<ApiResponse<List<VocabularyResponse>>> searchVocabulary(
            @RequestParam String keyword) {
        List<VocabularyResponse> vocabs = vocabularyService.searchVocabulary(keyword);
        return ResponseEntity.ok(ApiResponse.success("Tìm kiếm từ vựng thành công", vocabs));
    }

    @GetMapping("/flashcards/{lessonId}")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER')")
    @Operation(summary = "Get flashcards for lesson")
    public ResponseEntity<ApiResponse<List<VocabularyResponse>>> getFlashcards(
            @PathVariable Long lessonId,
            @RequestParam(defaultValue = "10") int count) {
        List<VocabularyResponse> vocabs = vocabularyService.getFlashcards(lessonId, count);
        return ResponseEntity.ok(ApiResponse.success("Lấy flashcard thành công", vocabs));
    }

    @GetMapping("/flashcards/random")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER')")
    @Operation(summary = "Get random flashcards")
    public ResponseEntity<ApiResponse<List<VocabularyResponse>>> getRandomFlashcards(
            @RequestParam(defaultValue = "10") int count) {
        List<VocabularyResponse> vocabs = vocabularyService.getRandomFlashcards(count);
        return ResponseEntity.ok(ApiResponse.success("Lấy flashcard ngẫu nhiên thành công", vocabs));
    }
}
