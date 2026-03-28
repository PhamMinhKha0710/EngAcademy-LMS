package com.englishlearn.application.dto.request;

import com.englishlearn.domain.enums.CefrLevel;
import com.englishlearn.domain.enums.LearningGoal;
import com.englishlearn.domain.enums.LearningSkill;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.Set;

@Data
public class UpdateLearningProfileRequest {

    private CefrLevel grammarLevel;
    private CefrLevel vocabularyLevel;
    private CefrLevel readingLevel;
    private CefrLevel listeningLevel;
    private LearningGoal primaryGoal;

    @Min(5)
    @Max(120)
    private Integer dailyTargetMinutes;

    private Set<String> preferredTopics;
}
