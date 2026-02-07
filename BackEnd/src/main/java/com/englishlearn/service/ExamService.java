package com.englishlearn.service;

import com.englishlearn.dto.request.ExamRequest;
import com.englishlearn.dto.request.SubmitExamRequest;
import com.englishlearn.dto.response.ExamResponse;
import com.englishlearn.dto.response.ExamResultResponse;
import com.englishlearn.entity.*;
import com.englishlearn.exception.DuplicateResourceException;
import com.englishlearn.exception.ResourceNotFoundException;
import com.englishlearn.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExamService {

    private final ExamRepository examRepository;
    private final ClassRoomRepository classRoomRepository;
    private final UserRepository userRepository;
    private final QuestionRepository questionRepository;
    private final ExamResultRepository examResultRepository;
    private final ExamAnswerRepository examAnswerRepository;
    private final QuestionOptionRepository questionOptionRepository;

    @Transactional(readOnly = true)
    public Page<ExamResponse> getExamsByTeacher(Long teacherId, Pageable pageable) {
        return examRepository.findByTeacherId(teacherId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public Page<ExamResponse> getExamsByClass(Long classId, Pageable pageable) {
        return examRepository.findByClassRoomId(classId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<ExamResponse> getActiveExamsForStudent(Long classId) {
        return examRepository.findActiveExamsByClassId(classId, LocalDateTime.now())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ExamResponse getExamById(Long id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bài kiểm tra", "id", id));
        return mapToResponseWithQuestions(exam);
    }

    @Transactional
    public ExamResponse createExam(Long teacherId, ExamRequest request) {
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new ResourceNotFoundException("Giáo viên", "id", teacherId));

        ClassRoom classRoom = classRoomRepository.findById(request.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("Lớp học", "id", request.getClassId()));

        Exam exam = Exam.builder()
                .title(request.getTitle())
                .teacher(teacher)
                .classRoom(classRoom)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .durationMinutes(request.getDurationMinutes())
                .shuffleQuestions(request.getShuffleQuestions() != null ? request.getShuffleQuestions() : true)
                .shuffleAnswers(request.getShuffleAnswers() != null ? request.getShuffleAnswers() : true)
                .antiCheatEnabled(request.getAntiCheatEnabled() != null ? request.getAntiCheatEnabled() : true)
                .status("DRAFT")
                .build();

        // Add questions if provided
        if (request.getQuestionIds() != null && !request.getQuestionIds().isEmpty()) {
            Set<Question> questions = new HashSet<>(questionRepository.findAllById(request.getQuestionIds()));
            exam.setQuestions(questions);
        }

        Exam savedExam = examRepository.save(exam);
        log.info("Created exam: {} by teacher {} (ID: {})", savedExam.getTitle(), teacher.getFullName(),
                savedExam.getId());

        return mapToResponse(savedExam);
    }

    @Transactional
    public ExamResponse updateExam(Long id, ExamRequest request) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bài kiểm tra", "id", id));

        exam.setTitle(request.getTitle());
        exam.setStartTime(request.getStartTime());
        exam.setEndTime(request.getEndTime());
        exam.setDurationMinutes(request.getDurationMinutes());

        if (request.getShuffleQuestions() != null)
            exam.setShuffleQuestions(request.getShuffleQuestions());
        if (request.getShuffleAnswers() != null)
            exam.setShuffleAnswers(request.getShuffleAnswers());
        if (request.getAntiCheatEnabled() != null)
            exam.setAntiCheatEnabled(request.getAntiCheatEnabled());

        if (request.getQuestionIds() != null) {
            Set<Question> questions = new HashSet<>(questionRepository.findAllById(request.getQuestionIds()));
            exam.setQuestions(questions);
        }

        Exam updatedExam = examRepository.save(exam);
        log.info("Updated exam: {} (ID: {})", updatedExam.getTitle(), updatedExam.getId());

        return mapToResponse(updatedExam);
    }

    @Transactional
    public ExamResponse publishExam(Long id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bài kiểm tra", "id", id));

        if (exam.getQuestions().isEmpty()) {
            throw new IllegalStateException("Không thể công bố bài kiểm tra không có câu hỏi");
        }

        exam.setStatus("PUBLISHED");
        Exam publishedExam = examRepository.save(exam);
        log.info("Published exam: {} (ID: {})", publishedExam.getTitle(), publishedExam.getId());

        return mapToResponse(publishedExam);
    }

    @Transactional
    public ExamResponse closeExam(Long id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bài kiểm tra", "id", id));

        exam.setStatus("CLOSED");
        Exam closedExam = examRepository.save(exam);
        log.info("Closed exam: {} (ID: {})", closedExam.getTitle(), closedExam.getId());

        return mapToResponse(closedExam);
    }

    @Transactional
    public ExamResultResponse submitExam(Long studentId, SubmitExamRequest request) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Học sinh", "id", studentId));

        Exam exam = examRepository.findById(request.getExamId())
                .orElseThrow(() -> new ResourceNotFoundException("Bài kiểm tra", "id", request.getExamId()));

        // Check if already submitted
        if (examResultRepository.existsByExamAndStudent(exam, student)) {
            throw new DuplicateResourceException("Bạn đã nộp bài kiểm tra này rồi");
        }

        // Calculate score
        int correctCount = 0;
        int totalPoints = 0;
        int earnedPoints = 0;

        for (SubmitExamRequest.AnswerSubmission answer : request.getAnswers()) {
            Question question = questionRepository.findById(answer.getQuestionId()).orElse(null);
            if (question != null) {
                totalPoints += question.getPoints();

                if ("MULTIPLE_CHOICE".equals(question.getQuestionType()) && answer.getSelectedOptionId() != null) {
                    QuestionOption option = questionOptionRepository.findById(answer.getSelectedOptionId())
                            .orElse(null);
                    if (option != null && Boolean.TRUE.equals(option.getIsCorrect())) {
                        correctCount++;
                        earnedPoints += question.getPoints();
                    }
                }
            }
        }

        BigDecimal score = totalPoints > 0
                ? BigDecimal.valueOf(earnedPoints * 10.0 / totalPoints).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        ExamResult result = ExamResult.builder()
                .exam(exam)
                .student(student)
                .score(score)
                .correctCount(correctCount)
                .totalQuestions(exam.getQuestions().size())
                .build();

        ExamResult savedResult = examResultRepository.save(result);
        log.info("Student {} submitted exam {} with score {}", student.getFullName(), exam.getTitle(), score);

        return mapToResultResponse(savedResult);
    }

    @Transactional(readOnly = true)
    public List<ExamResultResponse> getExamResults(Long examId) {
        return examResultRepository.findTopScoresByExamId(examId)
                .stream()
                .map(this::mapToResultResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteExam(Long id) {
        if (!examRepository.existsById(id)) {
            throw new ResourceNotFoundException("Bài kiểm tra", "id", id);
        }
        examRepository.deleteById(id);
        log.info("Deleted exam with ID: {}", id);
    }

    private ExamResponse mapToResponse(Exam exam) {
        Long submittedCount = examResultRepository.countByExamId(exam.getId());
        Double avgScore = examResultRepository.averageScoreByExamId(exam.getId());

        int totalPoints = exam.getQuestions().stream()
                .mapToInt(Question::getPoints)
                .sum();

        return ExamResponse.builder()
                .id(exam.getId())
                .title(exam.getTitle())
                .status(exam.getStatus())
                .classId(exam.getClassRoom().getId())
                .className(exam.getClassRoom().getName())
                .teacherId(exam.getTeacher().getId())
                .teacherName(exam.getTeacher().getFullName())
                .startTime(exam.getStartTime())
                .endTime(exam.getEndTime())
                .durationMinutes(exam.getDurationMinutes())
                .shuffleQuestions(exam.getShuffleQuestions())
                .shuffleAnswers(exam.getShuffleAnswers())
                .antiCheatEnabled(exam.getAntiCheatEnabled())
                .questionCount(exam.getQuestions().size())
                .totalPoints(totalPoints)
                .submittedCount(submittedCount != null ? submittedCount : 0L)
                .averageScore(avgScore)
                .build();
    }

    private ExamResponse mapToResponseWithQuestions(Exam exam) {
        ExamResponse response = mapToResponse(exam);
        // Questions would be added here if needed
        return response;
    }

    private ExamResultResponse mapToResultResponse(ExamResult result) {
        double percentage = result.getTotalQuestions() > 0
                ? (double) result.getCorrectCount() / result.getTotalQuestions() * 100
                : 0;

        String grade = calculateGrade(result.getScore());

        return ExamResultResponse.builder()
                .id(result.getId())
                .examId(result.getExam().getId())
                .examTitle(result.getExam().getTitle())
                .studentId(result.getStudent().getId())
                .studentName(result.getStudent().getFullName())
                .score(result.getScore())
                .correctCount(result.getCorrectCount())
                .totalQuestions(result.getTotalQuestions())
                .percentage(percentage)
                .submittedAt(result.getSubmittedAt())
                .violationCount(result.getViolationCount())
                .grade(grade)
                .build();
    }

    private String calculateGrade(BigDecimal score) {
        if (score == null)
            return "F";
        double s = score.doubleValue();
        if (s >= 9)
            return "A";
        if (s >= 8)
            return "B";
        if (s >= 6.5)
            return "C";
        if (s >= 5)
            return "D";
        return "F";
    }
}
