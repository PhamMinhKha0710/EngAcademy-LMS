package com.englishlearn.application.service;

import com.englishlearn.application.dto.request.DailyQuestRequest;
import com.englishlearn.application.dto.response.DailyQuestResponse;
import com.englishlearn.domain.entity.DailyQuest;
import com.englishlearn.domain.entity.DailyQuestTask;
import com.englishlearn.domain.entity.User;
import com.englishlearn.domain.exception.ApiException;
import com.englishlearn.infrastructure.persistence.DailyQuestRepository;
import com.englishlearn.infrastructure.persistence.DailyQuestTaskRepository;
import com.englishlearn.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DailyQuestService {

    private final DailyQuestRepository dailyQuestRepository;
    private final DailyQuestTaskRepository dailyQuestTaskRepository;
    private final UserRepository userRepository;

    /**
     * Get or create today's daily quest for a user
     */
    @Transactional
    public DailyQuestResponse getTodayQuest(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng"));

        LocalDate today = LocalDate.now();
        DailyQuest quest = dailyQuestRepository.findByUserAndQuestDate(user, today)
                .orElse(null);

        if (quest == null) {
            quest = createDefaultDailyQuest(user, today);
        } else {
            quest = ensureDefaultTasks(quest);
        }

        return mapToResponse(quest);
    }

    /**
     * Add missing default tasks to an existing quest (for users who had quest before we added new task types).
     */
    private DailyQuest ensureDefaultTasks(DailyQuest quest) {
        List<DailyQuestTask> tasks = dailyQuestTaskRepository.findByDailyQuest(quest);
        Set<String> existingTypes = tasks.stream()
                .map(DailyQuestTask::getTaskType)
                .collect(Collectors.toSet());

        String[][] defaultTaskSpecs = {
                {"LEARN_VOCAB", "10"},
                {"COMPLETE_LESSON", "1"},
                {"SCORE_EXAM", "1"},
                {"REVIEW_MISTAKES", "3"}
        };

        boolean added = false;
        for (String[] spec : defaultTaskSpecs) {
            if (!existingTypes.contains(spec[0])) {
                DailyQuestTask task = DailyQuestTask.builder()
                        .dailyQuest(quest)
                        .taskType(spec[0])
                        .targetCount(Integer.parseInt(spec[1]))
                        .currentCount(0)
                        .isCompleted(false)
                        .build();
                dailyQuestTaskRepository.save(task);
                existingTypes.add(spec[0]);
                added = true;
                log.info("Added missing task {} to quest {} for user {}", spec[0], quest.getId(), quest.getUser().getId());
            }
        }

        if (added) {
            quest = dailyQuestRepository.findById(quest.getId()).get();
        }
        return quest;
    }

    /**
     * Create a daily quest with default tasks
     */
    @Transactional
    public DailyQuestResponse createDailyQuest(Long userId, DailyQuestRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng"));

        LocalDate today = LocalDate.now();

        // Check if quest already exists for today
        if (dailyQuestRepository.findByUserAndQuestDate(user, today).isPresent()) {
            throw ApiException.conflict("Bạn đã có quest cho hôm nay rồi");
        }

        DailyQuest quest = DailyQuest.builder()
                .user(user)
                .questDate(today)
                .isCompleted(false)
                .build();

        quest = dailyQuestRepository.save(quest);

        // Create tasks
        if (request.getTasks() != null && !request.getTasks().isEmpty()) {
            for (DailyQuestRequest.DailyQuestTaskRequest taskRequest : request.getTasks()) {
                DailyQuestTask task = DailyQuestTask.builder()
                        .dailyQuest(quest)
                        .taskType(taskRequest.getTaskType())
                        .targetCount(taskRequest.getTargetCount())
                        .currentCount(0)
                        .isCompleted(false)
                        .build();
                dailyQuestTaskRepository.save(task);
            }
        }

        quest = dailyQuestRepository.findById(quest.getId()).get();
        log.info("Created daily quest for user: {}", userId);
        return mapToResponse(quest);
    }

    /**
     * Update progress of a daily quest task
     */
    @Transactional
    public DailyQuestResponse updateTaskProgress(Long userId, Long taskId, Integer progress) {
        DailyQuestTask task = dailyQuestTaskRepository.findById(taskId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy task"));

        DailyQuest quest = task.getDailyQuest();
        if (!quest.getUser().getId().equals(userId)) {
            throw ApiException.forbidden("Bạn không có quyền cập nhật task này");
        }

        task.setCurrentCount(progress);

        // Check if task is completed
        if (task.getTargetCount() != null && task.getCurrentCount() >= task.getTargetCount()) {
            task.setIsCompleted(true);
        }

        dailyQuestTaskRepository.save(task);
        quest = dailyQuestRepository.findById(quest.getId()).get();

        // Award coins when task is completed
        if (task.getIsCompleted()) {
            int coins = calculateCoinsForTask(task.getTaskType());
            userRepository.addCoinsToUser(userId, coins);
            log.info("Awarded {} coins to user: {} for completing task", coins, userId);
        }

        log.info("Updated task progress for user: {}", userId);
        return mapToResponse(quest);
    }

    /**
     * Complete a daily quest
     */
    @Transactional
    public DailyQuestResponse completeQuest(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng"));

        LocalDate today = LocalDate.now();
        DailyQuest quest = dailyQuestRepository.findByUserAndQuestDate(user, today)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy quest hôm nay"));

        // Check if all tasks are completed
        List<DailyQuestTask> incompleteTasks = dailyQuestTaskRepository
                .findByDailyQuestAndIsCompletedFalse(quest);
        if (!incompleteTasks.isEmpty()) {
            throw ApiException.conflict("Chưa hoàn thành tất cả tasks");
        }

        quest.setIsCompleted(true);
        dailyQuestRepository.save(quest);

        // Bonus coins for completing entire quest
        int bonusCoins = 50;
        userRepository.addCoinsToUser(userId, bonusCoins);

        // Increase streak
        user.setStreakDays(user.getStreakDays() + 1);
        userRepository.save(user);

        log.info("Completed daily quest for user: {}", userId);
        return mapToResponse(quest);
    }

    /**
     * Increment progress for a task type (e.g. when user learns vocab, completes lesson).
     * Called automatically from VocabularyService, ProgressService, ExamService.
     * @return true if a task was completed (reached target) by this increment
     */
    @Transactional
    public boolean incrementProgressForTaskType(Long userId, String taskType, int delta) {
        if (delta <= 0) return false;

        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng"));

        LocalDate today = LocalDate.now();
        Optional<DailyQuest> questOpt = dailyQuestRepository.findByUserAndQuestDate(user, today);
        if (questOpt.isEmpty()) return false;

        DailyQuest quest = questOpt.get();
        Optional<DailyQuestTask> taskOpt = dailyQuestTaskRepository.findByDailyQuestAndTaskType(quest, taskType);
        if (taskOpt.isEmpty()) return false;

        DailyQuestTask task = taskOpt.get();
        if (Boolean.TRUE.equals(task.getIsCompleted())) return false;

        int newCount = (task.getCurrentCount() != null ? task.getCurrentCount() : 0) + delta;
        task.setCurrentCount(newCount);

        boolean completed = false;
        if (task.getTargetCount() != null && newCount >= task.getTargetCount()) {
            task.setIsCompleted(true);
            int coins = calculateCoinsForTask(task.getTaskType());
            userRepository.addCoinsToUser(userId, coins);
            log.info("Auto-completed quest task {} for user {} (awarded {} coins)", taskType, userId, coins);
            completed = true;
        }

        dailyQuestTaskRepository.save(task);
        return completed;
    }

    /**
     * Async update quest progress - for background processing to reduce DB load.
     */
    @Async("taskExecutor")
    public void updateQuestProgressAsync(Long userId, String taskType, int delta) {
        try {
            incrementProgressForTaskType(userId, taskType, delta);
            log.debug("Async quest progress updated for user {} task {}: +{}", userId, taskType, delta);
        } catch (Exception e) {
            log.error("Failed async quest progress update for user {} task {}: {}", userId, taskType, e.getMessage());
        }
    }

    /**
     * Get quest history for a user
     */
    public List<DailyQuestResponse> getQuestHistory(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng"));

        return dailyQuestRepository.findByUserOrderByQuestDateDesc(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Create default daily quest with standard tasks
     */
    private DailyQuest createDefaultDailyQuest(User user, LocalDate date) {
        DailyQuest quest = DailyQuest.builder()
                .user(user)
                .questDate(date)
                .isCompleted(false)
                .build();

        quest = dailyQuestRepository.save(quest);

        // Create default tasks
        DailyQuestTask[] defaultTasks = {
                DailyQuestTask.builder()
                        .dailyQuest(quest)
                        .taskType("LEARN_VOCAB")
                        .targetCount(10)
                        .currentCount(0)
                        .isCompleted(false)
                        .build(),
                DailyQuestTask.builder()
                        .dailyQuest(quest)
                        .taskType("COMPLETE_LESSON")
                        .targetCount(1)
                        .currentCount(0)
                        .isCompleted(false)
                        .build(),
                DailyQuestTask.builder()
                        .dailyQuest(quest)
                        .taskType("SCORE_EXAM")
                        .targetCount(1)
                        .currentCount(0)
                        .isCompleted(false)
                        .build(),
                DailyQuestTask.builder()
                        .dailyQuest(quest)
                        .taskType("REVIEW_MISTAKES")
                        .targetCount(3)
                        .currentCount(0)
                        .isCompleted(false)
                        .build()
        };

        for (DailyQuestTask task : defaultTasks) {
            dailyQuestTaskRepository.save(task);
        }

        return dailyQuestRepository.findById(quest.getId()).get();
    }

    /**
     * Calculate coins for different task types
     */
    private int calculateCoinsForTask(String taskType) {
        return switch (taskType) {
            case "LEARN_VOCAB" -> 10;
            case "COMPLETE_LESSON" -> 25;
            case "SCORE_EXAM" -> 50;
            case "REVIEW_MISTAKES" -> 15;
            default -> 5;
        };
    }

    /**
     * Map DailyQuest entity to response DTO
     */
    private DailyQuestResponse mapToResponse(DailyQuest quest) {
        List<DailyQuestResponse.DailyQuestTaskResponse> taskResponses = quest.getTasks().stream()
                .map(task -> DailyQuestResponse.DailyQuestTaskResponse.builder()
                        .id(task.getId())
                        .taskType(task.getTaskType())
                        .targetCount(task.getTargetCount())
                        .currentProgress(task.getCurrentCount())
                        .isCompleted(task.getIsCompleted())
                        .coins(calculateCoinsForTask(task.getTaskType()))
                        .build())
                .collect(Collectors.toList());

        return DailyQuestResponse.builder()
                .id(quest.getId())
                .questDate(quest.getQuestDate())
                .isCompleted(quest.getIsCompleted())
                .tasks(taskResponses)
                .totalCoins(calculateTotalCoins(quest))
                .build();
    }

    /**
     * Calculate total coins for a quest
     */
    private Integer calculateTotalCoins(DailyQuest quest) {
        int total = quest.getTasks().stream()
                .filter(DailyQuestTask::getIsCompleted)
                .mapToInt(task -> calculateCoinsForTask(task.getTaskType()))
                .sum();

        if (quest.getIsCompleted()) {
            total += 50; // Bonus for completing entire quest
        }

        return total;
    }
}
