package com.englishlearn.infrastructure.security;

import com.englishlearn.domain.entity.ClassRoom;
import com.englishlearn.domain.entity.User;
import com.englishlearn.infrastructure.persistence.ClassRoomRepository;
import com.englishlearn.infrastructure.persistence.StudentClassRepository;
import com.englishlearn.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Authorizes STOMP SUBSCRIBE destinations (SEC-BLOCKER-001, WS-HIGH-001).
 */
@Component
@RequiredArgsConstructor
public class StompSubscribeAuthorizationInterceptor implements ChannelInterceptor {

    private static final Pattern NOTIFICATION_TOPIC = Pattern.compile("^/topic/notifications/.+");
    private static final Pattern SCHOOL_TOPIC = Pattern.compile("^/topic/school/(\\d+)$");
    private static final Pattern CLASS_TOPIC = Pattern.compile("^/topic/class/(\\d+)$");

    private final UserRepository userRepository;
    private final ClassRoomRepository classRoomRepository;
    private final StudentClassRepository studentClassRepository;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null || !StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
            return message;
        }

        String destination = accessor.getDestination();
        if (destination == null || destination.isBlank()) {
            throw new MessageDeliveryException("SUBSCRIBE destination is required");
        }

        Principal principal = accessor.getUser();
        if (principal == null) {
            throw new MessageDeliveryException("WebSocket SUBSCRIBE requires authentication");
        }

        User user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new MessageDeliveryException("Unknown WebSocket principal"));

        authorizeDestination(destination, user);
        return message;
    }

    private void authorizeDestination(String destination, User user) {
        if (NOTIFICATION_TOPIC.matcher(destination).matches()) {
            throw new MessageDeliveryException(
                    "Subscription to /topic/notifications/* is not allowed; use /user/queue/notifications");
        }

        if (destination.startsWith("/user/")) {
            if ("/user/queue/notifications".equals(destination)) {
                return;
            }
            throw new MessageDeliveryException("Unauthorized user destination: " + destination);
        }

        if (isAdmin(user)) {
            return;
        }

        Matcher schoolMatcher = SCHOOL_TOPIC.matcher(destination);
        if (schoolMatcher.matches()) {
            Long targetSchoolId = Long.parseLong(schoolMatcher.group(1));
            assertSameSchool(user, targetSchoolId);
            return;
        }

        Matcher classMatcher = CLASS_TOPIC.matcher(destination);
        if (classMatcher.matches()) {
            Long classId = Long.parseLong(classMatcher.group(1));
            authorizeClassTopic(user, classId);
            return;
        }

        if ("/topic/global".equals(destination)) {
            throw new MessageDeliveryException("Only administrators may subscribe to /topic/global");
        }

        if ("/topic/leaderboard".equals(destination)) {
            return;
        }

        if (destination.startsWith("/topic/")) {
            throw new MessageDeliveryException("Unauthorized topic subscription: " + destination);
        }
    }

    private void authorizeClassTopic(User user, Long classId) {
        ClassRoom classRoom = classRoomRepository.findById(classId)
                .orElseThrow(() -> new MessageDeliveryException("Class not found for topic subscription"));

        boolean isStudent = user.getRoles().stream()
                .anyMatch(role -> "ROLE_STUDENT".equals(role.getName()));
        if (isStudent) {
            boolean enrolled = studentClassRepository.findByStudentAndClassRoom(user, classRoom)
                    .map(sc -> "ACTIVE".equalsIgnoreCase(sc.getStatus()))
                    .orElse(false);
            if (!enrolled) {
                throw new MessageDeliveryException("You are not enrolled in this class topic");
            }
            return;
        }

        Long classSchoolId = classRoom.getSchool() != null ? classRoom.getSchool().getId() : null;
        Long userSchoolId = user.getSchool() != null ? user.getSchool().getId() : null;
        if (userSchoolId == null || classSchoolId == null || !userSchoolId.equals(classSchoolId)) {
            throw new MessageDeliveryException("Forbidden class topic subscription");
        }
    }

    private void assertSameSchool(User user, Long targetSchoolId) {
        Long userSchoolId = user.getSchool() != null ? user.getSchool().getId() : null;
        if (userSchoolId == null || !userSchoolId.equals(targetSchoolId)) {
            throw new MessageDeliveryException("Forbidden school topic subscription");
        }
    }

    private boolean isAdmin(User user) {
        return user.getRoles().stream().anyMatch(role -> "ROLE_ADMIN".equals(role.getName()));
    }
}
