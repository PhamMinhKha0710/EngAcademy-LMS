package com.englishlearn.application.dto.response;

import com.englishlearn.domain.enums.BadgeDifficulty;
import com.englishlearn.domain.enums.BadgeGroup;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO cho badge (định nghĩa + thời điểm đạt nếu user đã có).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BadgeDTO {
    private Long id;
    private String badgeKey;
    private String name;
    private String description;
    private String iconEmoji;
    private BadgeGroup groupName;
    private BadgeDifficulty difficulty;
    private Boolean isSecret;
    /** Null nếu user chưa đạt badge này */
    private LocalDateTime earnedAt;
}
