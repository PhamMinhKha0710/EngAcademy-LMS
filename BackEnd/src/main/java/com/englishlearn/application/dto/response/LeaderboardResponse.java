package com.englishlearn.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LeaderboardResponse {
    private Integer rank;
    private Long userId;
    private String username;
    private String fullName;
    private String avatarUrl;
    private Integer totalCoins;
    private Integer streakDays;
    private Double averageScore;
}
