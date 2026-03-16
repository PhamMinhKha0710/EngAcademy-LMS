package com.englishlearn.application.service;

import com.englishlearn.domain.entity.User;
import com.englishlearn.domain.entity.UserStudyStats;
import com.englishlearn.domain.entity.VocabStatus;
import com.englishlearn.domain.exception.ResourceNotFoundException;
import com.englishlearn.infrastructure.persistence.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Service tổng hợp thống kê học tập từ User, Progress, UserVocabulary, ExamResult.
 * Dùng cho BadgeEvaluator kiểm tra điều kiện trao badge.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class UserStudyStatsService {

    private final UserRepository userRepository;
    private final UserStudyStatsRepository userStudyStatsRepository;
    private final ProgressRepository progressRepository;
    private final UserVocabularyRepository userVocabularyRepository;
    private final ExamResultRepository examResultRepository;
    private final DailyQuestRepository dailyQuestRepository;
    private final DailyQuestTaskRepository dailyQuestTaskRepository;
    private final LeaderboardService leaderboardService;

    /**
     * Làm mới hoặc tạo UserStudyStats cho user từ dữ liệu hiện có.
     */
    @Transactional
    public UserStudyStats refreshStats(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", userId));

        UserStudyStats stats = userStudyStatsRepository.findByUserId(userId)
                .orElseGet(() -> UserStudyStats.builder()
                        .user(user)
                        .build());

        LocalDate today = LocalDate.now();

        // Streak từ User.streakDays (đơn giản hóa - coi là currentStreak)
        int streak = user.getStreakDays() != null ? user.getStreakDays() : 0;
        stats.setCurrentStreak(streak);
        stats.setLongestStreak(Math.max(stats.getLongestStreak() != null ? stats.getLongestStreak() : 0, streak));

        // Lessons
        Long completedLessons = progressRepository.countCompletedByUserId(userId);
        stats.setTotalLessonsCompleted(completedLessons != null ? completedLessons.intValue() : 0);

        var startOfDay = today.atStartOfDay();
        var endOfDay = today.plusDays(1).atStartOfDay();
        Long completedToday = progressRepository.countCompletedTodayByUserId(userId, startOfDay, endOfDay);
        stats.setLessonsCompletedToday(completedToday != null ? completedToday.intValue() : 0);

        // Words
        Long masteredCount = userVocabularyRepository.countByUserIdAndStatus(userId, VocabStatus.MASTERED);
        stats.setTotalWordsLearned(masteredCount != null ? masteredCount.intValue() : 0);

        Long reviewedToday = userVocabularyRepository.countReviewedTodayByUserId(userId, startOfDay, endOfDay);
        stats.setWordsReviewedToday(reviewedToday != null ? reviewedToday.intValue() : 0);

        // Word retention: mastered / (learned có review) - đơn giản: nếu có >= 10 từ và tất cả mastered thì 1.0
        long totalLearned = userVocabularyRepository.countByUserIdAndStatus(userId, VocabStatus.LEARNING)
                + (masteredCount != null ? masteredCount : 0);
        double retention = (totalLearned > 0 && masteredCount != null)
                ? (double) masteredCount / totalLearned
                : 0.0;
        stats.setWordRetentionRate(retention);

        // Quizzes từ ExamResult
        List<com.englishlearn.domain.entity.ExamResult> results = examResultRepository.findByStudentIdOrderBySubmittedAtDesc(userId);
        stats.setTotalQuizzesTaken(results.size());

        // Đếm số bài thi 100 điểm liên tiếp từ mới nhất
        int consecutivePerfect = 0;
        for (com.englishlearn.domain.entity.ExamResult er : results) {
            if (er.getSubmittedAt() == null) continue;
            if (er.getScore() != null && er.getScore().intValue() == 100) {
                consecutivePerfect++;
            } else {
                break;
            }
        }
        stats.setConsecutivePerfectQuizzes(consecutivePerfect);
        if (!results.isEmpty() && results.get(0).getSubmittedAt() != null) {
            stats.setLastQuizScore(results.get(0).getScore() != null ? results.get(0).getScore().intValue() : 0);
        }
        // lastQuizDurationSeconds, quizRetakeAfterFail - chưa có trong ExamResult, giữ giá trị hiện tại hoặc mặc định

        // lastStudyDate, lastStudyHour - từ Progress.lastAccessed hoặc UserVocabulary.lastReviewedAt
        LocalDateTime lastActivity = getLastStudyDateTime(userId);
        if (lastActivity != null) {
            stats.setLastStudyDate(lastActivity.toLocalDate());
            stats.setLastStudyHour(lastActivity.getHour());
        }

        // earlyMorningStreak - đếm ngày học trước 7h liên tiếp (đơn giản: 0 nếu chưa có logic)
        stats.setEarlyMorningStreak(stats.getEarlyMorningStreak() != null ? stats.getEarlyMorningStreak() : 0);

        // currentLevel - từ coins/100 (đơn giản)
        int level = user.getCoins() != null ? Math.max(1, user.getCoins() / 100 + 1) : 1;
        stats.setCurrentLevel(level);

        // weeklyTasksCompletionRate - từ DailyQuest 7 ngày gần nhất
        double weeklyRate = computeWeeklyTasksCompletionRate(userId, today);
        stats.setWeeklyTasksCompletionRate(weeklyRate);

        // isTopOfLeaderboard
        boolean isTop = false;
        if (user.getSchool() != null && user.getSchool().getId() != null) {
            try {
                var rankResp = leaderboardService.getUserRank(userId, user.getSchool().getId());
                isTop = rankResp != null && rankResp.getRank() != null && rankResp.getRank() == 1;
            } catch (Exception e) {
                log.debug("Could not get leaderboard rank for user {}: {}", userId, e.getMessage());
            }
        }
        stats.setIsTopOfLeaderboard(isTop);

        return userStudyStatsRepository.save(stats);
    }

    private LocalDateTime getLastStudyDateTime(Long userId) {
        var progressList = progressRepository.findByUserId(userId);
        LocalDateTime last = null;
        for (var p : progressList) {
            if (p.getLastAccessed() != null && (last == null || p.getLastAccessed().isAfter(last))) {
                last = p.getLastAccessed();
            }
        }
        var uvList = userVocabularyRepository.findMasteredByUserId(userId);
        for (var uv : uvList) {
            if (uv.getLastReviewedAt() != null && (last == null || uv.getLastReviewedAt().isAfter(last))) {
                last = uv.getLastReviewedAt();
            }
        }
        return last;
    }

    private double computeWeeklyTasksCompletionRate(Long userId, LocalDate today) {
        LocalDate start = today.minusDays(6);
        User u = userRepository.findById(userId).orElse(null);
        if (u == null) return 0.0;
        var quests = dailyQuestRepository.findByUserOrderByQuestDateDesc(u);
        if (quests == null || quests.isEmpty()) return 0.0;

        int totalTasks = 0;
        int completedTasks = 0;
        for (var q : quests) {
            if (q.getQuestDate().isBefore(start)) break;
            var tasks = dailyQuestTaskRepository.findByDailyQuest(q);
            for (var t : tasks) {
                totalTasks++;
                if (Boolean.TRUE.equals(t.getIsCompleted())) completedTasks++;
            }
        }
        return totalTasks > 0 ? (double) completedTasks / totalTasks : 0.0;
    }
}
