package com.englishlearn.application.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO để submit bài thi
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamSubmitDTO {

    @NotNull(message = "Exam Result ID không được để trống")
    private Long examResultId;

    private List<AnswerDTO> answers;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnswerDTO {
        private Long questionId;
        private Long selectedOptionId;
        // Backward compatibility với frontend cũ gửi mảng selectedOptionIds
        private List<Long> selectedOptionIds;
        private String textAnswer; // Cho câu hỏi tự luận
    }
}
