package com.englishlearn.application.service;

import com.englishlearn.application.dto.response.ProgressResponse;
import com.englishlearn.domain.entity.Lesson;
import com.englishlearn.domain.entity.Progress;
import com.englishlearn.domain.entity.User;
import com.englishlearn.domain.exception.ResourceNotFoundException;
import com.englishlearn.domain.entity.VocabStatus;
import com.englishlearn.infrastructure.persistence.LessonRepository;
import com.englishlearn.infrastructure.persistence.ProgressRepository;
import com.englishlearn.infrastructure.persistence.UserRepository;
import com.englishlearn.infrastructure.persistence.UserVocabularyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    private final DailyQuestService dailyQuestService;

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
