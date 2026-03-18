package com.englishlearn.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Settings + học tập cơ bản cho trang /settings của học sinh.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSettingsResponse {

    // Preferences
    private Boolean soundEffectsEnabled;
    private Boolean dailyRemindersEnabled;
    private Boolean prefersDarkMode;

    // Learning stats (minutes)
    private Integer totalStudyMinutes;
    private Integer weeklyStudyMinutes;
    private Integer weeklyGoalMinutes;
}

