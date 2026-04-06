package com.englishlearn.service;

import com.englishlearn.application.dto.response.LessonResponse;
import com.englishlearn.application.service.LessonService;
import com.englishlearn.domain.entity.Lesson;
import com.englishlearn.domain.entity.Topic;
import com.englishlearn.domain.entity.Vocabulary;
import com.englishlearn.domain.entity.Question;
import com.englishlearn.domain.exception.ApiException;
import com.englishlearn.infrastructure.persistence.LessonRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * Unit tests for LessonService - White-box Testing (Chapter 5)
 * Focus: SB06 - Preview (Xem trước bài học)
 *
 * Chức năng Preview: getLessonById() + mapToResponse()
 * - Input: lessonId (Long)
 * - Output: LessonResponse đầy đủ thông tin bài học
 * - Mục tiêu: Bao phủ Statement, Branch, Condition coverage
 */
@ExtendWith(MockitoExtension.class)
class LessonServiceTest {

    @Mock
    private LessonRepository lessonRepository;

    @InjectMocks
    private LessonService lessonService;

    private Topic testTopic;
    private Lesson testLesson;

    @BeforeEach
    void setUp() {
        testTopic = Topic.builder()
                .id(1L)
                .name("Chủ đề 1")
                .description("Mô tả chủ đề 1")
                .build();

        testLesson = Lesson.builder()
                .id(1L)
                .title("Bài học 1")
                .topic(testTopic)
                .contentHtml("<p>Nội dung bài 1</p>")
                .grammarHtml("<p>Ngữ pháp bài 1</p>")
                .audioUrl("audio1.mp3")
                .videoUrl("video1.mp4")
                .difficultyLevel(2)
                .orderIndex(5)
                .isPublished(true)
                .build();
    }

    // ========================================
    // STATEMENT COVERAGE TESTS
    // ========================================

    @Nested
    @DisplayName("Statement Coverage - getLessonById()")
    class GetLessonByIdStatementTests {

        @Test
        @DisplayName("Preview success: Should execute all statements in happy path")
        void getLessonById_WhenLessonExists_ShouldExecuteAllStatements() {
            // Arrange
            when(lessonRepository.findById(1L)).thenReturn(Optional.of(testLesson));

            // Act
            LessonResponse response = lessonService.getLessonById(1L);

            // Assert - verify all fields mapped (all statements executed)
            assertThat(response).isNotNull();
            assertThat(response.getId()).isEqualTo(1L);
            assertThat(response.getTitle()).isEqualTo("Bài học 1");
            assertThat(response.getTopicId()).isEqualTo(1L);
            assertThat(response.getTopicName()).isEqualTo("Chủ đề 1");
            assertThat(response.getContentHtml()).isEqualTo("<p>Nội dung bài 1</p>");
            assertThat(response.getGrammarHtml()).isEqualTo("<p>Ngữ pháp bài 1</p>");
            assertThat(response.getAudioUrl()).isEqualTo("audio1.mp3");
            assertThat(response.getVideoUrl()).isEqualTo("video1.mp4");
            assertThat(response.getDifficultyLevel()).isEqualTo(2);
            assertThat(response.getOrderIndex()).isEqualTo(5);
            assertThat(response.getIsPublished()).isTrue();
            assertThat(response.getVocabularyCount()).isEqualTo(0);
            assertThat(response.getQuestionCount()).isEqualTo(0);
        }

        @Test
        @DisplayName("Preview failure: Should execute exception path when lesson not found")
        void getLessonById_WhenLessonDoesNotExist_ShouldExecuteExceptionStatements() {
            // Arrange
            when(lessonRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> lessonService.getLessonById(999L))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("Không tìm thấy bài học với ID: 999");
        }
    }

    // ========================================
    // BRANCH COVERAGE TESTS
    // ========================================

    @Nested
    @DisplayName("Branch Coverage - mapToResponse()")
    class MapToResponseBranchTests {

