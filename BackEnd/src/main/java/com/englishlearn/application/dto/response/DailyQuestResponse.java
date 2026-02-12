package com.englishlearn.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyQuestResponse {
    private Long id;
    private LocalDate questDate;
    private Boolean isCompleted;
    private List<DailyQuestTaskResponse> tasks;
    private Integer totalCoins;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailyQuestTaskResponse {
        private Long id;
        private String taskType;
        private Integer targetCount;
        private Integer currentCount;
        private Boolean isCompleted;
        private Integer coins;
    }
}
