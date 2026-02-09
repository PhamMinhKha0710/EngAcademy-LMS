package com.englishlearn.application.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubmitExamRequest {

    @NotNull(message = "ID bài kiểm tra không được để trống")
    private Long examId;

    @NotNull(message = "Danh sách câu trả lời không được để trống")
    private List<AnswerSubmission> answers;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnswerSubmission {
        @NotNull(message = "ID câu hỏi không được để trống")
        private Long questionId;

        // For multiple choice
        private Long selectedOptionId;

        // For essay/fill in blank
        private String answerText;
    }
}
