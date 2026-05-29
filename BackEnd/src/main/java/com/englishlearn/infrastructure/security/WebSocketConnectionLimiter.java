package com.englishlearn.infrastructure.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.stereotype.Component;

import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Caps concurrent STOMP connections per authenticated user (Phase 4).
 */
@Component
public class WebSocketConnectionLimiter {

    private final int maxConnectionsPerUser;
    private final ConcurrentHashMap<String, AtomicInteger> activeByUsername = new ConcurrentHashMap<>();

    public WebSocketConnectionLimiter(
            @Value("${application.websocket.max-connections-per-user:5}") int maxConnectionsPerUser) {
        this.maxConnectionsPerUser = Math.max(1, maxConnectionsPerUser);
    }

    public void registerConnect(String username) {
        AtomicInteger count = activeByUsername.computeIfAbsent(username, k -> new AtomicInteger(0));
        int current = count.incrementAndGet();
        if (current > maxConnectionsPerUser) {
            count.decrementAndGet();
            throw new MessageDeliveryException(
                    "Vượt quá số kết nối WebSocket cho phép (" + maxConnectionsPerUser + ")");
        }
    }

    public void registerDisconnect(String username) {
        if (username == null) {
            return;
        }
        activeByUsername.computeIfPresent(username, (k, count) -> {
            count.decrementAndGet();
            return count.get() <= 0 ? null : count;
        });
    }

    public int getActiveCount(String username) {
        AtomicInteger count = activeByUsername.get(username);
        return count == null ? 0 : Math.max(0, count.get());
    }
}
