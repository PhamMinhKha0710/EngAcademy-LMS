package com.englishlearn.presentation.controller;

import com.englishlearn.application.dto.request.BroadcastNotificationRequest;
import com.englishlearn.application.dto.response.ApiResponse;
import com.englishlearn.application.dto.response.NotificationResponse;
import com.englishlearn.application.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "API quản lý thông báo")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/user/{userId}")
    @Operation(summary = "Lấy danh sách thông báo của người dùng")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getByUserId(@PathVariable Long userId) {
        List<NotificationResponse> notifications = notificationService.getNotificationsByUserId(userId);
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    @GetMapping("/user/{userId}/unread-count")
    @Operation(summary = "Lấy số lượng thông báo chưa đọc")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(@PathVariable Long userId) {
        long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Đánh dấu thông báo là đã đọc")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/broadcast")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL')")
    @Operation(summary = "Gửi thông báo đến một nhóm người dùng (Toàn bộ, Vai trò, Trường học, Lớp học)")
    public ResponseEntity<ApiResponse<Void>> broadcastNotification(@RequestBody BroadcastNotificationRequest request) {
        notificationService.broadcastNotification(request);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/send/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'SCHOOL', 'TEACHER')")
    @Operation(summary = "Gửi thông báo trực tiếp cho một người dùng")
    public ResponseEntity<ApiResponse<Void>> sendNotification(
            @PathVariable Long userId,
            @RequestParam String title,
            @RequestParam String message,
            @RequestParam(required = false) String imageUrl) {
        notificationService.sendNotification(userId, title, message, imageUrl);
        return ResponseEntity.ok(ApiResponse.success("Gửi thông báo thành công", null));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Xóa thông báo")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok(ApiResponse.success(null));
    }
}
