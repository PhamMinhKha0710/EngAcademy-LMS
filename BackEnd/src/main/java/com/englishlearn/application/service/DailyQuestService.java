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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DailyQuestService {

    private final DailyQuestRepository dailyQuestRepository;
    private final DailyQuestTaskRepository dailyQuestTaskRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

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
        }

        return mapToResponse(quest);
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

        // Send notification
        notificationService.sendNotification(userId, "Nhiệm vụ hoàn tất!", "Well done! Bạn đã hoàn thành nhiệm vụ của ngày hôm nay", null);

        log.info("Completed daily quest for user: {}", userId);
        return mapToResponse(quest);
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
