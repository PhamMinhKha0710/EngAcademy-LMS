package com.englishlearn.application.dto.response;

import com.englishlearn.domain.enums.CefrLevel;
import com.englishlearn.domain.enums.PlacementSkill;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlacementResultResponse {

    private String sessionId;
    private boolean completed;

    private Map<PlacementSkill, CefrLevel> skillLevels;

    private CefrLevel grammarLevel;
    private CefrLevel vocabularyLevel;
    private CefrLevel readingLevel;
    private CefrLevel listeningLevel;
    private CefrLevel overallLevel;

    private CefrLevel effectiveStartLevel;

    private Map<PlacementSkill, Integer> correctCounts;
    private Map<PlacementSkill, Integer> totalCounts;
}
