package com.englishlearn.application.service;

import com.englishlearn.application.dto.request.BadgeRequest;
import com.englishlearn.application.dto.response.BadgeResponse;
import com.englishlearn.domain.entity.Badge;
import com.englishlearn.domain.entity.User;
import com.englishlearn.domain.exception.ApiException;
import com.englishlearn.infrastructure.persistence.BadgeRepository;
import com.englishlearn.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final UserRepository userRepository;

    /**
     * Award a badge to a user
     */
    @Transactional
    public BadgeResponse awardBadge(Long userId, String badgeName, String description, String iconUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng"));

        // Check if user already has this badge
        if (badgeRepository.existsByUserAndName(user, badgeName)) {
            throw ApiException.conflict("Người dùng đã có badge này rồi");
        }

        Badge badge = Badge.builder()
                .user(user)
                .name(badgeName)
                .description(description)
                .iconUrl(iconUrl)
                .build();

        badge = badgeRepository.save(badge);
        log.info("Awarded badge '{}' to user: {}", badgeName, userId);
        return mapToResponse(badge);
    }

    /**
     * Create a custom badge for a user
     */
    @Transactional
    public BadgeResponse createBadge(Long userId, BadgeRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng"));

        if (badgeRepository.existsByUserAndName(user, request.getName())) {
            throw ApiException.conflict("Người dùng đã có badge này rồi");
        }

        Badge badge = Badge.builder()
                .user(user)
                .name(request.getName())
                .description(request.getDescription())
                .iconUrl(request.getIconUrl())
                .build();

        badge = badgeRepository.save(badge);
        log.info("Created badge '{}' for user: {}", request.getName(), userId);
        return mapToResponse(badge);
    }

    /**
     * Get all badges for a user
     */
    public List<BadgeResponse> getUserBadges(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng"));

        return badgeRepository.findByUser(user).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get badge count for a user
     */
    public Integer getBadgeCount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng"));

        return Math.toIntExact(badgeRepository.findByUser(user).size());
    }

    /**
     * Get badge by ID
     */
    public BadgeResponse getBadgeById(Long badgeId) {
        Badge badge = badgeRepository.findById(badgeId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy badge"));
        return mapToResponse(badge);
    }

    /**
     * Delete a badge (only owner can delete)
     */
    @Transactional
    public void deleteBadge(Long userId, Long badgeId) {
        Badge badge = badgeRepository.findById(badgeId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy badge"));

        if (!badge.getUser().getId().equals(userId)) {
            throw ApiException.forbidden("Bạn không có quyền xóa badge này");
        }

        badgeRepository.deleteById(badgeId);
        log.info("Deleted badge: {} for user: {}", badgeId, userId);
    }

    /**
     * Award achievement badges based on user progress
     */
    @Transactional
    public List<BadgeResponse> checkAndAwardAchievements(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Không tìm thấy người dùng"));

        List<BadgeResponse> newBadges = new java.util.ArrayList<>();

        // Check for milestone badges
        if (user.getCoins() >= 1000 && !badgeRepository.existsByUserAndName(user, "Coin Collector")) {
            newBadges.add(awardBadge(userId, "Coin Collector", "Earned 1000 coins", "🪙"));
        }

        if (user.getStreakDays() >= 7 && !badgeRepository.existsByUserAndName(user, "Week Warrior")) {
            newBadges.add(awardBadge(userId, "Week Warrior", "7-day streak", "⚔️"));
        }

        if (user.getStreakDays() >= 30 && !badgeRepository.existsByUserAndName(user, "Month Master")) {
            newBadges.add(awardBadge(userId, "Month Master", "30-day streak", "👑"));
        }

        if (user.getCoins() >= 5000 && !badgeRepository.existsByUserAndName(user, "Legendary")) {
            newBadges.add(awardBadge(userId, "Legendary", "Earned 5000 coins", "⭐"));
        }

        return newBadges;
    }

    /**
     * Map Badge entity to response DTO
     */
    private BadgeResponse mapToResponse(Badge badge) {
        return BadgeResponse.builder()
                .id(badge.getId())
                .name(badge.getName())
                .description(badge.getDescription())
                .iconUrl(badge.getIconUrl())
                .earnedAt(badge.getEarnedAt())
                .build();
    }
}
