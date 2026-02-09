package com.englishlearn.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonResponse {
    private Long id;
    private String title;
    private Long topicId;
    private String topicName;
    private String contentHtml;
    private String audioUrl;
    private String videoUrl;
    private Integer difficultyLevel;
    private Integer orderIndex;
    private Boolean isPublished;
    private Integer vocabularyCount;
    private Integer questionCount;
}
