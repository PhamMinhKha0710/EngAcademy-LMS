package com.englishlearn.infrastructure.persistence;

import com.englishlearn.domain.entity.BadgeDefinition;
import com.englishlearn.domain.enums.BadgeGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BadgeDefinitionRepository extends JpaRepository<BadgeDefinition, Long> {

    Optional<BadgeDefinition> findByBadgeKey(String badgeKey);

    List<BadgeDefinition> findByGroupName(BadgeGroup groupName);

    boolean existsByBadgeKey(String badgeKey);
}
