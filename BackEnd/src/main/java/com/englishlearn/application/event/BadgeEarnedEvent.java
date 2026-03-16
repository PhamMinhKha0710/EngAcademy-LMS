package com.englishlearn.application.event;

import com.englishlearn.domain.entity.BadgeDefinition;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

/**
 * Event được publish khi user đạt badge mới.
 * Dùng để hook notification (WebSocket, email...) sau này.
 */
@Getter
public class BadgeEarnedEvent extends ApplicationEvent {

    private final Long userId;
    private final BadgeDefinition badge;

    public BadgeEarnedEvent(Object source, Long userId, BadgeDefinition badge) {
        super(source);
        this.userId = userId;
        this.badge = badge;
    }
}
