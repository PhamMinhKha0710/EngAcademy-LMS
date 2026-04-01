package com.englishlearn.infrastructure.persistence;

import com.englishlearn.domain.entity.UserTopicProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserTopicProgressRepository extends JpaRepository<UserTopicProgress, Long> {

    Optional<UserTopicProgress> findByUserIdAndTopicId(Long userId, Long topicId);

    boolean existsByUserIdAndTopicId(Long userId, Long topicId);
}
