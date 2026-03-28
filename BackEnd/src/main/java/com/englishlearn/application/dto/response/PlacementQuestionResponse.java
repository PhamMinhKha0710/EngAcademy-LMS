package com.englishlearn.application.dto.response;

import com.englishlearn.domain.enums.PlacementSkill;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlacementQuestionResponse {
    private Long questionId;
    private PlacementSkill skill;
    private String questionText;
    private List<String> options;
    private int questionIndex;
    private int totalQuestions;
    private String sessionId;
}
