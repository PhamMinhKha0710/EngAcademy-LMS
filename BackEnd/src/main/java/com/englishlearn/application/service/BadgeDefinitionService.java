package com.englishlearn.application.service;

import com.englishlearn.application.dto.response.BadgeDTO;
import com.englishlearn.domain.entity.BadgeDefinition;
import com.englishlearn.domain.entity.UserBadge;
import com.englishlearn.domain.enums.BadgeGroup;
import com.englishlearn.domain.exception.ResourceNotFoundException;
import com.englishlearn.infrastructure.persistence.BadgeDefinitionRepository;
import com.englishlearn.infrastructure.persistence.UserBadgeRepository;
import com.englishlearn.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service lấy danh sách badge định nghĩa và badge user đã đạt.
 * Badge bí mật (isSecret) chỉ hiện khi user đã đạt.
 */
@Service
@RequiredArgsConstructor
public class BadgeDefinitionService {

    private final BadgeDefinitionRepository badgeDefinitionRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final UserRepository userRepository;

    /**
     * Lấy tất cả badge definitions, có thể filter theo group.
     * Badge isSecret chưa đạt sẽ không hiện (trả về null cho earnedAt).
     */
    @Transactional(readOnly = true)
    public List<BadgeDTO> getAllBadges(BadgeGroup group) {
        List<BadgeDefinition> definitions = group != null
                ? badgeDefinitionRepository.findByGroupName(group)
                : badgeDefinitionRepository.findAll();

        // Badge bí mật không hiện trong danh sách công khai
        return definitions.stream()
                .filter(def -> !Boolean.TRUE.equals(def.getIsSecret()))
                .map(def -> BadgeDTO.builder()
                        .id(def.getId())
                        .badgeKey(def.getBadgeKey())
                        .name(def.getName())
                        .description(def.getDescription())
                        .iconEmoji(def.getIconEmoji())
                        .groupName(def.getGroupName())
                        .difficulty(def.getDifficulty())
                        .isSecret(def.getIsSecret())
                        .earnedAt(null) // Không gắn với user cụ thể
                        .build())
                .collect(Collectors.toList());
    }

    /**
     * Lấy badge user đã đạt. Badge bí mật cũng hiện vì user đã có.
     */
    @Transactional(readOnly = true)
    public List<BadgeDTO> getUserEarnedBadges(Long userId) {
        userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", userId));

        List<UserBadge> userBadges = userBadgeRepository.findByUserIdWithBadge(userId);
        return userBadges.stream()
                .map(ub -> BadgeDTO.builder()
                        .id(ub.getBadge().getId())
                        .badgeKey(ub.getBadge().getBadgeKey())
                        .name(ub.getBadge().getName())
                        .description(ub.getBadge().getDescription())
                        .iconEmoji(ub.getBadge().getIconEmoji())
                        .groupName(ub.getBadge().getGroupName())
                        .difficulty(ub.getBadge().getDifficulty())
                        .isSecret(ub.getBadge().getIsSecret())
                        .earnedAt(ub.getEarnedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
