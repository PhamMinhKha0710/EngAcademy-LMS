package com.englishlearn.application.service;

import com.englishlearn.application.dto.response.BadgeProgressDTO;
import com.englishlearn.domain.entity.BadgeDefinition;
import com.englishlearn.domain.entity.UserStudyStats;
import com.englishlearn.domain.exception.ResourceNotFoundException;
import com.englishlearn.infrastructure.persistence.BadgeDefinitionRepository;
import com.englishlearn.infrastructure.persistence.UserBadgeRepository;
import com.englishlearn.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Service lấy tiến trình badge chưa đạt - currentValue, requiredValue, percentComplete.
 */
@Service
@RequiredArgsConstructor
public class BadgeProgressService {

    private final UserRepository userRepository;
    private final BadgeDefinitionRepository badgeDefinitionRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final UserStudyStatsService userStudyStatsService;

    /**
     * Lấy tiến trình của một badge cụ thể.
     */
    @Transactional(readOnly = true)
    public BadgeProgressDTO getProgress(Long userId, String badgeKey) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", userId));

        BadgeDefinition def = badgeDefinitionRepository.findByBadgeKey(badgeKey)
                .orElseThrow(() -> new ResourceNotFoundException("Badge", "badgeKey", badgeKey));

        if (userBadgeRepository.existsByUserIdAndBadgeBadgeKey(userId, badgeKey)) {
            return BadgeProgressDTO.builder()
                    .badgeKey(badgeKey)
                    .badgeName(def.getName())
                    .iconEmoji(def.getIconEmoji())
                    .currentValue(100)
                    .requiredValue(100)
                    .percentComplete(100.0)
                    .description(def.getDescription())
                    .build();
        }

        UserStudyStats stats = userStudyStatsService.refreshStats(userId);
        var values = getCurrentAndRequired(badgeKey, stats);
        int current = values[0];
        int required = values[1];
        double percent = required > 0 ? Math.min(100.0, (double) current / required * 100) : 0.0;

        return BadgeProgressDTO.builder()
                .badgeKey(badgeKey)
                .badgeName(def.getName())
                .iconEmoji(def.getIconEmoji())
                .currentValue(current)
                .requiredValue(required)
                .percentComplete(percent)
                .description(def.getDescription())
                .build();
    }

    /**
     * Lấy tiến trình tất cả badge chưa đạt (bỏ qua badge đã có, bỏ qua badge bí mật nếu chưa đạt).
     */
    @Transactional(readOnly = true)
    public List<BadgeProgressDTO> getAllProgress(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", userId));

        UserStudyStats stats = userStudyStatsService.refreshStats(userId);
        List<BadgeDefinition> allBadges = badgeDefinitionRepository.findAll();
        List<BadgeProgressDTO> result = new ArrayList<>();

        for (BadgeDefinition def : allBadges) {
            if (userBadgeRepository.existsByUserIdAndBadgeId(userId, def.getId())) continue;
            // Badge bí mật không hiện tiến trình
            if (Boolean.TRUE.equals(def.getIsSecret())) continue;

            var values = getCurrentAndRequired(def.getBadgeKey(), stats);
            int current = values[0];
            int required = values[1];
            double percent = required > 0 ? Math.min(100.0, (double) current / required * 100) : 0.0;

            result.add(BadgeProgressDTO.builder()
                    .badgeKey(def.getBadgeKey())
                    .badgeName(def.getName())
                    .iconEmoji(def.getIconEmoji())
                    .currentValue(current)
                    .requiredValue(required)
                    .percentComplete(percent)
                    .description(def.getDescription())
                    .build());
        }

        return result;
    }

    /** Trả về [currentValue, requiredValue] */
    private int[] getCurrentAndRequired(String badgeKey, UserStudyStats stats) {
        return switch (badgeKey) {
            case "streak_3" -> new int[]{n(stats.getCurrentStreak()), 3};
            case "streak_7" -> new int[]{n(stats.getCurrentStreak()), 7};
            case "streak_30" -> new int[]{n(stats.getCurrentStreak()), 30};
            case "night_owl" -> new int[]{n(stats.getLastStudyHour()) >= 21 ? 1 : 0, 1};
            case "early_bird" -> new int[]{n(stats.getEarlyMorningStreak()), 7};
            case "first_lesson" -> new int[]{n(stats.getTotalLessonsCompleted()), 1};
            case "lesson_50" -> new int[]{n(stats.getTotalLessonsCompleted()), 50};
            case "vocab_50" -> new int[]{n(stats.getTotalWordsLearned()), 50};
            case "vocab_500" -> new int[]{n(stats.getTotalWordsLearned()), 500};
            case "review_rush" -> new int[]{n(stats.getWordsReviewedToday()), 20};
            case "perfect_memory" -> new int[]{(stats.getWordRetentionRate() != null && stats.getWordRetentionRate() >= 1.0 && n(stats.getTotalWordsLearned()) >= 10) ? 1 : 0, 1};
            case "perfect_quiz" -> new int[]{n(stats.getLastQuizScore()), 100};
            case "diamond" -> new int[]{n(stats.getConsecutivePerfectQuizzes()), 5};
            case "speed_quiz" -> new int[]{(n(stats.getLastQuizScore()) >= 80 && n(stats.getLastQuizDurationSeconds()) <= 120) ? 1 : 0, 1};
            case "never_give_up" -> new int[]{Boolean.TRUE.equals(stats.getQuizRetakeAfterFail()) ? 1 : 0, 1};
            case "level_2" -> new int[]{n(stats.getCurrentLevel()), 2};
            case "level_10" -> new int[]{n(stats.getCurrentLevel()), 10};
            case "king" -> new int[]{Boolean.TRUE.equals(stats.getIsTopOfLeaderboard()) ? 1 : 0, 1};
            case "sharpshooter" -> new int[]{(int) (nD(stats.getWeeklyTasksCompletionRate()) * 100), 100};
            case "holiday_learner", "birthday_badge" -> new int[]{n(stats.getLessonsCompletedToday()), 1};
            case "good_friend" -> new int[]{n(stats.getFriendsInvited()), 3};
            case "pvp_warrior" -> new int[]{n(stats.getPvpWins()), 5};
            case "talker" -> new int[]{n(stats.getDialoguesCompleted()), 10};
            case "puzzle_master" -> new int[]{n(stats.getMiniGamesCorrect()), 10};
            default -> new int[]{0, 1};
        };
    }

    private int n(Integer v) {
        return v != null ? v : 0;
    }

    private double nD(Double v) {
        return v != null ? v : 0.0;
    }
}
