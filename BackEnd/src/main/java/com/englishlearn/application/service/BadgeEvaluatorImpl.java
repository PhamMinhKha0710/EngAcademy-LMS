package com.englishlearn.application.service;

import com.englishlearn.application.dto.response.BadgeDTO;
import com.englishlearn.domain.entity.BadgeDefinition;
import com.englishlearn.domain.entity.User;
import com.englishlearn.domain.entity.UserBadge;
import com.englishlearn.domain.entity.UserStudyStats;
import com.englishlearn.domain.exception.ResourceNotFoundException;
import com.englishlearn.infrastructure.persistence.BadgeDefinitionRepository;
import com.englishlearn.infrastructure.persistence.UserBadgeRepository;
import com.englishlearn.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Implementation của BadgeEvaluator - kiểm tra 24 badge theo rule và trao badge mới.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BadgeEvaluatorImpl implements BadgeEvaluator {

    private final UserRepository userRepository;
    private final BadgeDefinitionRepository badgeDefinitionRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final UserStudyStatsService userStudyStatsService;
    private final VietHolidayService vietHolidayService;
    private final com.englishlearn.application.event.BadgeEventPublisher badgeEventPublisher;

    @Override
    @Transactional
    public List<BadgeDTO> checkAndAward(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", userId));

        // Làm mới stats trước khi đánh giá
        UserStudyStats stats = userStudyStatsService.refreshStats(userId);

        List<BadgeDTO> newlyEarned = new ArrayList<>();
        List<BadgeDefinition> allBadges = badgeDefinitionRepository.findAll();

        for (BadgeDefinition def : allBadges) {
            // Bỏ qua nếu user đã có badge này
            if (userBadgeRepository.existsByUserIdAndBadgeId(userId, def.getId())) {
                continue;
            }

            if (evaluateBadge(def, stats, user)) {
                UserBadge ub = UserBadge.builder()
                        .user(user)
                        .badge(def)
                        .build();
                userBadgeRepository.save(ub);
                newlyEarned.add(mapToDTO(def, ub.getEarnedAt()));
                log.info("Awarded badge {} to user {}", def.getBadgeKey(), userId);

                badgeEventPublisher.publishBadgeEarned(userId, def);
            }
        }

        return newlyEarned;
    }

    /**
     * Đánh giá từng badge theo rule.
     */
    private boolean evaluateBadge(BadgeDefinition def, UserStudyStats stats, User user) {
        return switch (def.getBadgeKey()) {
            case "streak_3" -> (stats.getCurrentStreak() != null && stats.getCurrentStreak() >= 3);
            case "streak_7" -> (stats.getCurrentStreak() != null && stats.getCurrentStreak() >= 7);
            case "streak_30" -> (stats.getCurrentStreak() != null && stats.getCurrentStreak() >= 30);
            case "night_owl" -> (stats.getLastStudyHour() != null && stats.getLastStudyHour() >= 21);
            case "early_bird" -> (stats.getEarlyMorningStreak() != null && stats.getEarlyMorningStreak() >= 7);
            case "first_lesson" -> (stats.getTotalLessonsCompleted() != null && stats.getTotalLessonsCompleted() == 1);
            case "lesson_50" -> (stats.getTotalLessonsCompleted() != null && stats.getTotalLessonsCompleted() >= 50);
            case "vocab_50" -> (stats.getTotalWordsLearned() != null && stats.getTotalWordsLearned() >= 50);
            case "vocab_500" -> (stats.getTotalWordsLearned() != null && stats.getTotalWordsLearned() >= 500);
            case "review_rush" -> (stats.getWordsReviewedToday() != null && stats.getWordsReviewedToday() >= 20);
            case "perfect_memory" -> (stats.getWordRetentionRate() != null && stats.getWordRetentionRate() >= 1.0
                    && stats.getTotalWordsLearned() != null && stats.getTotalWordsLearned() >= 10);
            case "perfect_quiz" -> (stats.getLastQuizScore() != null && stats.getLastQuizScore() == 100);
            case "diamond" -> (stats.getConsecutivePerfectQuizzes() != null && stats.getConsecutivePerfectQuizzes() >= 5);
            case "speed_quiz" -> (stats.getLastQuizScore() != null && stats.getLastQuizScore() >= 80
                    && stats.getLastQuizDurationSeconds() != null && stats.getLastQuizDurationSeconds() <= 120);
            case "never_give_up" -> Boolean.TRUE.equals(stats.getQuizRetakeAfterFail());
            case "level_2" -> (stats.getCurrentLevel() != null && stats.getCurrentLevel() >= 2);
            case "level_10" -> (stats.getCurrentLevel() != null && stats.getCurrentLevel() >= 10);
            case "king" -> Boolean.TRUE.equals(stats.getIsTopOfLeaderboard());
            case "sharpshooter" -> (stats.getWeeklyTasksCompletionRate() != null && stats.getWeeklyTasksCompletionRate() >= 1.0);
            case "holiday_learner" -> vietHolidayService.isHoliday(LocalDate.now())
                    && (stats.getLessonsCompletedToday() != null && stats.getLessonsCompletedToday() >= 1);
            case "birthday_badge" -> isBirthday(user) && (stats.getLessonsCompletedToday() != null && stats.getLessonsCompletedToday() >= 1);
            case "good_friend" -> (stats.getFriendsInvited() != null && stats.getFriendsInvited() >= 3);
            case "pvp_warrior" -> (stats.getPvpWins() != null && stats.getPvpWins() >= 5);
            case "talker" -> (stats.getDialoguesCompleted() != null && stats.getDialoguesCompleted() >= 10);
            case "puzzle_master" -> (stats.getMiniGamesCorrect() != null && stats.getMiniGamesCorrect() >= 10);
            default -> false;
        };
    }

    private boolean isBirthday(User user) {
        if (user.getDateOfBirth() == null) return false;
        LocalDate today = LocalDate.now();
        return user.getDateOfBirth().getMonthValue() == today.getMonthValue()
                && user.getDateOfBirth().getDayOfMonth() == today.getDayOfMonth();
    }

    private BadgeDTO mapToDTO(BadgeDefinition def, java.time.LocalDateTime earnedAt) {
        return BadgeDTO.builder()
                .id(def.getId())
                .badgeKey(def.getBadgeKey())
                .name(def.getName())
                .description(def.getDescription())
                .iconEmoji(def.getIconEmoji())
                .groupName(def.getGroupName())
                .difficulty(def.getDifficulty())
                .isSecret(def.getIsSecret())
                .earnedAt(earnedAt)
                .build();
    }
}
