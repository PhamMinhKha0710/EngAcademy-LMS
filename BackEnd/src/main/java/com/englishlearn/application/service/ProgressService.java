package com.englishlearn.application.service;

import com.englishlearn.application.dto.response.ProgressResponse;
import com.englishlearn.domain.entity.Lesson;
import com.englishlearn.domain.entity.Progress;
import com.englishlearn.domain.entity.User;
import com.englishlearn.domain.entity.UserVocabulary;
import com.englishlearn.domain.entity.Vocabulary;
import com.englishlearn.domain.enums.CefrLevel;
import com.englishlearn.domain.exception.ResourceNotFoundException;
import com.englishlearn.domain.entity.VocabStatus;
import com.englishlearn.infrastructure.persistence.LessonRepository;
import com.englishlearn.infrastructure.persistence.ProgressRepository;
import com.englishlearn.infrastructure.persistence.UserRepository;
import com.englishlearn.infrastructure.persistence.UserVocabularyRepository;
import com.englishlearn.infrastructure.persistence.VocabularyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProgressService {

    private final ProgressRepository progressRepository;
    private final UserRepository userRepository;
    private final LessonRepository lessonRepository;
    private final UserVocabularyRepository userVocabularyRepository;
    private final VocabularyRepository vocabularyRepository;
    private final DailyQuestService dailyQuestService;
    private final @Lazy LearningPathService learningPathService;

    @Transactional(readOnly = true)
    public List<ProgressResponse> getProgressByUser(Long userId) {
        return progressRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProgressResponse> getCompletedLessons(Long userId) {
        return progressRepository.findCompletedByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProgressResponse> getInProgressLessons(Long userId) {
        return progressRepository.findInProgressByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProgressResponse getProgressForLesson(Long userId, Long lessonId) {
        return progressRepository.findByUserIdAndLessonId(userId, lessonId)
                .map(this::mapToResponse)
                .orElseGet(() -> ProgressResponse.builder()
                        .userId(userId)
                        .lessonId(lessonId)
                        .completionPercentage(0)
                        .isCompleted(false)
                        .build());
    }

    @Transactional
    public ProgressResponse updateProgress(Long userId, Long lessonId, Integer percentage) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", userId));

        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Bài học", "id", lessonId));

        Progress progress = progressRepository.findByUserIdAndLessonId(userId, lessonId)
                .orElseGet(() -> Progress.builder()
                        .user(user)
                        .lesson(lesson)
                        .completionPercentage(0)
                        .isCompleted(false)
                        .build());

        boolean wasCompleted = Boolean.TRUE.equals(progress.getIsCompleted());
        boolean questTaskCompleted = false;
        progress.setCompletionPercentage(percentage);
        if (percentage >= 100) {
            progress.setIsCompleted(true);
            log.info("User {} completed lesson: {}", user.getFullName(), lesson.getTitle());
            if (!wasCompleted) {
                try {
                    questTaskCompleted = dailyQuestService.incrementProgressForTaskType(userId, "COMPLETE_LESSON", 1);
                } catch (Exception e) {
                    log.debug("Could not update quest for COMPLETE_LESSON: {}", e.getMessage());
                }
            }
        }

        Progress savedProgress = progressRepository.save(progress);
        ProgressResponse response = mapToResponse(savedProgress);
        if (questTaskCompleted) {
            response.setQuestTaskCompleted(true);
        }
        return response;
    }

    @Transactional
    public ProgressResponse completeLesson(Long userId, Long lessonId) {
        return updateProgress(userId, lessonId, 100);
    }

    /**
     * After placement test: mark published lessons whose mapped CEFR band is strictly below
     * the user's overall level as completed, and set vocabulary in those lessons to MASTERED.
     * Same difficulty (1-6) to CEFR mapping as {@link LearningPathService} (A1-C2).
     * Does not trigger daily quests or XP side effects.
     */
    @Transactional
    public int creditLessonsBelowOverallCefr(Long userId, CefrLevel overallLevel) {
        if (overallLevel == null || overallLevel.getOrder() <= 1) {
            return 0;
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", userId));

        List<Lesson> lessons = lessonRepository.findByIsPublishedTrueOrderByOrderIndexAsc();
        int credited = 0;
        for (Lesson lesson : lessons) {
            CefrLevel lessonCefr = lessonDifficultyToCefr(lesson.getDifficultyLevel());
            if (lessonCefr.getOrder() >= overallLevel.getOrder()) {
                continue;
            }
            if (markLessonCompletedQuietly(user, lesson)) {
                masterVocabularyForLesson(user, lesson.getId());
                credited++;
            }
        }
        if (credited > 0) {
            learningPathService.evictLearningPath(userId);
            log.info("Placement credit: user {} — {} lessons marked complete below CEFR {}", userId, credited, overallLevel);
        }
        return credited;
    }

    private static CefrLevel lessonDifficultyToCefr(Integer difficultyLevel) {
        int diff = difficultyLevel != null ? difficultyLevel : 3;
        return CefrLevel.fromOrder(Math.min(6, Math.max(1, diff)));
    }

    /** @return true if this call newly marked the lesson completed */
    private boolean markLessonCompletedQuietly(User user, Lesson lesson) {
        Progress progress = progressRepository.findByUserIdAndLessonId(user.getId(), lesson.getId())
                .orElseGet(() -> Progress.builder()
                        .user(user)
                        .lesson(lesson)
                        .completionPercentage(0)
                        .isCompleted(false)
                        .build());
        if (Boolean.TRUE.equals(progress.getIsCompleted())) {
            return false;
        }
        progress.setCompletionPercentage(100);
        progress.setIsCompleted(true);
        progressRepository.save(progress);
        return true;
    }

    private void masterVocabularyForLesson(User user, Long lessonId) {
        List<Vocabulary> vocabs = vocabularyRepository.findByLessonId(lessonId);
        for (Vocabulary v : vocabs) {
            UserVocabulary uv = userVocabularyRepository.findByUserIdAndVocabularyId(user.getId(), v.getId())
                    .orElseGet(() -> UserVocabulary.builder()
                            .user(user)
                            .vocabulary(v)
                            .status(VocabStatus.NEW)
                            .reviewCount(0)
                            .build());
            if (uv.getStatus() == VocabStatus.MASTERED) {
                continue;
            }
            uv.setStatus(VocabStatus.MASTERED);
            int rc = uv.getReviewCount() != null ? uv.getReviewCount() : 0;
            uv.setReviewCount(rc + 1);
            uv.setLastReviewedAt(LocalDateTime.now());
            userVocabularyRepository.save(uv);
        }
    }

    /**
     * Async update progress - for background processing to reduce DB load.
     * Call this method when you don't need immediate result.
     */
    @Async("taskExecutor")
    public void updateProgressAsync(Long userId, Long lessonId, Integer percentage) {
        try {
            updateProgress(userId, lessonId, percentage);
            log.debug("Async progress updated for user {} lesson {}: {}%", userId, lessonId, percentage);
        } catch (Exception e) {
            log.error("Failed async progress update for user {} lesson {}: {}", userId, lessonId, e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public Long getCompletedCount(Long userId) {
        return progressRepository.countCompletedByUserId(userId);
    }

    @Transactional(readOnly = true)
    public Double getAverageProgress(Long userId) {
        Double avg = progressRepository.averageCompletionByUserId(userId);
        return avg != null ? avg : 0.0;
    }

    @Transactional(readOnly = true)
    public Long getTotalLessonsCount() {
        return lessonRepository.count();
    }

    @Transactional(readOnly = true)
    public Long getWordsLearnedCount(Long userId) {
        return userVocabularyRepository.countByUserIdAndStatus(userId, VocabStatus.MASTERED);
    }

    private ProgressResponse mapToResponse(Progress progress) {
        return ProgressResponse.builder()
                .id(progress.getId())
                .userId(progress.getUser().getId())
                .userName(progress.getUser().getFullName())
                .lessonId(progress.getLesson().getId())
                .lessonTitle(progress.getLesson().getTitle())
                .completionPercentage(progress.getCompletionPercentage())
                .isCompleted(progress.getIsCompleted())
                .lastAccessed(progress.getLastAccessed())
                .build();
    }
}
