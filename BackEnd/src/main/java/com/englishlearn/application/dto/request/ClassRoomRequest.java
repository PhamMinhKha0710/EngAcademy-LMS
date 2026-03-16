package com.englishlearn.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassRoomRequest {

    @NotBlank(message = "Tên lớp không được để trống")
    @Size(max = 100, message = "Tên lớp không được vượt quá 100 ký tự")
    private String name;

    private Long schoolId;

    private Long teacherId;

    @Size(max = 20, message = "Năm học không được vượt quá 20 ký tự")
    private String academicYear;

    private Boolean isActive;
}
