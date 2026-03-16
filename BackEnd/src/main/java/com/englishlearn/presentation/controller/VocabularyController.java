package com.englishlearn.presentation.controller;

import com.englishlearn.application.dto.request.VocabularyRequest;
import com.englishlearn.application.dto.response.ApiResponse;
import com.englishlearn.application.dto.response.VocabularyResponse;
import com.englishlearn.application.service.VocabularyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Tạo từ vựng mới")
    public ResponseEntity<ApiResponse<VocabularyResponse>> createVocabulary(
            @RequestBody @Valid VocabularyRequest request) {
        VocabularyResponse vocab = vocabularyService.createVocabulary(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo từ vựng thành công", vocab));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Cập nhật từ vựng")
    public ResponseEntity<ApiResponse<VocabularyResponse>> updateVocabulary(
            @PathVariable Long id,
            @RequestBody @Valid VocabularyRequest request) {
        VocabularyResponse vocab = vocabularyService.updateVocabulary(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật từ vựng thành công", vocab));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Xóa từ vựng")
    public ResponseEntity<ApiResponse<Void>> deleteVocabulary(@PathVariable Long id) {
        vocabularyService.deleteVocabulary(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa từ vựng thành công"));
    }

    @GetMapping("/flashcards/random")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER')")
    @Operation(summary = "Get random flashcards")
    public ResponseEntity<ApiResponse<List<VocabularyResponse>>> getRandomFlashcards(
            @RequestParam(defaultValue = "10") int count) {
        List<VocabularyResponse> vocabs = vocabularyService.getRandomFlashcards(count);
        return ResponseEntity.ok(ApiResponse.success("Lấy flashcard ngẫu nhiên thành công", vocabs));
    }

    @PostMapping("/review")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER')")
    @Operation(summary = "Review a vocabulary word (correct/wrong)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> reviewWord(
            @RequestBody Map<String, Object> body) {
        Long vocabularyId = ((Number) body.get("vocabularyId")).longValue();
        Long userId = ((Number) body.get("userId")).longValue();
        boolean correct = "correct".equals(body.get("result"));
        Map<String, Object> result = vocabularyService.reviewWord(userId, vocabularyId, correct);
        return ResponseEntity.ok(ApiResponse.success("Đã cập nhật kết quả học", result));
    }

    @GetMapping("/learned")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    @Operation(summary = "Get all mastered vocabulary for user")
    public ResponseEntity<ApiResponse<List<VocabularyResponse>>> getLearnedWords(@RequestParam Long userId) {
        List<VocabularyResponse> words = vocabularyService.getLearnedWords(userId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách từ đã học thành công", words));
    }

    @GetMapping("/learned/count")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    @Operation(summary = "Get mastered vocabulary count for user")
    public ResponseEntity<ApiResponse<Long>> getLearnedCount(@RequestParam Long userId) {
        Long count = vocabularyService.getLearnedCount(userId);
        return ResponseEntity.ok(ApiResponse.success("Lấy số từ đã học thành công", count));
    }
}
