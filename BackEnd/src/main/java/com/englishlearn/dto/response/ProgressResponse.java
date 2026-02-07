package com.englishlearn.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProgressResponse {

    private Long id;

    // User info
    private Long userId;
    private String userName;

    // Lesson info
    private Long lessonId;
    private String lessonTitle;

    // Progress
    private Integer completionPercentage;
    private Boolean isCompleted;
    private LocalDateTime lastAccessed;
}
