package com.englishlearn.application.service;

import com.englishlearn.application.dto.response.LeaderboardResponse;
import com.englishlearn.domain.entity.User;
import com.englishlearn.domain.exception.ApiException;
import com.englishlearn.infrastructure.persistence.ExamResultRepository;
import com.englishlearn.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final UserRepository userRepository;
    private final ExamResultRepository examResultRepository;

    /**
     * Get global leaderboard ranked by total coins
     */
    public Page<LeaderboardResponse> getLeaderboardByCoins(Pageable pageable) {
        Page<User> users = userRepository.findLeaderboard(pageable);
        
        List<LeaderboardResponse> leaderboard = new ArrayList<>();
        int rank = pageable.getPageNumber() * pageable.getPageSize() + 1;
        
        for (User user : users) {
            leaderboard.add(mapToLeaderboardResponse(user, rank++));
        }
        
        log.info("Retrieved leaderboard by coins - Page: {}, Size: {}", 
                pageable.getPageNumber(), pageable.getPageSize());
        
        return new PageImpl<>(leaderboard, pageable, countTotalUsers());
    }

    /**
     * Get top users by coins
     */
    public List<LeaderboardResponse> getTopUsersByCoins(int limit) {
        List<User> topUsers = userRepository.findTopUsersByCoins(limit);
        
        List<LeaderboardResponse> leaderboard = new ArrayList<>();
        for (int i = 0; i < topUsers.size(); i++) {
            leaderboard.add(mapToLeaderboardResponse(topUsers.get(i), i + 1));
        }
        
        log.info("Retrieved top {} users by coins", limit);
        return leaderboard;
    }

    /**
     * Get user's rank by coins - Only ROLE_STUDENT users
     */
    public LeaderboardResponse getUserRank(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng"));

        // Get all ROLE_STUDENT users sorted by coins and streakDays
        List<User> allUsers = userRepository.findAllStudents();
        
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
    public List<LeaderboardResponse> getLeaderboardByStreak(int limit) {
        return userRepository.findAllStudents().stream()
                .sorted((u1, u2) -> u2.getStreakDays().compareTo(u1.getStreakDays()))
                .limit(limit)
                .map((user) -> {
                    int rank = userRepository.findAllStudents().stream()
                            .filter(u -> u.getStreakDays() > user.getStreakDays())
                            .collect(Collectors.toList()).size() + 1;
                    return mapToLeaderboardResponse(user, rank);
                })
                .collect(Collectors.toList());
    }

    /**
     * Get global leaderboard with combined scores (coins + streak bonus) - Only ROLE_STUDENT users
     */
    public List<LeaderboardResponse> getGlobalLeaderboard(int limit) {
        return userRepository.findAllStudents().stream()
                .map(user -> {
                    // Calculate combined score: coins + (streak * 10)
                    int combinedScore = user.getCoins() + (user.getStreakDays() * 10);
                    return new UserScoreWrapper(user, combinedScore);
                })
                .sorted((u1, u2) -> u2.score.compareTo(u1.score))
                .limit(limit)
                .map((wrapper) -> {
                    int rank = userRepository.findAllStudents().stream()
                            .map(u -> u.getCoins() + (u.getStreakDays() * 10))
                            .filter(score -> score > wrapper.score)
                            .collect(Collectors.toList()).size() + 1;
                    return mapToLeaderboardResponse(wrapper.user, rank);
                })
                .collect(Collectors.toList());
    }

    /**
     * Get leaderboard around a specific user (user's rank ± 5) - Only ROLE_STUDENT users
     */
    public List<LeaderboardResponse> getLeaderboardAroundUser(Long userId, int rangeSize) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng"));

        LeaderboardResponse userRank = getUserRank(userId);
        int startRank = Math.max(1, userRank.getRank() - rangeSize / 2);
        
        List<User> allUsers = userRepository.findAllStudents().stream()
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
    public List<LeaderboardResponse> compareUsers(List<Long> userIds) {
        List<LeaderboardResponse> comparison = new ArrayList<>();
        
        for (Long userId : userIds) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng: " + userId));
            
            LeaderboardResponse response = getUserRank(userId);
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
    private long countTotalUsers() {
        return userRepository.countStudents();
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
}
