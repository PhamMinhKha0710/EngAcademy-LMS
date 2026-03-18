package com.englishlearn.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuestionRequest {

    private Long lessonId;
    private Long vocabularyId;

    @NotBlank(message = "Loại câu hỏi không được để trống")
    @Size(max = 50, message = "Loại câu hỏi không được vượt quá 50 ký tự")
    private String questionType; // MULTIPLE_CHOICE, FILL_IN_BLANK, TRUE_FALSE, ESSAY

    @NotBlank(message = "Nội dung câu hỏi không được để trống")
    private String questionText;

    @NotNull(message = "Điểm số không được để trống")
    private Integer points;

    private String explanation;

    // Options for multiple choice questions
    private List<QuestionOptionRequest> options;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionOptionRequest {
        @NotBlank(message = "Nội dung đáp án không được để trống")
        private String optionText;

        private Boolean isCorrect;
    }
}
