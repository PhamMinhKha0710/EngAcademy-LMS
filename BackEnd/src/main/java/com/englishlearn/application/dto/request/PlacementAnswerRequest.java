package com.englishlearn.application.dto.request;

import com.englishlearn.domain.enums.PlacementSkill;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PlacementAnswerRequest {

    @NotNull
    private Long questionId;

    @NotBlank
    private String selectedAnswer;

    @Min(0)
    @Max(3600)
    private Integer timeSpentSeconds;
}
