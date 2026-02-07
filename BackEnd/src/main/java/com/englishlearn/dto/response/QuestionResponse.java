package com.englishlearn.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionResponse {

    private Long id;
    private String questionType;
    private String questionText;
    private Integer points;
    private String explanation;

    // Lesson info
    private Long lessonId;
    private String lessonTitle;

    // Options for multiple choice
    private List<QuestionOptionResponse> options;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionOptionResponse {
        private Long id;
        private String optionText;
        private Boolean isCorrect; // Only shown to teachers
    }
}
