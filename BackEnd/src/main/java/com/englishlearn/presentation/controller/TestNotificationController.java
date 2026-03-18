package com.englishlearn.presentation.controller;

import com.englishlearn.application.dto.response.ApiResponse;
import com.englishlearn.application.service.NotificationService;
import com.englishlearn.domain.entity.Notification;
import com.englishlearn.domain.entity.User;
import com.englishlearn.infrastructure.persistence.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/test-notifications")
@RequiredArgsConstructor
@Tag(name = "Test Notifications", description = "API để test thông báo real-time")
public class TestNotificationController {

        private final NotificationService notificationService;
        private final UserRepository userRepository;

        @PostMapping("/send/{userId}")
        @Operation(summary = "Gửi thông báo test cho user cụ thể")
        public ResponseEntity<ApiResponse<String>> sendTest(
                        @PathVariable Long userId,
                        @RequestParam String title,
                        @RequestParam String message) {

                User user = userRepository.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

                Notification notification = Notification.builder()
                                .user(user)
                                .title(title)
                                .message(message)
                                .isRead(false)
                                .build();

                notificationService.sendNotification(notification);
                return ResponseEntity.ok(ApiResponse.success("Test notification sent to user " + userId));
        }
}
