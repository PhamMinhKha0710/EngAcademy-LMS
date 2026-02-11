package com.englishlearn.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for anti-cheat event (response).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AntiCheatEventResponse {

    private Long id;
    private Long examResultId;
    private String eventType;
    private LocalDateTime eventTime;
    private String details;
}
