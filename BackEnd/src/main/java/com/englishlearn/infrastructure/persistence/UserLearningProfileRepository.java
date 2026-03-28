package com.englishlearn.infrastructure.persistence;

import com.englishlearn.domain.entity.UserLearningProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserLearningProfileRepository extends JpaRepository<UserLearningProfile, Long> {

    Optional<UserLearningProfile> findByUserId(Long userId);

    boolean existsByUserId(Long userId);
}
