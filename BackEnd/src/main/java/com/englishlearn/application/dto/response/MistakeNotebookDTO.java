package com.englishlearn.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO cho MistakeNotebook response
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MistakeNotebookDTO {

    private Long id;
    private Long userId;
    private Long vocabularyId;
    private String word; // Từ vựng
    private String meaning; // Nghĩa
    private String pronunciation; // Phiên âm
    private String audioUrl; // URL audio
    private Integer mistakeCount; // Số lần sai
    private String userRecordingUrl; // Recording của user
    private LocalDateTime addedAt;
}
