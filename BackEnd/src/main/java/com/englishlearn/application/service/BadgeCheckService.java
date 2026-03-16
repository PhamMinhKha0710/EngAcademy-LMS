package com.englishlearn.application.service;

import com.englishlearn.application.dto.response.BadgeDTO;
import com.englishlearn.application.dto.response.CheckBadgeResponse;
import com.englishlearn.domain.exception.ResourceNotFoundException;
import com.englishlearn.infrastructure.persistence.UserBadgeRepository;
import com.englishlearn.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Service trigger kiểm tra và trao badge.
 * checkAndAwardAsync chạy @Async để không block request (trả về Future).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BadgeCheckService {

    private final UserRepository userRepository;
    private final BadgeEvaluator badgeEvaluator;
    private final UserBadgeRepository userBadgeRepository;

    /**
     * Kiểm tra và trao badge, trả về kết quả.
     * Chạy đồng bộ - controller đợi kết quả.
     */
    @Transactional
    public CheckBadgeResponse checkAndAward(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", userId));

        List<BadgeDTO> newlyEarned = badgeEvaluator.checkAndAward(userId);
        int totalEarned = (int) userBadgeRepository.countByUserId(userId);

        String message = newlyEarned.isEmpty()
                ? "Không có badge mới."
                : "Chúc mừng! Bạn vừa đạt " + newlyEarned.size() + " badge mới.";

        return CheckBadgeResponse.builder()
                .newlyEarnedBadges(newlyEarned)
                .totalBadgesEarned(totalEarned)
                .message(message)
                .build();
    }

    /**
     * Phiên bản async - dùng khi gọi từ background job.
     * Controller có thể gọi checkAndAward() đồng bộ để nhận kết quả ngay.
     */
    @Async
    public CompletableFuture<CheckBadgeResponse> checkAndAwardAsync(Long userId) {
        return CompletableFuture.completedFuture(checkAndAward(userId));
    }
}
