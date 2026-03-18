package com.englishlearn.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class RedisLeaderboardService {

    private final RedisTemplate<String, Object> redisTemplate;

    private static final String LEADERBOARD_KEY_PREFIX = "leaderboard:coins:";
    private static final long CACHE_TTL_MINUTES = 5;

    /**
     * Get leaderboard key for a specific school
     */
    private String getLeaderboardKey(Long schoolId) {
        return schoolId == null ? LEADERBOARD_KEY_PREFIX + "global" : LEADERBOARD_KEY_PREFIX + schoolId;
    }

    /**
     * Update user score in leaderboard
     */
    public void updateUserScore(Long userId, Long schoolId, int scoreDelta) {
        String key = getLeaderboardKey(schoolId);
        redisTemplate.opsForZSet().incrementScore(key, userId.toString(), scoreDelta);
        log.debug("Updated leaderboard score for user {} in school {}: +{}", userId, schoolId, scoreDelta);
    }

    /**
     * Set user score in leaderboard (absolute value)
     */
    public void setUserScore(Long userId, Long schoolId, int score) {
        String key = getLeaderboardKey(schoolId);
        redisTemplate.opsForZSet().add(key, userId.toString(), score);
        redisTemplate.expire(key, CACHE_TTL_MINUTES, TimeUnit.MINUTES);
        log.debug("Set leaderboard score for user {} in school {}: {}", userId, schoolId, score);
    }

    /**
     * Get top N users from leaderboard
     */
    public List<Long> getTopUsers(Long schoolId, int limit) {
        String key = getLeaderboardKey(schoolId);
        Set<Object> topUsers = redisTemplate.opsForZSet().reverseRange(key, 0, limit - 1);
        if (topUsers == null || topUsers.isEmpty()) {
            return new ArrayList<>();
        }
        return topUsers.stream()
                .map(o -> Long.parseLong(o.toString()))
                .toList();
    }

    /**
     * Get user rank (1-based)
     */
    public Long getUserRank(Long userId, Long schoolId) {
        String key = getLeaderboardKey(schoolId);
        Long rank = redisTemplate.opsForZSet().reverseRank(key, userId.toString());
        return rank == null ? null : rank + 1;
    }

    /**
     * Get user score
     */
    public Double getUserScore(Long userId, Long schoolId) {
        String key = getLeaderboardKey(schoolId);
        return redisTemplate.opsForZSet().score(key, userId.toString());
    }

    /**
     * Get total number of users in leaderboard
     */
    public Long getTotalUsers(Long schoolId) {
        String key = getLeaderboardKey(schoolId);
        Long count = redisTemplate.opsForZSet().zCard(key);
        return count == null ? 0L : count;
    }

    /**
     * Get users around a specific user (rank - range to rank + range)
     */
    public List<Long> getUsersAroundUser(Long userId, Long schoolId, int range) {
        String key = getLeaderboardKey(schoolId);
        Long userRank = redisTemplate.opsForZSet().reverseRank(key, userId.toString());
        if (userRank == null) {
            return new ArrayList<>();
        }

        long start = Math.max(0, userRank - range);
        long end = userRank + range;

        Set<Object> users = redisTemplate.opsForZSet().reverseRange(key, start, end);
        if (users == null || users.isEmpty()) {
            return new ArrayList<>();
        }
        return users.stream()
                .map(o -> Long.parseLong(o.toString()))
                .toList();
    }

    /**
     * Remove user from leaderboard
     */
    public void removeUser(Long userId, Long schoolId) {
        String key = getLeaderboardKey(schoolId);
        redisTemplate.opsForZSet().remove(key, userId.toString());
    }

    /**
     * Clear leaderboard cache
     */
    public void clearLeaderboard(Long schoolId) {
        String key = getLeaderboardKey(schoolId);
        redisTemplate.delete(key);
    }
}
