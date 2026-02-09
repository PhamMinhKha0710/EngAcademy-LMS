package com.englishlearn.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClassRoomResponse {

    private Long id;
    private String name;
    private String academicYear;
    private Boolean isActive;

    // School info
    private Long schoolId;
    private String schoolName;

    // Teacher info
    private Long teacherId;
    private String teacherName;

    // Summary
    private Long studentCount;
}
