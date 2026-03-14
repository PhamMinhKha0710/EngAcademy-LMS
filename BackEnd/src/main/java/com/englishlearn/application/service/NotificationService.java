package com.englishlearn.application.service;

import com.englishlearn.application.dto.request.BroadcastNotificationRequest;
import com.englishlearn.application.dto.response.NotificationResponse;
import com.englishlearn.domain.entity.Notification;
import com.englishlearn.domain.entity.User;
import com.englishlearn.domain.exception.ResourceNotFoundException;
import com.englishlearn.infrastructure.persistence.NotificationRepository;
import com.englishlearn.infrastructure.persistence.StudentClassRepository;
import com.englishlearn.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final StudentClassRepository studentClassRepository;
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

    @Transactional
    public void broadcastNotification(BroadcastNotificationRequest request) {
        List<User> targetUsers = new ArrayList<>();

        switch (request.getScope().toUpperCase()) {
            case "ALL":
                targetUsers = userRepository.findAll();
                break;
            case "ROLE":
                if (request.getRoleName() != null) {
                    targetUsers = userRepository.findAllByRolesName(request.getRoleName());
                }
                break;
            case "SCHOOL":
                if (request.getSchoolId() != null) {
                    targetUsers = userRepository.findAllBySchoolId(request.getSchoolId());
                }
                break;
            case "CLASS":
                if (request.getClassId() != null) {
                    targetUsers = studentClassRepository.findActiveStudentsByClassId(request.getClassId())
                            .stream()
                            .map(sc -> sc.getStudent())
                            .collect(Collectors.toList());
                }
                break;
        }

        for (User user : targetUsers) {
            Notification notification = Notification.builder()
                    .user(user)
                    .title(request.getTitle())
                    .message(request.getMessage())
                    .isRead(false)
                    .build();
            sendNotification(notification);
        }
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
