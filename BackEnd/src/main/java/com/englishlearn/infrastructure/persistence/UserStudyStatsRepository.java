package com.englishlearn.infrastructure.persistence;

import com.englishlearn.domain.entity.User;
import com.englishlearn.domain.entity.UserStudyStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserStudyStatsRepository extends JpaRepository<UserStudyStats, Long> {

    Optional<UserStudyStats> findByUserId(Long userId);

    Optional<UserStudyStats> findByUser(User user);

    boolean existsByUserId(Long userId);
}
