package com.englishlearn.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO cho bài thi khi học sinh làm bài (có shuffle)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamTakeDTO {

    private Long id;
    private String title;
    private Integer durationMinutes;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Boolean antiCheatEnabled;
    private Long examResultId; // ID kết quả thi để gửi events anti-cheat
    private List<ExamQuestionDTO> questions;
    private Integer totalQuestions;
}
