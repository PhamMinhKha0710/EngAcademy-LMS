package com.englishlearn.infrastructure.persistence;

import com.englishlearn.domain.entity.BadgeDefinition;
import com.englishlearn.domain.entity.User;
import com.englishlearn.domain.entity.UserBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserBadgeRepository extends JpaRepository<UserBadge, Long> {

    List<UserBadge> findByUser(User user);

    List<UserBadge> findByUserId(Long userId);

    Optional<UserBadge> findByUserAndBadge(User user, BadgeDefinition badge);

    boolean existsByUserIdAndBadgeId(Long userId, Long badgeId);

    boolean existsByUserIdAndBadgeBadgeKey(Long userId, String badgeKey);

    @Query("SELECT ub FROM UserBadge ub JOIN FETCH ub.badge WHERE ub.user.id = :userId")
    List<UserBadge> findByUserIdWithBadge(@Param("userId") Long userId);

    long countByUserId(Long userId);
}
