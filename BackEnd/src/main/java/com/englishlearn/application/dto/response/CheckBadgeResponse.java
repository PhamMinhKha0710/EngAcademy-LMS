package com.englishlearn.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response khi gọi POST /api/v1/badges/check/{id} - trigger kiểm tra và trao badge.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CheckBadgeResponse {
    /** Danh sách badge vừa đạt được trong lần check này */
    private List<BadgeDTO> newlyEarnedBadges;
    /** Tổng số badge user đã có */
    private int totalBadgesEarned;
    private String message;
}
