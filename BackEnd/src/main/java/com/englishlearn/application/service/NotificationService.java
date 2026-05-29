package com.englishlearn.application.service;

import com.englishlearn.application.dto.request.BroadcastNotificationRequest;
import com.englishlearn.application.dto.response.NotificationResponse;
import com.englishlearn.domain.entity.ClassRoom;
import com.englishlearn.domain.entity.Notification;
import com.englishlearn.domain.entity.User;
import com.englishlearn.domain.exception.ResourceNotFoundException;
import com.englishlearn.infrastructure.persistence.ClassRoomRepository;
import com.englishlearn.infrastructure.persistence.NotificationRepository;
import com.englishlearn.infrastructure.persistence.StudentClassRepository;
import com.englishlearn.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    public Page<NotificationResponse> getNotificationsPage(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapToResponse);
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
    public void deleteNotificationForUser(Long id, Long userId) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        if (!notification.getUser().getId().equals(userId)) {
            throw new org.springframework.security.access.AccessDeniedException("Bạn không có quyền xóa thông báo này");
        }
        notificationRepository.delete(notification);
    }

    @Transactional
    public void markAsReadForUser(Long id, Long userId) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        if (!notification.getUser().getId().equals(userId)) {
            throw new org.springframework.security.access.AccessDeniedException("Bạn không có quyền đánh dấu thông báo này");
        }
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void sendNotification(Notification notification) {
        Notification saved = notificationRepository.save(notification);
        NotificationResponse response = mapToResponse(saved);

        // SEC-BLOCKER-001: Private notifications via user destination (not guessable /topic/{username})
        messagingTemplate.convertAndSendToUser(
                notification.getUser().getUsername(),
                "/queue/notifications",
                response);
    }

    /**
     * BUG-BLOCKER-001: Direct send from staff — caller must share school with target (admin exempt).
     */
    @Transactional
    public void sendNotification(Long callerId, Long targetUserId, String title, String message, String imageUrl) {
        User caller = userRepository.findById(callerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + callerId));
        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + targetUserId));
        assertSameSchoolForNotification(caller, target);
        sendNotificationToUser(target, title, message, imageUrl);
    }

    @Transactional
    public void sendNotification(Long userId, String title, String message, String imageUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        sendNotificationToUser(user, title, message, imageUrl);
    }

    private void sendNotificationToUser(User user, String title, String message, String imageUrl) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .isRead(false)
                .imageUrl(imageUrl)
                .build();
        sendNotification(notification);
    }

    /**
     * BUG-BLOCKER-001: Broadcast scoped to caller's school unless admin.
     */
    @Transactional
    public void broadcastNotification(Long callerId, BroadcastNotificationRequest request) {
        User caller = userRepository.findById(callerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + callerId));
        List<User> targetUsers = resolveBroadcastTargets(caller, request);

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

    private List<User> resolveBroadcastTargets(User caller, BroadcastNotificationRequest request) {
        if (request.getScope() == null || request.getScope().isBlank()) {
            throw new org.springframework.security.access.AccessDeniedException("Phạm vi broadcast không hợp lệ");
        }
        String scope = request.getScope().toUpperCase();
        boolean admin = isAdmin(caller);
        Long callerSchoolId = caller.getSchool() != null ? caller.getSchool().getId() : null;

        if ("SYSTEM".equals(scope)) {
            if (!admin) {
                throw new org.springframework.security.access.AccessDeniedException(
                        "Chỉ quản trị hệ thống mới được gửi broadcast SYSTEM");
            }
            return new ArrayList<>(userRepository.findAllByRolesName("ROLE_SCHOOL"));
        }

        if ("ALL".equals(scope) || "ROLE".equals(scope)) {
            if (!admin) {
                throw new org.springframework.security.access.AccessDeniedException(
                        "Chỉ quản trị hệ thống mới được gửi broadcast ALL hoặc ROLE");
            }
            if ("ALL".equals(scope)) {
                return new ArrayList<>(userRepository.findAll());
            }
            if (request.getTargetRole() != null) {
                return new ArrayList<>(userRepository.findAllByRolesName(request.getTargetRole()));
            }
            return List.of();
        }

        if ("SCHOOL".equals(scope)) {
            Long schoolId = request.getSchoolId();
            if (!admin) {
                if (callerSchoolId == null) {
                    throw new org.springframework.security.access.AccessDeniedException(
                            "Tài khoản không thuộc trường, không thể broadcast theo trường");
                }
                if (schoolId != null && !schoolId.equals(callerSchoolId)) {
                    throw new org.springframework.security.access.AccessDeniedException(
                            "Không thể broadcast sang trường khác");
                }
                schoolId = callerSchoolId;
            } else if (schoolId == null) {
                throw new org.springframework.security.access.AccessDeniedException(
                        "schoolId là bắt buộc cho broadcast SCHOOL");
            }
            return new ArrayList<>(userRepository.findAllBySchoolId(schoolId));
        }

        if ("CLASS".equals(scope)) {
            if (request.getClassId() == null) {
                throw new org.springframework.security.access.AccessDeniedException("classId là bắt buộc cho broadcast CLASS");
            }
            ClassRoom classRoom = classRoomRepository.findById(request.getClassId())
                    .orElseThrow(() -> new ResourceNotFoundException("Lớp học", "id", request.getClassId()));
            Long classSchoolId = classRoom.getSchool() != null ? classRoom.getSchool().getId() : null;
            if (!admin && (callerSchoolId == null || classSchoolId == null || !callerSchoolId.equals(classSchoolId))) {
                throw new org.springframework.security.access.AccessDeniedException(
                        "Không thể broadcast tới lớp thuộc trường khác");
            }
            List<User> targetUsers = new ArrayList<>();
            studentClassRepository.findActiveStudentsByClassId(request.getClassId()).stream()
                    .map(sc -> sc.getStudent())
                    .forEach(targetUsers::add);
            if (classRoom.getTeacher() != null) {
                targetUsers.add(classRoom.getTeacher());
            }
            return targetUsers;
        }

        throw new org.springframework.security.access.AccessDeniedException("Phạm vi broadcast không được hỗ trợ: " + scope);
    }

    private void assertSameSchoolForNotification(User caller, User target) {
        if (isAdmin(caller)) {
            return;
        }
        Long callerSchoolId = caller.getSchool() != null ? caller.getSchool().getId() : null;
        Long targetSchoolId = target.getSchool() != null ? target.getSchool().getId() : null;
        if (callerSchoolId == null || targetSchoolId == null || !callerSchoolId.equals(targetSchoolId)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Không thể gửi thông báo cho người dùng thuộc trường khác");
        }
    }

    private boolean isAdmin(User user) {
        return user.getRoles().stream().anyMatch(role -> "ROLE_ADMIN".equals(role.getName()));
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
