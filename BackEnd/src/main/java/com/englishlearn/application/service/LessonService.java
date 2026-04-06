package com.englishlearn.application.service;

import com.englishlearn.application.dto.request.LessonRequest;
import com.englishlearn.application.dto.response.LessonResponse;
import com.englishlearn.domain.entity.Lesson;
import com.englishlearn.domain.entity.Topic;
import com.englishlearn.domain.exception.ApiException;
import com.englishlearn.infrastructure.persistence.LessonRepository;
import com.englishlearn.infrastructure.persistence.TopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LessonService {

    private final LessonRepository lessonRepository;
    private final TopicRepository topicRepository;

    @Transactional(readOnly = true)
    @Cacheable(value = "lessons", key = "#id")
    public LessonResponse getLessonById(Long id) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy bài học với ID: " + id));
        return mapToResponse(lesson);
    }

    public Page<LessonResponse> getAllLessons(Pageable pageable) {
        return lessonRepository.findAll(pageable).map(this::mapToResponse);
    }

    public List<LessonResponse> getLessonsByTopic(Long topicId) {
        return lessonRepository.findByTopicIdOrderByOrderIndexAsc(topicId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<LessonResponse> getLessonsByDifficultyLevel(Integer difficultyLevel) {
        return lessonRepository.findByDifficultyLevel(difficultyLevel)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<LessonResponse> getLessonsByTopicAndLevel(Long topicId, Integer difficultyLevel) {
        return lessonRepository.findByTopicIdAndDifficultyLevel(topicId, difficultyLevel)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<LessonResponse> getPublishedLessons() {
        return lessonRepository.findByIsPublishedTrueOrderByOrderIndexAsc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public LessonResponse createLesson(LessonRequest request) {
        Topic topic = null;
        if (request.getTopicId() != null) {
            topic = topicRepository.findById(request.getTopicId())
                    .orElseThrow(() -> ApiException.notFound("Không tìm thấy chủ đề"));
        }

        Lesson lesson = Lesson.builder()
                .title(request.getTitle())
                .topic(topic)
                .contentHtml(request.getContentHtml())
                .grammarHtml(request.getGrammarHtml())
                .audioUrl(request.getAudioUrl())
                .videoUrl(request.getVideoUrl())
                .difficultyLevel(request.getDifficultyLevel() != null ? request.getDifficultyLevel() : 1)
                .orderIndex(request.getOrderIndex() != null ? request.getOrderIndex() : 0)
                .isPublished(request.getIsPublished() != null ? request.getIsPublished() : false)
                .build();

        Lesson savedLesson = lessonRepository.save(lesson);
        log.info("Created lesson: {}", savedLesson.getId());
        return mapToResponse(savedLesson);
    }

    @Transactional
    public LessonResponse updateLesson(Long id, LessonRequest request) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy bài học"));

        if (request.getTopicId() != null) {
            Topic topic = topicRepository.findById(request.getTopicId())
                    .orElseThrow(() -> ApiException.notFound("Không tìm thấy chủ đề"));
            lesson.setTopic(topic);
        }

        if (request.getTitle() != null)
            lesson.setTitle(request.getTitle());
        if (request.getContentHtml() != null)
            lesson.setContentHtml(request.getContentHtml());
        if (request.getGrammarHtml() != null)
            lesson.setGrammarHtml(request.getGrammarHtml());
        if (request.getAudioUrl() != null)
            lesson.setAudioUrl(request.getAudioUrl());
        if (request.getVideoUrl() != null)
            lesson.setVideoUrl(request.getVideoUrl());
        if (request.getDifficultyLevel() != null)
            lesson.setDifficultyLevel(request.getDifficultyLevel());
        if (request.getOrderIndex() != null)
            lesson.setOrderIndex(request.getOrderIndex());
        if (request.getIsPublished() != null)
            lesson.setIsPublished(request.getIsPublished());

        Lesson savedLesson = lessonRepository.save(lesson);
        log.info("Updated lesson: {}", id);
        return mapToResponse(savedLesson);
    }

    @Transactional
    public void deleteLesson(Long id) {
        if (!lessonRepository.existsById(id)) {
            throw ApiException.notFound("Không tìm thấy bài học");
        }
        lessonRepository.deleteById(id);
        log.info("Deleted lesson: {}", id);
    }

    private LessonResponse mapToResponse(Lesson lesson) {
        return LessonResponse.builder()
                .id(lesson.getId())
                .title(lesson.getTitle())
                .topicId(lesson.getTopic() != null ? lesson.getTopic().getId() : null)
                .topicName(lesson.getTopic() != null ? lesson.getTopic().getName() : null)
                .contentHtml(lesson.getContentHtml())
                .grammarHtml(lesson.getGrammarHtml())
                .audioUrl(lesson.getAudioUrl())
                .videoUrl(lesson.getVideoUrl())
                .difficultyLevel(lesson.getDifficultyLevel())
                .orderIndex(lesson.getOrderIndex())
                .isPublished(lesson.getIsPublished())
                .vocabularyCount(lesson.getVocabularies() != null ? lesson.getVocabularies().size() : 0)
                .questionCount(lesson.getQuestions() != null ? lesson.getQuestions().size() : 0)
                .build();
    }
}
