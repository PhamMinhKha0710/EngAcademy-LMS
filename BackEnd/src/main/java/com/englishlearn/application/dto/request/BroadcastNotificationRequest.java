package com.englishlearn.application.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BroadcastNotificationRequest {
    private String title;
    private String message;
    private String imageUrl;
    private String scope; // ALL, ROLE, SCHOOL, CLASS, SYSTEM
    private String targetRole; // Optional (e.g., ROLE_STUDENT, ROLE_TEACHER)
    private Long schoolId; // Optional
    private Long classId; // Optional
}
