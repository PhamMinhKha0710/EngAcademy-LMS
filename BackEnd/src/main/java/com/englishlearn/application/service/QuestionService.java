package com.englishlearn.application.service;

import com.englishlearn.application.dto.request.QuestionRequest;
import com.englishlearn.application.dto.response.QuestionResponse;
import com.englishlearn.domain.entity.Lesson;
import com.englishlearn.domain.entity.Question;
import com.englishlearn.domain.entity.QuestionOption;
import com.englishlearn.domain.exception.ResourceNotFoundException;
import com.englishlearn.infrastructure.persistence.LessonRepository;
import com.englishlearn.infrastructure.persistence.QuestionOptionRepository;
import com.englishlearn.infrastructure.persistence.QuestionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final QuestionOptionRepository questionOptionRepository;
    private final LessonRepository lessonRepository;

    @Transactional(readOnly = true)
    public List<QuestionResponse> getAllQuestions() {
        return questionRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<QuestionResponse> getQuestionsByType(String type, Pageable pageable) {
        return questionRepository.findByQuestionType(type, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<QuestionResponse> getQuestionsByLesson(Long lessonId) {
        return questionRepository.findByLessonId(lessonId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
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

        Question question = Question.builder()
                .lesson(lesson)
                .questionType(request.getQuestionType())
                .questionText(request.getQuestionText())
                .points(request.getPoints())
                .explanation(request.getExplanation())
                .build();

        Question savedQuestion = questionRepository.save(question);

        // Create options if provided
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

        question.setQuestionType(request.getQuestionType());
        question.setQuestionText(request.getQuestionText());
        question.setPoints(request.getPoints());
        question.setExplanation(request.getExplanation());

        Question updatedQuestion = questionRepository.save(question);

        // Update options if provided
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

    private QuestionResponse mapToResponse(Question question) {
        List<QuestionOption> options = questionOptionRepository.findByQuestionId(question.getId());

        List<QuestionResponse.QuestionOptionResponse> optionResponses = options.stream()
                .map(opt -> QuestionResponse.QuestionOptionResponse.builder()
                        .id(opt.getId())
                        .optionText(opt.getOptionText())
                        .isCorrect(opt.getIsCorrect())
                        .build())
                .collect(Collectors.toList());

        return QuestionResponse.builder()
                .id(question.getId())
                .questionType(question.getQuestionType())
                .questionText(question.getQuestionText())
                .points(question.getPoints())
                .explanation(question.getExplanation())
                .lessonId(question.getLesson() != null ? question.getLesson().getId() : null)
                .lessonTitle(question.getLesson() != null ? question.getLesson().getTitle() : null)
                .options(optionResponses)
                .build();
    }
}
