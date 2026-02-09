package com.englishlearn.application.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyQuestRequest {
    private List<DailyQuestTaskRequest> tasks;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DailyQuestTaskRequest {
        private String taskType; // LEARN_VOCAB, COMPLETE_LESSON, SCORE_EXAM
        private Integer targetCount;
    }
}
