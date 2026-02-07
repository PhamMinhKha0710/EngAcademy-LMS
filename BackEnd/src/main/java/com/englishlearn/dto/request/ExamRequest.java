package com.englishlearn.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExamRequest {

    @NotBlank(message = "Tiêu đề bài kiểm tra không được để trống")
    @Size(max = 200, message = "Tiêu đề không được vượt quá 200 ký tự")
    private String title;

    @NotNull(message = "Lớp học không được để trống")
    private Long classId;

    @NotNull(message = "Thời gian bắt đầu không được để trống")
    private LocalDateTime startTime;

    @NotNull(message = "Thời gian kết thúc không được để trống")
    private LocalDateTime endTime;

    @NotNull(message = "Thời gian làm bài không được để trống")
    @Min(value = 1, message = "Thời gian làm bài tối thiểu 1 phút")
    @Max(value = 180, message = "Thời gian làm bài tối đa 180 phút")
    private Integer durationMinutes;

    private Boolean shuffleQuestions;
    private Boolean shuffleAnswers;
    private Boolean antiCheatEnabled;

    private List<Long> questionIds;
}