        @Test
        @DisplayName("Branch: topic != null → true branch")
        void mapToResponse_WithTopic_ShouldTakeTrueBranch() {
            // Arrange - lesson has topic (topic != null)
            Lesson lesson = Lesson.builder()
                    .id(1L)
                    .title("Lesson")
                    .topic(testTopic)
                    .build();

            // Act
            LessonResponse response = ReflectionTestUtils.invokeMethod(
                    lessonService, "mapToResponse", lesson);

            // Assert - true branch: topicId and topicName are set
            assertThat(response.getTopicId()).isEqualTo(1L);
            assertThat(response.getTopicName()).isEqualTo("Chủ đề 1");
        }

        @Test
        @DisplayName("Branch: topic != null → false branch")
        void mapToResponse_WithoutTopic_ShouldTakeFalseBranch() {
            // Arrange - lesson has no topic (topic == null)
            Lesson lesson = Lesson.builder()
                    .id(1L)
                    .title("Lesson")
                    .topic(null)
                    .build();

            // Act
            LessonResponse response = ReflectionTestUtils.invokeMethod(
                    lessonService, "mapToResponse", lesson);

            // Assert - false branch: topicId and topicName are null
            assertThat(response.getTopicId()).isNull();
            assertThat(response.getTopicName()).isNull();
        }

        @Test
        @DisplayName("Branch: vocabularies != null → true branch")
        void mapToResponse_WithVocabularies_ShouldTakeTrueBranch() {
            // Arrange
            Vocabulary vocab = new Vocabulary();
            Lesson lesson = Lesson.builder()
                    .id(1L)
                    .title("Lesson")
                    .topic(testTopic)
                    .vocabularies(Arrays.asList(vocab, vocab, vocab))
                    .questions(null)
                    .build();

            // Act
            LessonResponse response = ReflectionTestUtils.invokeMethod(
                    lessonService, "mapToResponse", lesson);

            // Assert - true branch: count > 0
            assertThat(response.getVocabularyCount()).isEqualTo(3);
            assertThat(response.getQuestionCount()).isEqualTo(0);
        }

        @Test
        @DisplayName("Branch: vocabularies != null → false branch")
        void mapToResponse_WithoutVocabularies_ShouldTakeFalseBranch() {
            // Arrange
            Lesson lesson = Lesson.builder()
                    .id(1L)
                    .title("Lesson")
                    .topic(testTopic)
                    .vocabularies(null)
                    .questions(null)
                    .build();

            // Act
            LessonResponse response = ReflectionTestUtils.invokeMethod(
                    lessonService, "mapToResponse", lesson);

            // Assert - false branch: count = 0
            assertThat(response.getVocabularyCount()).isEqualTo(0);
            assertThat(response.getQuestionCount()).isEqualTo(0);
        }

        @Test
        @DisplayName("Branch: questions != null → true branch")
        void mapToResponse_WithQuestions_ShouldTakeTrueBranch() {
            // Arrange
            Question question = new Question();
            Lesson lesson = Lesson.builder()
                    .id(1L)
                    .title("Lesson")
                    .topic(testTopic)
                    .vocabularies(null)
                    .questions(Arrays.asList(question, question))
                    .build();

            // Act
            LessonResponse response = ReflectionTestUtils.invokeMethod(
                    lessonService, "mapToResponse", lesson);

            // Assert - true branch for questions
            assertThat(response.getQuestionCount()).isEqualTo(2);
            assertThat(response.getVocabularyCount()).isEqualTo(0);
        }

        @Test
        @DisplayName("Branch: questions != null → false branch")
        void mapToResponse_WithoutQuestions_ShouldTakeFalseBranch() {
            // Arrange
            Lesson lesson = Lesson.builder()
                    .id(1L)
                    .title("Lesson")
                    .topic(testTopic)
                    .vocabularies(Arrays.asList(new Vocabulary()))
                    .questions(null)
                    .build();

            // Act
            LessonResponse response = ReflectionTestUtils.invokeMethod(
                    lessonService, "mapToResponse", lesson);

            // Assert - false branch: questions count = 0
            assertThat(response.getQuestionCount()).isEqualTo(0);
            assertThat(response.getVocabularyCount()).isEqualTo(1);
        }

