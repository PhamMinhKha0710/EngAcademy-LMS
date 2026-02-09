package com.englishlearn.application.service;

import com.englishlearn.application.dto.response.NotificationResponse;
import com.englishlearn.domain.entity.Notification;
import com.englishlearn.domain.exception.ResourceNotFoundException;
import com.englishlearn.infrastructure.persistence.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional(readOnly = true)
    public List<NotificationResponse> getNotificationsByUserId(Long userId) {
        return notificationRepository.findAllByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void sendNotification(Notification notification) {
        Notification saved = notificationRepository.save(notification);
        NotificationResponse response = mapToResponse(saved);

        String destination = "/topic/notifications/" + notification.getUser().getUsername();

        // Push notification to specific topic for the user
        messagingTemplate.convertAndSend(destination, response);
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
