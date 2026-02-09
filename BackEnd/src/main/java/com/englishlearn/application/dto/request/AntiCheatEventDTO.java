package com.englishlearn.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO để nhận sự kiện anti-cheat từ frontend
 * Các loại sự kiện: TAB_SWITCH, COPY, PASTE, BLUR, RIGHT_CLICK, DEV_TOOLS
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AntiCheatEventDTO {

    @NotNull(message = "Exam Result ID không được để trống")
    private Long examResultId;

    @NotBlank(message = "Loại sự kiện không được để trống")
    private String eventType; // TAB_SWITCH, COPY, PASTE, BLUR, RIGHT_CLICK, DEV_TOOLS

    private LocalDateTime timestamp;

    private String details; // Thông tin bổ sung (ví dụ: độ dài văn bản copy)
}
