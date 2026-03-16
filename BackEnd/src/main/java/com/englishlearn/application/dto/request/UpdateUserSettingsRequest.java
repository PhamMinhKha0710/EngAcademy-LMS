package com.englishlearn.application.dto.request;

import lombok.Data;

/**
 * Payload cập nhật tuỳ chọn người dùng trên trang /settings.
 */
@Data
public class UpdateUserSettingsRequest {

    private Boolean soundEffectsEnabled;
    private Boolean dailyRemindersEnabled;
    private Boolean prefersDarkMode;
}

