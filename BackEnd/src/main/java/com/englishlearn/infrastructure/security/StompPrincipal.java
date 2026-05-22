package com.englishlearn.infrastructure.security;

import java.security.Principal;

/**
 * Stable STOMP principal name for {@code convertAndSendToUser} delivery (WS-HIGH-001).
 */
public record StompPrincipal(String name) implements Principal {

    @Override
    public String getName() {
        return name;
    }
}
