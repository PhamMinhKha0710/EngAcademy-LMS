package com.englishlearn.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO cho câu hỏi trong bài thi (đã shuffle nếu cần)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamQuestionDTO {

    private Long id;
    private String questionText;
    private String questionType;
    private Integer points;
    private List<QuestionOptionDTO> options;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestionOptionDTO {
        private Long id;
        private String optionText;
        // isCorrect không được gửi về cho học sinh
    }
}
