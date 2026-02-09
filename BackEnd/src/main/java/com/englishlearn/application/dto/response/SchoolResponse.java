package com.englishlearn.application.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SchoolResponse {

    private Long id;
    private String name;
    private String address;
    private String phone;
    private String email;
    private Boolean isActive;
    private LocalDate trialEndDate;
    private LocalDateTime createdAt;

    // Summary counts
    private Long teacherCount;
    private Long studentCount;
    private Long classCount;
}
