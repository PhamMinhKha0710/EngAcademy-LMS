package com.englishlearn.application.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SrsReviewRequest {

    @NotNull
    private Long vocabularyId;

    @NotNull(message = "Quality không được để trống (0–5)")
    @Min(0)
    @Max(5)
    private Integer quality; // SM-2 quality 0–5
}
