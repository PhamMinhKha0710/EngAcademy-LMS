package com.englishlearn.application.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO để thêm lỗi sai vào sổ tay
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MistakeNotebookRequest {

    /**
     * userId được backend tự suy ra từ access token ở Controller.
     * Giữ field này để tương thích ngược với các luồng nội bộ.
     */
    private Long userId;

    @NotNull(message = "Vocabulary ID không được để trống")
    private Long vocabularyId;

    private String userRecordingUrl; // URL recording của user (optional)
}
