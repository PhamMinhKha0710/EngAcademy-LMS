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
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

    @Transactional(readOnly = true)
    @Cacheable(value = "leaderboard", key = "'coins:' + #schoolId + ':' + #pageable.pageNumber + ':' + #pageable.pageSize")
    public Page<LeaderboardResponse> getLeaderboardByCoins(Long schoolId, Pageable pageable) {
        Page<User> users = userRepository.findLeaderboardBySchool(schoolId, pageable);

        List<LeaderboardResponse> leaderboard = new ArrayList<>();
        int rank = pageable.getPageNumber() * pageable.getPageSize() + 1;

        for (User user : users) {
            leaderboard.add(mapToLeaderboardResponse(user, rank++, false));
        }

        log.info("Retrieved leaderboard by coins - School: {}, Page: {}, Size: {}",
                schoolId, pageable.getPageNumber(), pageable.getPageSize());

        return new PageImpl<>(leaderboard, pageable, countTotalUsersBySchool(schoolId));
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "leaderboard", key = "'top:' + #schoolId + ':' + #limit")
    public List<LeaderboardResponse> getTopUsersByCoins(Long schoolId, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<User> topUsers = userRepository.findTopUsersByCoinsBySchool(schoolId, pageable);

        List<LeaderboardResponse> leaderboard = new ArrayList<>();
        for (int i = 0; i < topUsers.size(); i++) {
            leaderboard.add(mapToLeaderboardResponse(topUsers.get(i), i + 1, false));
        }

        log.info("Retrieved top {} users by coins for school {}", limit, schoolId);
        return leaderboard;
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "leaderboard", key = "'rank:' + #schoolId + ':' + #userId")
    public LeaderboardResponse getUserRank(Long userId, Long schoolId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng"));

        int coins = user.getCoins() != null ? user.getCoins() : 0;
        int streak = user.getStreakDays() != null ? user.getStreakDays() : 0;
        long above = userRepository.countStudentsRankedAbove(schoolId, coins, streak, userId);
        int rank = (int) above + 1;

        return mapToLeaderboardResponse(user, rank, true);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "leaderboard", key = "'streak:' + #schoolId + ':' + #limit")
    public List<LeaderboardResponse> getLeaderboardByStreak(Long schoolId, int limit) {
        List<User> students = userRepository.findAllStudentsBySchool(schoolId);
        return students.stream()
                .sorted((u1, u2) -> u2.getStreakDays().compareTo(u1.getStreakDays()))
                .limit(limit)
                .map((user) -> {
                    int rank = (int) students.stream()
                            .filter(u -> u.getStreakDays() > user.getStreakDays())
                            .count() + 1;
                    return mapToLeaderboardResponse(user, rank, false);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "leaderboard", key = "'global:' + #schoolId + ':' + #limit")
    public List<LeaderboardResponse> getGlobalLeaderboard(Long schoolId, int limit) {
        Page<User> page = userRepository.findLeaderboardBySchool(schoolId, PageRequest.of(0, limit));
        List<LeaderboardResponse> result = new ArrayList<>();
        int rank = 1;
        for (User user : page) {
            result.add(mapToLeaderboardResponse(user, rank++, false));
        }
        return result;
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "leaderboard", key = "'around:' + #schoolId + ':' + #userId + ':' + #rangeSize")
    public List<LeaderboardResponse> getLeaderboardAroundUser(Long userId, Long schoolId, int rangeSize) {
        try {
            ensureRedisLeaderboard(schoolId);
            int half = Math.max(1, rangeSize / 2);
            List<Long> userIds = redisLeaderboardService.getUsersAroundUser(userId, schoolId, half);
            if (!userIds.isEmpty()) {
                return buildAroundMeFromUserIds(userIds, schoolId);
            }
        } catch (Exception e) {
            log.warn("Redis leaderboard around-me fallback to DB for school {}: {}", schoolId, e.getMessage());
        }
        return getLeaderboardAroundUserFromDb(userId, schoolId, rangeSize);
    }

    public List<LeaderboardResponse> compareUsers(List<Long> userIds, Long schoolId) {
        List<LeaderboardResponse> comparison = new ArrayList<>();

        for (Long userId : userIds) {
            userRepository.findById(userId)
                    .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng: " + userId));
            comparison.add(getUserRank(userId, schoolId));
        }

        return comparison.stream()
                .sorted(Comparator.comparing(LeaderboardResponse::getRank))
                .collect(Collectors.toList());
    }

    public void syncLeaderboardToRedis(Long schoolId) {
        try {
            List<User> users = userRepository.findAllStudentsBySchool(schoolId);
            redisLeaderboardService.clearLeaderboard(schoolId);
            for (User user : users) {
                int coins = user.getCoins() != null ? user.getCoins() : 0;
                redisLeaderboardService.setUserScore(user.getId(), schoolId, coins);
            }
            log.info("Synced {} users to Redis leaderboard for school {}", users.size(), schoolId);
        } catch (Exception e) {
            log.error("Failed to sync leaderboard to Redis for school {}: {}", schoolId, e.getMessage());
        }
    }

    public LeaderboardResponse getUserRankFromRedis(Long userId, Long schoolId) {
        try {
            ensureRedisLeaderboard(schoolId);
            Long rank = redisLeaderboardService.getUserRank(userId, schoolId);
            if (rank != null) {
                User user = userRepository.findById(userId).orElse(null);
                if (user != null) {
                    return mapToLeaderboardResponse(user, rank.intValue(), true);
                }
            }
        } catch (Exception e) {
            log.debug("Redis rank miss for user {}: {}", userId, e.getMessage());
        }
        return getUserRank(userId, schoolId);
    }

    private void ensureRedisLeaderboard(Long schoolId) {
        if (redisLeaderboardService.getTotalUsers(schoolId) == 0) {
            syncLeaderboardToRedis(schoolId);
        }
    }

    private List<LeaderboardResponse> buildAroundMeFromUserIds(List<Long> userIds, Long schoolId) {
        List<User> users = userRepository.findStudentsBySchoolAndIdIn(schoolId, userIds);
        Map<Long, User> byId = users.stream().collect(Collectors.toMap(User::getId, u -> u, (a, b) -> a));

        List<LeaderboardResponse> result = new ArrayList<>();
        for (Long id : userIds) {
            User user = byId.get(id);
            if (user == null) {
                continue;
            }
            Long redisRank = redisLeaderboardService.getUserRank(id, schoolId);
            int rank = redisRank != null ? redisRank.intValue() : getUserRank(id, schoolId).getRank();
            result.add(mapToLeaderboardResponse(user, rank, false));
        }
        return result;
    }

    private List<LeaderboardResponse> getLeaderboardAroundUserFromDb(Long userId, Long schoolId, int rangeSize) {
        LeaderboardResponse userRank = getUserRank(userId, schoolId);
        int startRank = Math.max(1, userRank.getRank() - rangeSize / 2);

        Page<User> page = userRepository.findLeaderboardBySchool(schoolId,
                PageRequest.of(startRank - 1, rangeSize));

        List<LeaderboardResponse> result = new ArrayList<>();
        int rank = startRank;
        for (User user : page) {
            result.add(mapToLeaderboardResponse(user, rank++, false));
        }
        return result;
    }

    private Double calculateAverageScore(Long userId) {
        Double avg = examResultRepository.averageScoreByUserId(userId);
        return avg != null ? avg : 0.0;
    }

    private long countTotalUsersBySchool(Long schoolId) {
        return userRepository.countStudentsBySchool(schoolId);
    }

    private LeaderboardResponse mapToLeaderboardResponse(User user, int rank, boolean includeAverageScore) {
        return LeaderboardResponse.builder()
                .rank(rank)
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .totalCoins(user.getCoins())
                .streakDays(user.getStreakDays())
                .averageScore(includeAverageScore ? calculateAverageScore(user.getId()) : null)
                .build();
    }
}
