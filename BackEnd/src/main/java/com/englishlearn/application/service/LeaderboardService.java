package com.englishlearn.application.service;

import com.englishlearn.application.dto.response.LeaderboardResponse;
import com.englishlearn.domain.entity.User;
import com.englishlearn.domain.exception.ApiException;
import com.englishlearn.infrastructure.persistence.ExamResultRepository;
import com.englishlearn.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final UserRepository userRepository;
    private final ExamResultRepository examResultRepository;

    @Autowired
    @Lazy
    private RedisLeaderboardService redisLeaderboardService;

    /**
     * Get global leaderboard ranked by total coins
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "leaderboard", key = "'coins:' + #schoolId + ':' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public Page<LeaderboardResponse> getLeaderboardByCoins(Long schoolId, Pageable pageable) {
        Page<User> users = userRepository.findLeaderboardBySchool(schoolId, pageable);

        List<LeaderboardResponse> leaderboard = new ArrayList<>();
        int rank = pageable.getPageNumber() * pageable.getPageSize() + 1;

        for (User user : users) {
            leaderboard.add(mapToLeaderboardResponse(user, rank++));
        }

        log.info("Retrieved leaderboard by coins - School: {}, Page: {}, Size: {}",
                schoolId, pageable.getPageNumber(), pageable.getPageSize());

        return new PageImpl<>(leaderboard, pageable, countTotalUsersBySchool(schoolId));
    }

    /**
     * Get top users by coins
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "leaderboard", key = "'top:' + #schoolId + ':' + #limit")
    public List<LeaderboardResponse> getTopUsersByCoins(Long schoolId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<User> topUsers = userRepository.findTopUsersByCoinsBySchool(schoolId, pageable);

        List<LeaderboardResponse> leaderboard = new ArrayList<>();
        for (int i = 0; i < topUsers.size(); i++) {
            leaderboard.add(mapToLeaderboardResponse(topUsers.get(i), i + 1));
        }

        log.info("Retrieved top {} users by coins for school {}", limit, schoolId);
        return leaderboard;
    }

    /**
     * Get user's rank by coins - Only ROLE_STUDENT users
     */
    public LeaderboardResponse getUserRank(Long userId, Long schoolId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng"));

        // Get all ROLE_STUDENT users sorted by coins and streakDays
        List<User> allUsers = userRepository.findAllStudentsBySchool(schoolId);

        int rank = 1;
        for (User u : allUsers) {
            if (u.getId().equals(userId)) {
                break;
            }
            rank++;
        }

        return mapToLeaderboardResponse(user, rank);
    }

    /**
     * Get leaderboard by streak days - Only ROLE_STUDENT users
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "leaderboard", key = "'streak:' + #schoolId + ':' + #limit")
    public List<LeaderboardResponse> getLeaderboardByStreak(Long schoolId, int limit) {
        List<User> students = userRepository.findAllStudentsBySchool(schoolId);
        return students.stream()
                .sorted((u1, u2) -> u2.getStreakDays().compareTo(u1.getStreakDays()))
                .limit(limit)
                .map((user) -> {
                    int rank = students.stream()
                            .filter(u -> u.getStreakDays() > user.getStreakDays())
                            .collect(Collectors.toList()).size() + 1;
                    return mapToLeaderboardResponse(user, rank);
                })
                .collect(Collectors.toList());
    }

    /**
     * Get global leaderboard with combined scores (coins + streak bonus) - Only
     * ROLE_STUDENT users
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "leaderboard", key = "'global:' + #schoolId + ':' + #limit")
    public List<LeaderboardResponse> getGlobalLeaderboard(Long schoolId, int limit) {
        List<User> students = userRepository.findAllStudentsBySchool(schoolId);
        return students.stream()
                .map(user -> {
                    // Calculate combined score: coins + (streak * 10)
                    int combinedScore = user.getCoins() + (user.getStreakDays() * 10);
                    return new UserScoreWrapper(user, combinedScore);
                })
                .sorted((u1, u2) -> u2.score.compareTo(u1.score))
                .limit(limit)
                .map((wrapper) -> {
                    int rank = students.stream()
                            .map(u -> u.getCoins() + (u.getStreakDays() * 10))
                            .filter(score -> score > wrapper.score)
                            .collect(Collectors.toList()).size() + 1;
                    return mapToLeaderboardResponse(wrapper.user, rank);
                })
                .collect(Collectors.toList());
    }

    /**
     * Get leaderboard around a specific user (user's rank ± 5) - Only ROLE_STUDENT
     * users
     */
    public List<LeaderboardResponse> getLeaderboardAroundUser(Long userId, Long schoolId, int rangeSize) {
        LeaderboardResponse userRank = getUserRank(userId, schoolId);
        int startRank = Math.max(1, userRank.getRank() - rangeSize / 2);

        List<User> allUsers = userRepository.findAllStudentsBySchool(schoolId).stream()
                .sorted((u1, u2) -> {
                    int coinsCompare = u2.getCoins().compareTo(u1.getCoins());
                    return coinsCompare != 0 ? coinsCompare : u2.getStreakDays().compareTo(u1.getStreakDays());
                })
                .collect(Collectors.toList());

        List<LeaderboardResponse> result = new ArrayList<>();
        for (int i = startRank - 1; i < Math.min(startRank - 1 + rangeSize, allUsers.size()); i++) {
            result.add(mapToLeaderboardResponse(allUsers.get(i), i + 1));
        }

        return result;
    }

    /**
     * Get user comparison (multiple users)
     */
    public List<LeaderboardResponse> compareUsers(List<Long> userIds, Long schoolId) {
        List<LeaderboardResponse> comparison = new ArrayList<>();

        for (Long userId : userIds) {
            // Validate user exists
            userRepository.findById(userId)
                    .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng: " + userId));

            LeaderboardResponse response = getUserRank(userId, schoolId);
            comparison.add(response);
        }

        return comparison.stream()
                .sorted((u1, u2) -> u1.getRank().compareTo(u2.getRank()))
                .collect(Collectors.toList());
    }

    /**
     * Calculate average score for a user
     */
    private Double calculateAverageScore(Long userId) {
        Double avg = examResultRepository.averageScoreByUserId(userId);
        return avg != null ? avg : 0.0;
    }

    /**
     * Count total ROLE_STUDENT users
     */
    private long countTotalUsersBySchool(Long schoolId) {
        return userRepository.countStudentsBySchool(schoolId);
    }

    /**
     * Map User entity to LeaderboardResponse DTO
     */
    private LeaderboardResponse mapToLeaderboardResponse(User user, int rank) {
        return LeaderboardResponse.builder()
                .rank(rank)
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .totalCoins(user.getCoins())
                .streakDays(user.getStreakDays())
                .averageScore(calculateAverageScore(user.getId()))
                .build();
    }

    /**
     * Helper class for sorting users by combined score
     */
    private static class UserScoreWrapper {
        User user;
        Integer score;

        UserScoreWrapper(User user, Integer score) {
            this.user = user;
            this.score = score;
        }
    }

    /**
     * Sync leaderboard data to Redis for faster access.
     * Call this method periodically or after significant score changes.
     */
    public void syncLeaderboardToRedis(Long schoolId) {
        try {
            List<User> users = userRepository.findAllStudentsBySchool(schoolId);
            redisLeaderboardService.clearLeaderboard(schoolId);
            for (User user : users) {
                redisLeaderboardService.setUserScore(user.getId(), schoolId, user.getCoins());
            }
            log.info("Synced {} users to Redis leaderboard for school {}", users.size(), schoolId);
        } catch (Exception e) {
            log.error("Failed to sync leaderboard to Redis for school {}: {}", schoolId, e.getMessage());
        }
    }

    /**
     * Get user's rank using Redis (much faster than DB query)
     */
    public LeaderboardResponse getUserRankFromRedis(Long userId, Long schoolId) {
        Long rank = redisLeaderboardService.getUserRank(userId, schoolId);
        if (rank == null) {
            return getUserRank(userId, schoolId);
        }

        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return null;
        }

        return LeaderboardResponse.builder()
                .rank(rank.intValue())
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .totalCoins(user.getCoins())
                .streakDays(user.getStreakDays())
                .averageScore(calculateAverageScore(user.getId()))
                .build();
    }
}
