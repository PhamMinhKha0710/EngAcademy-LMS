package com.englishlearn.application.service;

import com.englishlearn.application.dto.request.QuestionRequest;
import com.englishlearn.application.dto.response.QuestionResponse;
import com.englishlearn.domain.entity.Lesson;
import com.englishlearn.domain.entity.Question;
import com.englishlearn.domain.entity.QuestionOption;
import com.englishlearn.domain.entity.Vocabulary;
import com.englishlearn.domain.exception.ResourceNotFoundException;
import com.englishlearn.infrastructure.persistence.LessonRepository;
import com.englishlearn.infrastructure.persistence.QuestionOptionRepository;
import com.englishlearn.infrastructure.persistence.QuestionRepository;
import com.englishlearn.infrastructure.persistence.VocabularyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final QuestionOptionRepository questionOptionRepository;
    private final LessonRepository lessonRepository;
    private final VocabularyRepository vocabularyRepository;

    /**
     * Paginated list — 3 DB round-trips per page (ids, questions+joins, options batch).
     */
    @Transactional(readOnly = true)
    public Page<QuestionResponse> getQuestionsPage(Long lessonId, String questionType, Pageable pageable) {
        Page<Long> idPage = questionRepository.findQuestionIds(lessonId, questionType, pageable);
        if (idPage.isEmpty()) {
            return new PageImpl<>(List.of(), pageable, 0);
        }

        List<Long> ids = idPage.getContent();
        List<Question> questions = questionRepository.findByIdsWithLessonAndVocabulary(ids);
        Map<Long, Question> byId = questions.stream()
                .collect(Collectors.toMap(Question::getId, Function.identity(), (a, b) -> a));

        List<Question> ordered = new ArrayList<>(ids.size());
        for (Long id : ids) {
            Question q = byId.get(id);
            if (q != null) {
                ordered.add(q);
            }
        }

        Map<Long, List<QuestionOption>> optionsByQuestionId = loadOptionsByQuestionIds(ids);
        List<QuestionResponse> content = ordered.stream()
                .map(q -> mapToResponse(q, optionsByQuestionId.getOrDefault(q.getId(), List.of())))
                .toList();

        return new PageImpl<>(content, pageable, idPage.getTotalElements());
    }

    @Transactional(readOnly = true)
    public Page<QuestionResponse> getQuestionsByType(String type, Pageable pageable) {
        return getQuestionsPage(null, type, pageable);
    }

    @Transactional(readOnly = true)
    public List<QuestionResponse> getQuestionsByLesson(Long lessonId) {
        Page<QuestionResponse> page = getQuestionsPage(lessonId, null, Pageable.unpaged());
        return page.getContent();
    }

    @Transactional(readOnly = true)
    public QuestionResponse getQuestionById(Long id) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Câu hỏi", "id", id));
        return mapToResponse(question);
    }

    @Transactional
    public QuestionResponse createQuestion(QuestionRequest request) {
        Lesson lesson = null;
        if (request.getLessonId() != null) {
            lesson = lessonRepository.findById(request.getLessonId())
                    .orElseThrow(() -> new ResourceNotFoundException("Bài học", "id", request.getLessonId()));
        }
        Vocabulary vocabulary = null;
        if (request.getVocabularyId() != null) {
            vocabulary = vocabularyRepository.findById(request.getVocabularyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Từ vựng", "id", request.getVocabularyId()));
        }

        Question question = Question.builder()
                .lesson(lesson)
                .vocabulary(vocabulary)
                .questionType(request.getQuestionType())
                .questionText(request.getQuestionText())
                .points(request.getPoints())
                .explanation(request.getExplanation())
                .build();

        Question savedQuestion = questionRepository.save(question);

        if (request.getOptions() != null && !request.getOptions().isEmpty()) {
            for (QuestionRequest.QuestionOptionRequest optionReq : request.getOptions()) {
                QuestionOption option = QuestionOption.builder()
                        .question(savedQuestion)
                        .optionText(optionReq.getOptionText())
                        .isCorrect(optionReq.getIsCorrect() != null ? optionReq.getIsCorrect() : false)
                        .build();
                questionOptionRepository.save(option);
            }
        }

        log.info("Created question: {} (ID: {})", savedQuestion.getQuestionType(), savedQuestion.getId());
        return mapToResponse(savedQuestion);
    }

    @Transactional
    public QuestionResponse updateQuestion(Long id, QuestionRequest request) {
        Question question = questionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Câu hỏi", "id", id));

        if (request.getLessonId() != null) {
            Lesson lesson = lessonRepository.findById(request.getLessonId())
                    .orElseThrow(() -> new ResourceNotFoundException("Bài học", "id", request.getLessonId()));
            question.setLesson(lesson);
        }
        if (request.getVocabularyId() != null) {
            Vocabulary vocabulary = vocabularyRepository.findById(request.getVocabularyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Từ vựng", "id", request.getVocabularyId()));
            question.setVocabulary(vocabulary);
        }

        question.setQuestionType(request.getQuestionType());
        question.setQuestionText(request.getQuestionText());
        question.setPoints(request.getPoints());
        question.setExplanation(request.getExplanation());

        Question updatedQuestion = questionRepository.save(question);

        if (request.getOptions() != null) {
            questionOptionRepository.deleteByQuestionId(id);
            for (QuestionRequest.QuestionOptionRequest optionReq : request.getOptions()) {
                QuestionOption option = QuestionOption.builder()
                        .question(updatedQuestion)
                        .optionText(optionReq.getOptionText())
                        .isCorrect(optionReq.getIsCorrect() != null ? optionReq.getIsCorrect() : false)
                        .build();
                questionOptionRepository.save(option);
            }
        }

        log.info("Updated question: {} (ID: {})", updatedQuestion.getQuestionType(), updatedQuestion.getId());
        return mapToResponse(updatedQuestion);
    }

    @Transactional
    public void deleteQuestion(Long id) {
        if (!questionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Câu hỏi", "id", id);
        }
        questionOptionRepository.deleteByQuestionId(id);
        questionRepository.deleteById(id);
        log.info("Deleted question with ID: {}", id);
    }

    private Map<Long, List<QuestionOption>> loadOptionsByQuestionIds(List<Long> questionIds) {
        if (questionIds.isEmpty()) {
            return Map.of();
        }
        Map<Long, List<QuestionOption>> grouped = new HashMap<>();
        for (QuestionOption option : questionOptionRepository.findByQuestionIdIn(questionIds)) {
            Long questionId = option.getQuestion().getId();
            grouped.computeIfAbsent(questionId, k -> new ArrayList<>()).add(option);
        }
        grouped.values().forEach(list -> list.sort(Comparator.comparing(QuestionOption::getId)));
        return grouped;
    }

    private QuestionResponse mapToResponse(Question question) {
        List<QuestionOption> options = questionOptionRepository.findByQuestionId(question.getId());
        return mapToResponse(question, options);
    }

    private QuestionResponse mapToResponse(Question question, List<QuestionOption> options) {
        List<QuestionResponse.QuestionOptionResponse> optionResponses = options.stream()
                .map(opt -> QuestionResponse.QuestionOptionResponse.builder()
                        .id(opt.getId())
                        .optionText(opt.getOptionText())
                        .isCorrect(opt.getIsCorrect())
                        .build())
                .toList();

        return QuestionResponse.builder()
                .id(question.getId())
                .questionType(question.getQuestionType())
                .questionText(question.getQuestionText())
                .points(question.getPoints())
                .explanation(question.getExplanation())
                .lessonId(question.getLesson() != null ? question.getLesson().getId() : null)
                .lessonTitle(question.getLesson() != null ? question.getLesson().getTitle() : null)
                .vocabularyId(question.getVocabulary() != null ? question.getVocabulary().getId() : null)
                .vocabularyWord(question.getVocabulary() != null ? question.getVocabulary().getWord() : null)
                .options(optionResponses)
                .build();
    }
}
