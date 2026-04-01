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
public class LearningPathResponse {

    private Long pathId;
    private String name;
    private String description;
    private String targetCefr;
    private String targetGoal;
    private Integer estimatedDays;
    private List<PathNodeResponse> nodes;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PathNodeResponse {
        private Long nodeId;
        private Long lessonId;
        private String lessonTitle;
        private String skill;
        private String cefrLevel;
        private Integer orderIndex;
        private Integer estimatedMinutes;
        private Boolean isRequired;
        private List<Long> prerequisiteNodeIds;
        private Boolean isCompleted;
        private Integer completionPercentage;
    }
}
