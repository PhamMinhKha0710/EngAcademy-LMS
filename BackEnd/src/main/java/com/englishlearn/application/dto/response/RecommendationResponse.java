package com.englishlearn.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationResponse {

    private int total;
    private List<RecommendedLesson> lessons;
    private List<String> reasons; // why each lesson was recommended

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecommendedLesson {
        private Long lessonId;
        private String title;
        private Integer difficultyLevel;
        private String topicName;
        private Integer completionPercentage;
        private Boolean isCompleted;
        private String cefrLevel;
        private List<String> tags;
        private String reason; // why this lesson
        private Double relevanceScore; // 0-1, higher = more relevant
    }
}
