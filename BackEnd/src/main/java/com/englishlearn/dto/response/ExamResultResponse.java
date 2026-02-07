package com.englishlearn.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamResultResponse {

    private Long id;

    // Exam info
    private Long examId;
    private String examTitle;

    // Student info
    private Long studentId;
    private String studentName;

    // Results
    private BigDecimal score;
    private Integer correctCount;
    private Integer totalQuestions;
    private Double percentage;

    // Metadata
    private LocalDateTime submittedAt;
    private Integer violationCount;

    // Grade (A, B, C, D, F)
    private String grade;
}
