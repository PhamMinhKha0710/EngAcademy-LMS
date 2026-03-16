package com.englishlearn.application.service;

import com.englishlearn.application.dto.response.BadgeDTO;

import java.util.List;

/**
 * Interface kiểm tra và trao badge cho user.
 * Trả về danh sách badge vừa đạt được (chưa có trong UserBadge).
 */
public interface BadgeEvaluator {

    /**
     * Kiểm tra điều kiện tất cả badge và trao những badge user chưa có.
     * Không trao badge trùng.
     *
     * @param userId ID user
     * @return Danh sách badge vừa đạt được
     */
    List<BadgeDTO> checkAndAward(Long userId);
}
