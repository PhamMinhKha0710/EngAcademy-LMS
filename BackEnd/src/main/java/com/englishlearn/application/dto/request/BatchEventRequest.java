package com.englishlearn.application.dto.request;

import com.englishlearn.domain.enums.LearningSkill;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BatchEventRequest {

    @NotNull
    private List<EventItem> events;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EventItem {

        @NotBlank
        @Pattern(regexp = "^[A-Z_]{1,50}$")
        private String eventType;

        private String contentType;

        private Long contentId;

        private LearningSkill skill;

        private String cefrLevel;

        private Boolean isCorrect;

        private Integer timeSpentSeconds;

        private String sessionId;

        @Size(max = 2000)
        private String metadata;
    }
}
