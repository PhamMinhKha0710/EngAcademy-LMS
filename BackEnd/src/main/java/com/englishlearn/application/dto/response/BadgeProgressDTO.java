package com.englishlearn.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO tiến trình badge chưa đạt - hiển thị current/required và phần trăm hoàn thành.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BadgeProgressDTO {
    private String badgeKey;
    private String badgeName;
    private String iconEmoji;
    private int currentValue;
    private int requiredValue;
    /** 0–100 */
    private double percentComplete;
    private String description;
}
