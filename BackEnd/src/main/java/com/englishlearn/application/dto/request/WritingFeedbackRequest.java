package com.englishlearn.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class WritingFeedbackRequest {

    @NotBlank
    private String contentType; // ESSAY, WRITING, CONVERSATION

    @NotNull
    private Long contentId;

    @NotBlank
    private String userText; // The user's writing to be reviewed
}
