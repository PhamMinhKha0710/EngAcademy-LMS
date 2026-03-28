package com.englishlearn.application.dto.request;

import com.englishlearn.domain.enums.LearningGoal;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.util.Set;

@Data
public class CompleteOnboardingRequest {

    @NotNull
    private LearningGoal primaryGoal;

    @Min(1)
    @Max(300)
    private Integer dailyTargetMinutes;

    @ValidPreferredTopics
    private Set<String> preferredTopics;
}