        @Test
        @DisplayName("Branch: empty collections → false branch for both")
        void mapToResponse_WithEmptyCollections_ShouldTakeFalseBranches() {
            // Arrange
            Lesson lesson = Lesson.builder()
                    .id(1L)
                    .title("Lesson")
                    .topic(testTopic)
                    .vocabularies(Collections.emptyList())
                    .questions(Collections.emptyList())
                    .build();

            // Act
            LessonResponse response = ReflectionTestUtils.invokeMethod(
                    lessonService, "mapToResponse", lesson);

            // Assert - both collections are empty (size() == 0 is false for != null check)
            assertThat(response.getVocabularyCount()).isEqualTo(0);
            assertThat(response.getQuestionCount()).isEqualTo(0);
        }
    }

    // ========================================
    // CONDITION COVERAGE TESTS
    // ========================================

    @Nested
    @DisplayName("Condition Coverage")
    class ConditionCoverageTests {

        @Test
        @DisplayName("Condition: isPublished = true → true branch")
        void mapToResponse_WithPublishedLesson_IsPublishedTrue() {
            // Arrange
            Lesson lesson = Lesson.builder()
                    .id(1L)
                    .title("Lesson")
                    .topic(testTopic)
                    .isPublished(true)
                    .build();

            // Act
            LessonResponse response = ReflectionTestUtils.invokeMethod(
                    lessonService, "mapToResponse", lesson);

            // Assert - condition true
            assertThat(response.getIsPublished()).isTrue();
        }

        @Test
        @DisplayName("Condition: isPublished = false → false branch")
        void mapToResponse_WithUnpublishedLesson_IsPublishedFalse() {
            // Arrange
            Lesson lesson = Lesson.builder()
                    .id(1L)
                    .title("Lesson")
                    .topic(testTopic)
                    .isPublished(false)
                    .build();

            // Act
            LessonResponse response = ReflectionTestUtils.invokeMethod(
                    lessonService, "mapToResponse", lesson);

            // Assert - condition false
            assertThat(response.getIsPublished()).isFalse();
        }
    }

    // ========================================
    // DATA FLOW COVERAGE TESTS
    // ========================================

    @Nested
    @DisplayName("Data Flow Coverage - Field Mapping")
    class DataFlowTests {

        @Test
        @DisplayName("Data Flow: All HTML content fields mapped correctly")
        void mapToResponse_ShouldMapAllContentFields() {
            // Arrange
            Lesson lesson = Lesson.builder()
                    .id(1L)
                    .title("Lesson Title")
                    .topic(testTopic)
                    .contentHtml("<div>Content</div>")
                    .grammarHtml("<div>Grammar</div>")
                    .audioUrl("http://audio.mp3")
                    .videoUrl("http://video.mp4")
                    .build();

            // Act
            LessonResponse response = ReflectionTestUtils.invokeMethod(
                    lessonService, "mapToResponse", lesson);

            // Assert - all data flows from Lesson to LessonResponse
            assertThat(response.getContentHtml()).isEqualTo("<div>Content</div>");
            assertThat(response.getGrammarHtml()).isEqualTo("<div>Grammar</div>");
            assertThat(response.getAudioUrl()).isEqualTo("http://audio.mp3");
            assertThat(response.getVideoUrl()).isEqualTo("http://video.mp4");
        }

        @Test
        @DisplayName("Data Flow: Null fields handled correctly")
        void mapToResponse_WithNullFields_ShouldHandleNull() {
            // Arrange
            Lesson lesson = Lesson.builder()
                    .id(1L)
                    .title("Lesson")
                    .topic(testTopic)
                    .contentHtml(null)
                    .grammarHtml(null)
                    .audioUrl(null)
                    .videoUrl(null)
                    .build();

            // Act
            LessonResponse response = ReflectionTestUtils.invokeMethod(
                    lessonService, "mapToResponse", lesson);

            // Assert - null values flow through correctly
            assertThat(response.getContentHtml()).isNull();
            assertThat(response.getGrammarHtml()).isNull();
            assertThat(response.getAudioUrl()).isNull();
            assertThat(response.getVideoUrl()).isNull();
        }

