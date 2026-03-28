package com.englishlearn.application.dto.response;

import com.englishlearn.domain.enums.CefrLevel;
import com.englishlearn.domain.enums.LearningGoal;
import com.englishlearn.domain.enums.LearningSkill;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LearningProfileResponse {

    private Long id;
    private Long userId;

    private CefrLevel grammarLevel;
    private CefrLevel vocabularyLevel;
    private CefrLevel readingLevel;
    private CefrLevel listeningLevel;
    private CefrLevel overallLevel;

    private LearningGoal primaryGoal;
    private Integer dailyTargetMinutes;
    private Set<String> preferredTopics;
    private Set<LearningSkill> weakSkills;

    private Boolean onboardingCompleted;
    private Boolean hasCompletedOnboarding;
}
