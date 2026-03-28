package com.englishlearn.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlacementAnswerAccepted {

    private boolean nextQuestionAvailable;
    private PlacementResultResponse result;

    public static PlacementAnswerAccepted moreQuestions() {
        return new PlacementAnswerAccepted(true, null);
    }

    public static PlacementAnswerAccepted finished(PlacementResultResponse r) {
        return new PlacementAnswerAccepted(false, r);
    }
}
