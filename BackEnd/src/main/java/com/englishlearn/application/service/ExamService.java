package com.englishlearn.application.service;

import com.englishlearn.application.dto.request.AntiCheatEventDTO;
import com.englishlearn.application.dto.request.ExamRequest;
import com.englishlearn.application.dto.request.ExamSubmitDTO;
import com.englishlearn.application.dto.request.SubmitExamRequest;
import com.englishlearn.application.dto.response.ExamQuestionDTO;
import com.englishlearn.application.dto.response.ExamResponse;
import com.englishlearn.application.dto.response.ExamResultDTO;
import com.englishlearn.application.dto.response.ExamResultResponse;
import com.englishlearn.application.dto.response.ExamTakeDTO;
import com.englishlearn.domain.entity.*;
import com.englishlearn.domain.exception.DuplicateResourceException;
import com.englishlearn.domain.exception.ResourceNotFoundException;
import com.englishlearn.infrastructure.persistence.*;
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

import com.englishlearn.application.dto.response.QuestionResponse;

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
    private final AntiCheatEventRepository antiCheatEventRepository;

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

    /**
     * Lấy bài kiểm tra theo ID - dành cho Teacher/Admin (hiển thị đáp án đúng).
     */
    @Transactional(readOnly = true)
    public ExamResponse getExamById(Long id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bài kiểm tra", "id", id));
        return mapToResponseWithQuestions(exam, false);
    }

    /**
     * Lấy bài kiểm tra cho học sinh làm bài - ẩn đáp án đúng, áp dụng trộn đề.
     * Shuffle questions nếu exam.shuffleQuestions = true.
     * Shuffle answers nếu exam.shuffleAnswers = true.
     * Ẩn isCorrect và explanation để chống gian lận.
     */
    @Transactional(readOnly = true)
    public ExamResponse getExamForStudent(Long id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bài kiểm tra", "id", id));

        if (!"PUBLISHED".equals(exam.getStatus())) {
            throw new IllegalStateException("Bài kiểm tra chưa được công bố");
        }

        // Enforce exam availability window for student preview/take flow.
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(exam.getStartTime())) {
            throw new IllegalStateException("Bài thi chưa bắt đầu. Thời gian bắt đầu: " + exam.getStartTime());
        }
        if (now.isAfter(exam.getEndTime())) {
            throw new IllegalStateException("Bài thi đã kết thúc. Thời gian kết thúc: " + exam.getEndTime());
        }

        return mapToResponseWithQuestions(exam, true);
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
    public ExamResponse publishScores(Long id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bài kiểm tra", "id", id));

        if (!"PUBLISHED".equals(exam.getStatus()) && !"CLOSED".equals(exam.getStatus())) {
            throw new IllegalStateException("Chỉ có thể công bố điểm cho bài thi đã phát hành");
        }

        exam.setScorePublished(true);
        Exam publishedScoresExam = examRepository.save(exam);
        log.info("Published scores for exam: {} (ID: {})", publishedScoresExam.getTitle(), publishedScoresExam.getId());

        return mapToResponse(publishedScoresExam);
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

        // Calculate score - hỗ trợ MULTIPLE_CHOICE, TRUE_FALSE, FILL_IN_BLANK
        int correctCount = 0;
        int totalPoints = 0;
        int earnedPoints = 0;

        for (SubmitExamRequest.AnswerSubmission answer : request.getAnswers()) {
            Question question = questionRepository.findById(answer.getQuestionId()).orElse(null);
            if (question == null)
                continue;

            totalPoints += question.getPoints();
            boolean isCorrect = false;

            switch (question.getQuestionType()) {
                case "MULTIPLE_CHOICE":
                    if (answer.getSelectedOptionId() != null) {
                        QuestionOption option = questionOptionRepository.findById(answer.getSelectedOptionId())
                                .orElse(null);
                        isCorrect = option != null && Boolean.TRUE.equals(option.getIsCorrect());
                    }
                    break;

                case "TRUE_FALSE":
                    // TRUE_FALSE: so sánh answerText hoặc selectedOptionId
                    if (answer.getSelectedOptionId() != null) {
                        QuestionOption option = questionOptionRepository.findById(answer.getSelectedOptionId())
                                .orElse(null);
                        isCorrect = option != null && Boolean.TRUE.equals(option.getIsCorrect());
                    } else if (answer.getAnswerText() != null) {
                        // So sánh text với option correct
                        List<QuestionOption> options = questionOptionRepository.findByQuestionId(question.getId());
                        isCorrect = options.stream()
                                .filter(opt -> Boolean.TRUE.equals(opt.getIsCorrect()))
                                .anyMatch(opt -> opt.getOptionText().equalsIgnoreCase(answer.getAnswerText().trim()));
                    }
                    break;

                case "FILL_IN_BLANK":
                    if (answer.getAnswerText() != null) {
                        List<QuestionOption> correctOptions = questionOptionRepository
                                .findByQuestionId(question.getId());
                        isCorrect = correctOptions.stream()
                                .filter(opt -> Boolean.TRUE.equals(opt.getIsCorrect()))
                                .anyMatch(opt -> opt.getOptionText().equalsIgnoreCase(answer.getAnswerText().trim()));
                    }
                    break;

                default:
                    log.warn("Unknown question type: {} for question {}", question.getQuestionType(), question.getId());
                    break;
            }

            if (isCorrect) {
                correctCount++;
                earnedPoints += question.getPoints();
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
                .submittedAt(LocalDateTime.now())
                .build();

        ExamResult savedResult = examResultRepository.save(result);
        log.info("Student {} submitted exam {} with score {}", student.getFullName(), exam.getTitle(), score);

        return mapToResultResponse(savedResult);
    }

    @Transactional(readOnly = true)
    public List<ExamResultResponse> getExamResults(Long examId) {
        return examResultRepository.findTopScoresByExamId(examId)
                .stream()
                // Chỉ hiển thị kết quả đã nộp; bỏ các phiên đang làm dở
                .filter(er -> er.getSubmittedAt() != null)
                .map(this::mapToResultResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ExamResultResponse getStudentExamResult(Long examId, Long studentId) {
        ExamResult result = examResultRepository
                .findTopByExamIdAndStudentIdAndSubmittedAtIsNotNullOrderBySubmittedAtDescIdDesc(examId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Kết quả bài thi", "examId", examId));

        // Học sinh chỉ xem chi tiết sau khi giáo viên công bố điểm
        if (!Boolean.TRUE.equals(result.getExam().getScorePublished())) {
            throw new IllegalStateException("Giáo viên chưa công bố kết quả bài thi");
        }

        return mapToResultResponse(result);
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
        Long submittedCount = examResultRepository.countSubmittedStudentsByExamId(exam.getId());
        Double avgScore = examResultRepository.averageScoreByExamId(exam.getId());

        int totalPoints = exam.getQuestions().stream()
                .mapToInt(Question::getPoints)
                .sum();

        return ExamResponse.builder()
                .id(exam.getId())
                .title(exam.getTitle())
                .status(exam.getStatus())
                .scorePublished(exam.getScorePublished())
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

    /**
     * Map exam to response kèm danh sách câu hỏi.
     *
     * @param exam       Entity bài kiểm tra
     * @param forStudent true = ẩn đáp án đúng + áp dụng shuffle; false = hiển thị
     *                   đầy đủ cho teacher
     */
    private ExamResponse mapToResponseWithQuestions(Exam exam, boolean forStudent) {
        ExamResponse response = mapToResponse(exam);

        List<Question> questionList = new ArrayList<>(exam.getQuestions());

        // Shuffle thứ tự câu hỏi nếu cần
        if (forStudent && Boolean.TRUE.equals(exam.getShuffleQuestions())) {
            Collections.shuffle(questionList);
            log.debug("Shuffled {} questions for exam {}", questionList.size(), exam.getId());
        }

        List<QuestionResponse> questionResponses = questionList.stream()
                .map(q -> mapQuestionToResponse(q, forStudent, Boolean.TRUE.equals(exam.getShuffleAnswers())))
                .collect(Collectors.toList());

        response.setQuestions(questionResponses);
        return response;
    }

    /**
     * Map Question entity sang QuestionResponse.
     *
     * @param question       Entity câu hỏi
     * @param hideCorrect    true = ẩn isCorrect và explanation (cho student)
     * @param shuffleOptions true = trộn thứ tự đáp án
     */
    private QuestionResponse mapQuestionToResponse(Question question, boolean hideCorrect, boolean shuffleOptions) {
        List<QuestionOption> options = questionOptionRepository.findByQuestionId(question.getId());

        // Shuffle thứ tự đáp án nếu cần
        if (shuffleOptions && hideCorrect) {
            Collections.shuffle(options);
        }

        List<QuestionResponse.QuestionOptionResponse> optionResponses = options.stream()
                .map(opt -> QuestionResponse.QuestionOptionResponse.builder()
                        .id(opt.getId())
                        .optionText(opt.getOptionText())
                        .isCorrect(hideCorrect ? null : opt.getIsCorrect()) // Ẩn đáp án đúng cho student
                        .build())
                .collect(Collectors.toList());

        return QuestionResponse.builder()
                .id(question.getId())
                .questionType(question.getQuestionType())
                .questionText(question.getQuestionText())
                .points(question.getPoints())
                .explanation(hideCorrect ? null : question.getExplanation()) // Ẩn giải thích cho student
                .lessonId(question.getLesson() != null ? question.getLesson().getId() : null)
                .lessonTitle(question.getLesson() != null ? question.getLesson().getTitle() : null)
                .options(optionResponses)
                .build();
    }

    private ExamResultResponse mapToResultResponse(ExamResult result) {
        int correctCount = result.getCorrectCount() != null ? result.getCorrectCount() : 0;
        int totalQuestions = result.getTotalQuestions() != null ? result.getTotalQuestions() : 0;
        double percentage = totalQuestions > 0
                ? (double) correctCount / totalQuestions * 100
                : 0;

        String grade = calculateGrade(result.getScore());

        return ExamResultResponse.builder()
                .id(result.getId())
                .examId(result.getExam().getId())
                .examTitle(result.getExam().getTitle())
                .studentId(result.getStudent().getId())
                .studentName(result.getStudent().getFullName())
                .score(result.getScore())
                .correctCount(correctCount)
                .totalQuestions(totalQuestions)
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
        // Backward compatible with both score scales:
        // - legacy flow: 0-10
        // - anti-cheat flow: 0-100
        if (s > 10) {
            if (s >= 90)
                return "A";
            if (s >= 80)
                return "B";
            if (s >= 65)
                return "C";
            if (s >= 50)
                return "D";
            return "F";
        }

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

    // ========================= ANTI-CHEAT EXAM METHODS =========================

    /**
     * Lấy bài thi để làm bài (có shuffle questions và answers, tạo ExamResult
     * in-progress)
     */
    @Transactional
    public ExamTakeDTO takeExam(Long examId, Long studentId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Bài thi", "id", examId));

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Sinh viên", "id", studentId));

        // Kiểm tra thời gian bài thi
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(exam.getStartTime())) {
            throw new IllegalStateException("Bài thi chưa bắt đầu. Thời gian bắt đầu: " + exam.getStartTime());
        }
        if (now.isAfter(exam.getEndTime())) {
            throw new IllegalStateException("Bài thi đã kết thúc. Thời gian kết thúc: " + exam.getEndTime());
        }

        // Kiểm tra trạng thái bài thi
        if (!"PUBLISHED".equals(exam.getStatus())) {
            throw new IllegalStateException("Bài thi chưa được công bố");
        }

        // Nếu đã có bản ghi đã nộp trước đó thì không cho làm lại
        boolean alreadySubmitted = examResultRepository
                .findTopByExamIdAndStudentIdAndSubmittedAtIsNotNullOrderBySubmittedAtDescIdDesc(examId, studentId)
                .isPresent();
        if (alreadySubmitted) {
            throw new IllegalStateException("Bạn đã hoàn thành bài thi này");
        }

        // Lấy phiên làm bài đang mở gần nhất (nếu có), tránh lỗi duplicate dữ liệu cũ.
        // Nếu chưa có phiên mở thì tạo mới.
        ExamResult examResult = examResultRepository
                .findTopByExamIdAndStudentIdAndSubmittedAtIsNullOrderByIdDesc(examId, studentId)
                .orElseGet(() -> {
                    ExamResult newResult = ExamResult.builder()
                            .exam(exam)
                            .student(student)
                            .totalQuestions(exam.getQuestions().size())
                            .build();
                    return examResultRepository.save(newResult);
                });

        // Chuyển đổi questions sang DTO với shuffle
        List<Question> questions = new ArrayList<>(exam.getQuestions());

        // Shuffle questions nếu được bật
        if (Boolean.TRUE.equals(exam.getShuffleQuestions())) {
            Collections.shuffle(questions, new Random(studentId + examId));
            log.info("Shuffled questions for exam {} student {}", examId, studentId);
        }

        List<ExamQuestionDTO> questionDTOs = questions.stream()
                .map(q -> mapToExamQuestionDTO(q, exam.getShuffleAnswers(), studentId, examId))
                .collect(Collectors.toList());

        return ExamTakeDTO.builder()
                .id(exam.getId())
                .title(exam.getTitle())
                .durationMinutes(exam.getDurationMinutes())
                .startTime(exam.getStartTime())
                .endTime(exam.getEndTime())
                .antiCheatEnabled(exam.getAntiCheatEnabled())
                .examResultId(examResult.getId())
                .questions(questionDTOs)
                .totalQuestions(questionDTOs.size())
                .build();
    }

    /**
     * Map Question entity sang ExamQuestionDTO với shuffle options
     */
    private ExamQuestionDTO mapToExamQuestionDTO(Question question, Boolean shuffleAnswers, Long studentId,
            Long examId) {
        List<QuestionOption> options = questionOptionRepository.findByQuestionId(question.getId());

        if (Boolean.TRUE.equals(shuffleAnswers)) {
            List<QuestionOption> shuffledOptions = new ArrayList<>(options);
            Collections.shuffle(shuffledOptions, new Random(studentId + examId + question.getId()));
            options = shuffledOptions;
        }

        List<ExamQuestionDTO.QuestionOptionDTO> optionDTOs = options.stream()
                .map(opt -> ExamQuestionDTO.QuestionOptionDTO.builder()
                        .id(opt.getId())
                        .optionText(opt.getOptionText())
                        .build())
                .collect(Collectors.toList());

        return ExamQuestionDTO.builder()
                .id(question.getId())
                .questionText(question.getQuestionText())
                .questionType(question.getQuestionType())
                .points(question.getPoints())
                .options(optionDTOs)
                .build();
    }

    /**
     * Ghi nhận sự kiện anti-cheat
     */
    @Transactional
    public void logAntiCheatEvent(AntiCheatEventDTO dto, Long userId) {
        ExamResult examResult = examResultRepository.findById(dto.getExamResultId())
                .orElseThrow(() -> new ResourceNotFoundException("Kết quả thi", "id", dto.getExamResultId()));

        // Security: Validate ownership
        if (!examResult.getStudent().getId().equals(userId)) {
            log.warn("User {} attempted to log anti-cheat event for exam result {} owned by user {}",
                    userId, dto.getExamResultId(), examResult.getStudent().getId());
            throw new IllegalArgumentException("Bạn không có quyền ghi nhận sự kiện cho bài thi này");
        }

        if (examResult.getSubmittedAt() != null) {
            log.warn("Attempt to log anti-cheat event after submission for result {}", dto.getExamResultId());
            return;
        }

        AntiCheatEvent event = AntiCheatEvent.builder()
                .examResult(examResult)
                .eventType(dto.getEventType())
                .eventTime(dto.getTimestamp() != null ? dto.getTimestamp() : LocalDateTime.now())
                .details(dto.getDetails())
                .build();
        antiCheatEventRepository.save(event);

        examResult.setViolationCount(examResult.getViolationCount() + 1);
        examResultRepository.save(examResult);

        log.info("Anti-cheat event logged: type={}, examResultId={}, totalViolations={}",
                dto.getEventType(), dto.getExamResultId(), examResult.getViolationCount());
    }

    /**
     * Submit bài thi với anti-cheat validation
     */
    @Transactional
    public ExamResultDTO submitExamWithAntiCheat(ExamSubmitDTO dto, Long userId) {
        ExamResult examResult = examResultRepository.findById(dto.getExamResultId())
                .orElseThrow(() -> new ResourceNotFoundException("Kết quả thi", "id", dto.getExamResultId()));

        // Security: Validate ownership
        if (!examResult.getStudent().getId().equals(userId)) {
            log.warn("User {} attempted to submit exam result {} owned by user {}",
                    userId, dto.getExamResultId(), examResult.getStudent().getId());
            throw new IllegalArgumentException("Bạn không có quyền nộp bài thi này");
        }

        if (examResult.getSubmittedAt() != null) {
            throw new IllegalStateException("Bài thi đã được nộp trước đó");
        }

        Exam exam = examResult.getExam();
        LocalDateTime now = LocalDateTime.now();

        // Validation thời gian
        LocalDateTime deadline = exam.getStartTime().plusMinutes(exam.getDurationMinutes());
        LocalDateTime deadlineWithBuffer = deadline.plusMinutes(1);

        String status = "COMPLETED";
        if (now.isAfter(deadlineWithBuffer)) {
            log.warn("Late submission for examResult {}: submitted at {}, deadline was {}",
                    dto.getExamResultId(), now, deadline);
            status = "LATE";
        }

        // Tính điểm
        int correctCount = 0;
        int totalPoints = 0;
        int earnedPoints = 0;

        if (dto.getAnswers() != null) {
            for (ExamSubmitDTO.AnswerDTO answer : dto.getAnswers()) {
                Long selectedOptionId = answer.getSelectedOptionId();
                if (selectedOptionId == null && answer.getSelectedOptionIds() != null && !answer.getSelectedOptionIds().isEmpty()) {
                    selectedOptionId = answer.getSelectedOptionIds().get(0);
                }

                if (selectedOptionId != null) {
                    QuestionOption selectedOption = questionOptionRepository.findById(selectedOptionId)
                            .orElse(null);
                    if (selectedOption != null) {
                        Question question = selectedOption.getQuestion();
                        totalPoints += question.getPoints();
                        if (Boolean.TRUE.equals(selectedOption.getIsCorrect())) {
                            correctCount++;
                            earnedPoints += question.getPoints();
                        }
                    }
                }
            }
        }

        BigDecimal score = BigDecimal.ZERO;
        if (totalPoints > 0) {
            score = BigDecimal.valueOf(earnedPoints)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(totalPoints), 2, RoundingMode.HALF_UP);
        }

        // Kiểm tra violation để flag
        if (examResult.getViolationCount() >= 3) {
            status = "FLAGGED";
            log.warn("Exam result {} flagged due to {} violations", dto.getExamResultId(),
                    examResult.getViolationCount());
        }

        examResult.setScore(score);
        examResult.setCorrectCount(correctCount);
        examResult.setSubmittedAt(now);
        examResultRepository.save(examResult);

        log.info("Exam submitted: resultId={}, score={}, correctCount={}/{}, status={}",
                dto.getExamResultId(), score, correctCount, examResult.getTotalQuestions(), status);

        // Calculate percentage and grade for response
        double percentage = examResult.getTotalQuestions() > 0
                ? (double) correctCount / examResult.getTotalQuestions() * 100
                : 0;
        String grade = calculateGrade(score);

        return ExamResultDTO.builder()
                .id(examResult.getId())
                .examId(exam.getId())
                .examTitle(exam.getTitle())
                .studentId(examResult.getStudent().getId())
                .studentName(examResult.getStudent().getFullName())
                .score(score)
                .correctCount(correctCount)
                .totalQuestions(examResult.getTotalQuestions())
                .percentage(percentage)
                .grade(grade)
                .submittedAt(now)
                .violationCount(examResult.getViolationCount())
                .status(status)
                .build();
    }

    /**
     * Lấy danh sách sự kiện anti-cheat của một kết quả thi
     */
    @Transactional(readOnly = true)
    public List<AntiCheatEvent> getAntiCheatEvents(Long examResultId) {
        return antiCheatEventRepository.findByExamResultIdOrderByEventTimeAsc(examResultId);
    }
}
