package com.englishlearn.application.event;

import com.englishlearn.domain.entity.BadgeDefinition;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

/**
 * Publish BadgeEarnedEvent khi user đạt badge.
 * Listener có thể dùng để gửi notification (WebSocket, email...).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BadgeEventPublisher {

    private final ApplicationEventPublisher applicationEventPublisher;

    public void publishBadgeEarned(Long userId, BadgeDefinition badge) {
        applicationEventPublisher.publishEvent(new BadgeEarnedEvent(this, userId, badge));
        log.debug("Published BadgeEarnedEvent for user {} badge {}", userId, badge.getBadgeKey());
    }
}
