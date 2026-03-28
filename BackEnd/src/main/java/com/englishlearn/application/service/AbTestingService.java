package com.englishlearn.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import java.time.Duration;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class AbTestingService {

    private static final String ASSN_PREFIX = "ab:assn:";

    private final RedisTemplate<String, Object> redisTemplate;

    /**
     * Deterministic variant assignment per user per experiment.
     * Assignments cached in Redis with 30-day TTL.
     */
    public String getVariant(Long userId, String experimentKey) {
        String key = ASSN_PREFIX + experimentKey + ":" + userId;
        Object cached = redisTemplate.opsForValue().get(key);
        if (cached != null) return cached.toString();

        Random rand = new Random(userId ^ experimentKey.hashCode());
        String variant = rand.nextDouble() < 0.5 ? "control" : "treatment";

        // setIfAbsent ensures only one concurrent call writes the assignment
        redisTemplate.opsForValue().setIfAbsent(key, variant, Duration.ofDays(30));

        log.debug("AB assigned: user={}, exp={}, variant={}", userId, experimentKey, variant);
        return variant;
    }

    /**
     * Record a conversion event for an A/B experiment.
     * Called when user completes target action (e.g., lesson complete, day-1 retention).
     */
    public void recordConversion(Long userId, String experimentKey) {
        String variant = getVariant(userId, experimentKey);
        log.info("AB conversion: user={}, exp={}, variant={}", userId, experimentKey, variant);
        // TODO Phase 5: Persist to AB_ASSIGNMENT table, aggregate stats for analysis
    }
}
