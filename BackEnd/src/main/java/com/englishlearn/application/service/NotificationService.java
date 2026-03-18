package com.englishlearn.application.service;

import com.englishlearn.application.dto.request.BroadcastNotificationRequest;
import com.englishlearn.application.dto.response.NotificationResponse;
import com.englishlearn.domain.entity.Notification;
import com.englishlearn.domain.entity.User;
import com.englishlearn.domain.exception.ResourceNotFoundException;
import com.englishlearn.infrastructure.persistence.ClassRoomRepository;
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
    private final ClassRoomRepository classRoomRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public Long getUserIdByUsername(String username) {
        return userRepository.findByUsername(username)
                .map(User::getId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
    }

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
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    @Transactional
    public void deleteNotification(Long id) {
        if (!notificationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Notification not found with id: " + id);
        }
        notificationRepository.deleteById(id);
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
    public void sendNotification(Long userId, String title, String message, String imageUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .isRead(false)
                .imageUrl(imageUrl)
                .build();
        sendNotification(notification);
    }

    @Transactional
    public void broadcastNotification(BroadcastNotificationRequest request) {
        List<User> targetUsers = new ArrayList<>();

        if ("SYSTEM".equalsIgnoreCase(request.getScope())) {
            targetUsers.addAll(userRepository.findAllByRolesName("ROLE_SCHOOL"));
        } else {
            switch (request.getScope().toUpperCase()) {
                case "ALL":
                    targetUsers.addAll(userRepository.findAll());
                    break;
                case "ROLE":
                    if (request.getTargetRole() != null) {
                        targetUsers.addAll(userRepository.findAllByRolesName(request.getTargetRole()));
                    }
                    break;
                case "SCHOOL":
                    if (request.getSchoolId() != null) {
                        targetUsers.addAll(userRepository.findAllBySchoolId(request.getSchoolId()));
                    }
                    break;
                case "CLASS":
                    if (request.getClassId() != null) {
                        // Add students
                        List<User> students = studentClassRepository.findActiveStudentsByClassId(request.getClassId())
                                .stream()
                                .map(sc -> sc.getStudent())
                                .collect(Collectors.toList());
                        targetUsers.addAll(students);

                        // Add teacher
                        classRoomRepository.findById(request.getClassId())
                                .ifPresent(cr -> {
                                    if (cr.getTeacher() != null) {
                                        targetUsers.add(cr.getTeacher());
                                    }
                                });
                    }
                    break;
            }
        }

        for (User user : targetUsers) {
            Notification notification = Notification.builder()
                    .user(user)
                    .title(request.getTitle())
                    .message(request.getMessage())
                    .isRead(false)
                    .imageUrl(request.getImageUrl())
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
                .imageUrl(notification.getImageUrl())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
