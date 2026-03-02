package com.englishlearn.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamResponse {

    private Long id;
    private String title;
    private String status;
    private Boolean scorePublished;

    // Class info
    private Long classId;
    private String className;

    // Teacher info
    private Long teacherId;
    private String teacherName;

    // Time settings
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer durationMinutes;

    // Options
    private Boolean shuffleQuestions;
    private Boolean shuffleAnswers;
    private Boolean antiCheatEnabled;

    // Stats
    private Integer questionCount;
    private Integer totalPoints;
    private Long submittedCount;
    private Double averageScore;

    // Questions (optional, for detailed view)
    private List<QuestionResponse> questions;
}
