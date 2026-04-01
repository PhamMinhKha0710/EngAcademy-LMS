package com.englishlearn.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SrsDueResponse {

    private Long vocabularyId;
    private Long grammarId;
    private String contentType; // "VOCABULARY" or "GRAMMAR"
    private String word;
    private String pronunciation;
    private String meaning;
    private String exampleSentence;
    private String audioUrl;
    private Double easinessFactor;
    private Integer intervalDays;
    private Integer repetitions;
    private LocalDate nextReviewAt;
    private LocalDateTime lastReviewedAt;
    private Integer overdueDays;

    private Integer totalDue;
    private Integer totalReviewedToday;
    private List<SrsDueResponse> items;
}
