package com.englishlearn.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonRequest {
    @NotBlank(message = "Tiêu đề không được để trống")
    @Size(max = 200, message = "Tiêu đề tối đa 200 ký tự")
    private String title;

    private Long topicId;

    private String contentHtml;

    private String grammarHtml;

    private String audioUrl;

    private String videoUrl;

    private Integer difficultyLevel;

    private Integer orderIndex;

    private Boolean isPublished;
}
