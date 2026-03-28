package com.englishlearn.domain.enums;

public enum CefrLevel {
    A1(1), A2(2), B1(3), B2(4), C1(5), C2(6);

    private final int order;

    CefrLevel(int order) {
        this.order = order;
    }

    public int getOrder() {
        return order;
    }

    public static CefrLevel fromString(String value) {
        if (value == null || value.isBlank()) return A1;
        try {
            return CefrLevel.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            return A1;
        }
    }

    public static CefrLevel fromOrder(int order) {
        for (CefrLevel level : values()) {
            if (level.order == order) return level;
        }
        return A1;
    }

    public CefrLevel stepDown() {
        int newOrder = Math.max(1, order - 1);
        return fromOrder(newOrder);
    }

    public CefrLevel stepUp() {
        int newOrder = Math.min(6, order + 1);
        return fromOrder(newOrder);
    }
}