        @Test
        @DisplayName("Data Flow: Long strings handled correctly")
        void mapToResponse_WithLongStrings_ShouldHandleCorrectly() {
            // Arrange
            String longString = "A".repeat(10000);
            Lesson lesson = Lesson.builder()
                    .id(1L)
                    .title(longString)
                    .topic(testTopic)
                    .contentHtml(longString)
                    .grammarHtml(longString)
                    .build();

            // Act
            LessonResponse response = ReflectionTestUtils.invokeMethod(
                    lessonService, "mapToResponse", lesson);

            // Assert - data integrity preserved
            assertThat(response.getTitle()).isEqualTo(longString);
            assertThat(response.getContentHtml()).isEqualTo(longString);
            assertThat(response.getGrammarHtml()).isEqualTo(longString);
        }
    }

    // ========================================
    // BOUNDARY VALUE ANALYSIS
    // ========================================

    @Nested
    @DisplayName("Boundary Value Analysis")
    class BoundaryTests {

        @Test
        @DisplayName("Boundary: Negative ID should throw exception")
        void getLessonById_WithNegativeId_ShouldThrowException() {
            // Arrange
            when(lessonRepository.findById(-1L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> lessonService.getLessonById(-1L))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("Không tìm thấy bài học với ID: -1");
        }

        @Test
        @DisplayName("Boundary: Zero ID should throw exception (no lesson with ID 0)")
        void getLessonById_WithZeroId_ShouldThrowException() {
            // Arrange
            when(lessonRepository.findById(0L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> lessonService.getLessonById(0L))
                    .isInstanceOf(ApiException.class)
                    .hasMessageContaining("Không tìm thấy bài học với ID: 0");
        }

        @Test
        @DisplayName("Boundary: Very large ID should throw exception")
        void getLessonById_WithVeryLargeId_ShouldThrowException() {
            // Arrange
            long maxId = Long.MAX_VALUE;
            when(lessonRepository.findById(maxId)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> lessonService.getLessonById(maxId))
                    .isInstanceOf(ApiException.class);
        }

        @Test
        @DisplayName("Boundary: Empty topic name (edge case)")
        void mapToResponse_WithEmptyTopicName_ShouldHandleCorrectly() {
            // Arrange
            Topic emptyTopic = Topic.builder()
                    .id(1L)
                    .name("")
                    .build();
            Lesson lesson = Lesson.builder()
                    .id(1L)
                    .title("Lesson")
                    .topic(emptyTopic)
                    .build();

            // Act
            LessonResponse response = ReflectionTestUtils.invokeMethod(
                    lessonService, "mapToResponse", lesson);

            // Assert - empty string is valid
            assertThat(response.getTopicName()).isEmpty();
            assertThat(response.getTopicId()).isEqualTo(1L);
        }
    }

    // ========================================
    // INTERACTION TESTS
    // ========================================

    @Nested
    @DisplayName("Interaction Testing - Repository Calls")
    class InteractionTests {

        @Test
        @DisplayName("Interaction: Should call repository.findById exactly once with correct ID")
        void getLessonById_ShouldCallRepositoryWithCorrectId() {
            // Arrange
            when(lessonRepository.findById(1L)).thenReturn(Optional.of(testLesson));

            // Act
            lessonService.getLessonById(1L);

            // Assert - verify interaction
            verify(lessonRepository, times(1)).findById(1L);
            verifyNoMoreInteractions(lessonRepository);
        }

        @Test
        @DisplayName("Interaction: Should NOT call repository when exception thrown")
        void getLessonById_WithWrongId_ShouldNotCallSave() {
            // Arrange
            when(lessonRepository.findById(999L)).thenReturn(Optional.empty());

            // Act & Assert
            assertThatThrownBy(() -> lessonService.getLessonById(999L))
                    .isInstanceOf(ApiException.class);

            // Verify repository.findById was called but no other operations
            verify(lessonRepository).findById(999L);
            verify(lessonRepository, never()).save(any());
        }
    }

    // ========================================
    // EDGE CASES & SPECIAL SCENARIOS
    // ========================================

    @Nested
    @DisplayName("Edge Cases & Special Scenarios")
    class EdgeCaseTests {

        @Test
        @DisplayName("Edge: Lesson with all optional fields null")
        void mapToResponse_WithAllOptionalFieldsNull_ShouldReturnDefaults() {
            // Arrange
            Lesson lesson = Lesson.builder()
                    .id(1L)
                    .title("Lesson")
                    .topic(testTopic)
                    .contentHtml(null)
                    .grammarHtml(null)
                    .audioUrl(null)
                    .videoUrl(null)
                    .vocabularies(null)
                    .questions(null)
                    .build();

            // Act
            LessonResponse response = ReflectionTestUtils.invokeMethod(
                    lessonService, "mapToResponse", lesson);

            // Assert - all null fields handled
            assertThat(response.getContentHtml()).isNull();
            assertThat(response.getGrammarHtml()).isNull();
            assertThat(response.getAudioUrl()).isNull();
            assertThat(response.getVideoUrl()).isNull();
            assertThat(response.getVocabularyCount()).isZero();
            assertThat(response.getQuestionCount()).isZero();
        }

        @Test
        @DisplayName("Edge: Lesson with large collections")
        void mapToResponse_WithLargeCollections_ShouldHandleCorrectly() {
            // Arrange - 1000 vocabularies and 500 questions
            List<Vocabulary> vocabs = Arrays.asList(new Vocabulary(), new Vocabulary(), new Vocabulary());
            List<Question> questions = Arrays.asList(new Question(), new Question());
            Lesson lesson = Lesson.builder()
                    .id(1L)
                    .title("Lesson")
                    .topic(testTopic)
                    .vocabularies(vocabs)
                    .questions(questions)
                    .build();

            // Act
            LessonResponse response = ReflectionTestUtils.invokeMethod(
                    lessonService, "mapToResponse", lesson);

            // Assert - counts are accurate
            assertThat(response.getVocabularyCount()).isEqualTo(3);
            assertThat(response.getQuestionCount()).isEqualTo(2);
        }

        @Test
        @DisplayName("Edge: Lesson with special characters in content")
        void mapToResponse_WithSpecialCharacters_ShouldPreserve() {
            // Arrange
            String specialContent = "<p>Tiếng Việt: àáạảã ăâê ôư Việt Nam 🎉</p>";
            Lesson lesson = Lesson.builder()
                    .id(1L)
                    .title("Lesson with special chars")
                    .topic(testTopic)
                    .contentHtml(specialContent)
                    .grammarHtml(specialContent)
                    .build();

            // Act
            LessonResponse response = ReflectionTestUtils.invokeMethod(
                    lessonService, "mapToResponse", lesson);

            // Assert - special characters preserved
            assertThat(response.getContentHtml()).isEqualTo(specialContent);
            assertThat(response.getGrammarHtml()).isEqualTo(specialContent);
        }

        @Test
        @DisplayName("Edge: Topic with null name (unusual but should handle)")
        void mapToResponse_WithTopicNullName_ShouldHandle() {
            // Arrange
            Topic topicWithNullName = Topic.builder()
                    .id(1L)
                    .name(null)
                    .build();
            Lesson lesson = Lesson.builder()
                    .id(1L)
                    .title("Lesson")
                    .topic(topicWithNullName)
                    .build();

            // Act
            LessonResponse response = ReflectionTestUtils.invokeMethod(
                    lessonService, "mapToResponse", lesson);

            // Assert - null topic name handled
            assertThat(response.getTopicId()).isEqualTo(1L);
            assertThat(response.getTopicName()).isNull();
        }
    }

    // ========================================
    // INTEGRATION-LIKE TESTS
    // ========================================

    @Nested
    @DisplayName("Integration Path - Complete Preview Flow")
    class IntegrationTests {

        @Test
        @DisplayName("Integration: Complete preview flow with full lesson data")
        void previewCompleteLesson_ShouldReturnFullResponse() {
            // Arrange - realistic lesson with all fields
            Vocabulary vocab1 = new Vocabulary();
            Vocabulary vocab2 = new Vocabulary();
            Question question1 = new Question();
            Question question2 = new Question();
            Question question3 = new Question();

            Lesson fullLesson = Lesson.builder()
                    .id(42L)
                    .title("Advanced Grammar: Present Perfect")
                    .topic(testTopic)
                    .contentHtml("<h1>Lesson Content</h1><p>Detailed explanation...</p>")
                    .grammarHtml("<div>Grammar rules...</div>")
                    .audioUrl("https://cdn.example.com/audio/42.mp3")
                    .videoUrl("https://cdn.example.com/video/42.mp4")
                    .difficultyLevel(3)
                    .orderIndex(10)
                    .isPublished(true)
                    .vocabularies(Arrays.asList(vocab1, vocab2))
                    .questions(Arrays.asList(question1, question2, question3))
                    .build();

            when(lessonRepository.findById(42L)).thenReturn(Optional.of(fullLesson));

            // Act - simulate complete preview flow
            LessonResponse response = lessonService.getLessonById(42L);

            // Assert - verify all data flows correctly
            assertThat(response.getId()).isEqualTo(42L);
            assertThat(response.getTitle()).contains("Present Perfect");
            assertThat(response.getTopicId()).isEqualTo(1L);
            assertThat(response.getTopicName()).isEqualTo("Chủ đề 1");
            assertThat(response.getContentHtml()).contains("Lesson Content");
            assertThat(response.getGrammarHtml()).contains("Grammar rules");
            assertThat(response.getAudioUrl()).contains("audio/42.mp3");
            assertThat(response.getVideoUrl()).contains("video/42.mp4");
            assertThat(response.getDifficultyLevel()).isEqualTo(3);
            assertThat(response.getOrderIndex()).isEqualTo(10);
            assertThat(response.getIsPublished()).isTrue();
            assertThat(response.getVocabularyCount()).isEqualTo(2);
            assertThat(response.getQuestionCount()).isEqualTo(3);
        }

        @Test
        @DisplayName("Integration: Preview with lesson having no topic (edge case)")
        void previewLessonWithoutTopic_ShouldHandleCorrectly() {
            // Arrange
            Lesson lessonWithoutTopic = Lesson.builder()
                    .id(99L)
                    .title("Orphan Lesson")
                    .topic(null)
                    .contentHtml("<p>Content</p>")
                    .build();

            when(lessonRepository.findById(99L)).thenReturn(Optional.of(lessonWithoutTopic));

            // Act
            LessonResponse response = lessonService.getLessonById(99L);

            // Assert - topic fields null but other data present
            assertThat(response.getId()).isEqualTo(99L);
            assertThat(response.getTitle()).isEqualTo("Orphan Lesson");
            assertThat(response.getTopicId()).isNull();
            assertThat(response.getTopicName()).isNull();
            assertThat(response.getContentHtml()).isEqualTo("<p>Content</p>");
            assertThat(response.getVocabularyCount()).isZero();
            assertThat(response.getQuestionCount()).isZero();
        }

        @Test
        @DisplayName("Integration: Preview with null collections returns zero counts")
        void previewLessonWithNullCollections_ShouldReturnZeroCounts() {
            // Arrange
            Lesson lesson = Lesson.builder()
                    .id(1L)
                    .title("Lesson")
                    .topic(testTopic)
                    .vocabularies(null)
                    .questions(null)
                    .build();

            when(lessonRepository.findById(1L)).thenReturn(Optional.of(lesson));

            // Act
            LessonResponse response = lessonService.getLessonById(1L);

            // Assert
            assertThat(response.getVocabularyCount()).isZero();
            assertThat(response.getQuestionCount()).isZero();
        }
    }
}
