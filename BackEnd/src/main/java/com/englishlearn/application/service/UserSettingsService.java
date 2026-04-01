package com.englishlearn.application.service;

import com.englishlearn.application.dto.request.UpdateUserSettingsRequest;
import com.englishlearn.application.dto.response.UserSettingsResponse;
import com.englishlearn.domain.entity.Progress;
import com.englishlearn.domain.entity.User;
import com.englishlearn.domain.entity.UserStudyStats;
import com.englishlearn.domain.exception.ApiException;
import com.englishlearn.infrastructure.persistence.ProgressRepository;
import com.englishlearn.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Service gom tất cả logic cho trang /settings (preferences + thống kê thời gian học).
 */
@Service
@RequiredArgsConstructor
public class UserSettingsService {

    private final UserRepository userRepository;
    private final ProgressRepository progressRepository;
    private final UserStudyStatsService userStudyStatsService;

    private static final int MINUTES_PER_LESSON = 15;
    private static final int DEFAULT_WEEKLY_GOAL_MINUTES = 5 * 60; // 5 hours / tuần

    @Transactional
    public UserSettingsResponse getSettingsForUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng"));

        // Làm mới thống kê để đảm bảo dữ liệu mới nhất
        UserStudyStats stats = userStudyStatsService.refreshStats(userId);

        int totalLessons = stats.getTotalLessonsCompleted() != null ? stats.getTotalLessonsCompleted() : 0;
        int totalStudyMinutes = totalLessons * MINUTES_PER_LESSON;

        int weeklyLessons = computeWeeklyCompletedLessons(userId);
        int weeklyStudyMinutes = weeklyLessons * MINUTES_PER_LESSON;

        return UserSettingsResponse.builder()
                .soundEffectsEnabled(user.getSoundEffectsEnabled())
                .dailyRemindersEnabled(user.getDailyRemindersEnabled())
                .prefersDarkMode(user.getPrefersDarkMode())
                .totalStudyMinutes(totalStudyMinutes)
                .weeklyStudyMinutes(weeklyStudyMinutes)
                .weeklyGoalMinutes(DEFAULT_WEEKLY_GOAL_MINUTES)
                .build();
    }

    @Transactional
    public UserSettingsResponse updateSettingsForUser(Long userId, UpdateUserSettingsRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng"));

        if (request.getSoundEffectsEnabled() != null) {
            user.setSoundEffectsEnabled(request.getSoundEffectsEnabled());
        }
        if (request.getDailyRemindersEnabled() != null) {
            user.setDailyRemindersEnabled(request.getDailyRemindersEnabled());
        }
        if (request.getPrefersDarkMode() != null) {
            user.setPrefersDarkMode(request.getPrefersDarkMode());
        }

        userRepository.save(user);
        // Trả về settings mới nhất
        return getSettingsForUser(userId);
    }

    private int computeWeeklyCompletedLessons(Long userId) {
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        List<Progress> progresses = progressRepository.findByUserId(userId);
        int count = 0;
        for (Progress p : progresses) {
            if (Boolean.TRUE.equals(p.getIsCompleted())
                    && p.getLastAccessed() != null
                    && p.getLastAccessed().isAfter(sevenDaysAgo)) {
                count++;
            }
        }
        return count;
    }
}

