package com.englishlearn.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VocabularyResponse {

    private Long id;
    private String word;
    private String pronunciation;
    private String meaning;
    private String exampleSentence;
    private String imageUrl;
    private String audioUrl;

    // Lesson info
    private Long lessonId;
    private String lessonTitle;
}
