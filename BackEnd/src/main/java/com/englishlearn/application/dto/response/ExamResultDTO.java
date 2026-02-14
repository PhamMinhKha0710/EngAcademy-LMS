package com.englishlearn.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO cho kết quả bài thi
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamResultDTO {

    private Long id;
    private Long examId;
    private String examTitle;
    private Long studentId;
    private String studentName;
    private BigDecimal score;
    private Integer correctCount;
    private Integer totalQuestions;
    private Double percentage;
    private String grade;
    private LocalDateTime submittedAt;
    private Integer violationCount;
    private String status; // COMPLETED, LATE, FLAGGED
}
