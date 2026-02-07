package com.englishlearn.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VocabularyRequest {

    @NotNull(message = "Bài học không được để trống")
    private Long lessonId;

    @NotBlank(message = "Từ vựng không được để trống")
    private String word;

    private String pronunciation;

    @NotBlank(message = "Nghĩa của từ không được để trống")
    private String meaning;

    private String exampleSentence;

    private String imageUrl;

    private String audioUrl;
}
