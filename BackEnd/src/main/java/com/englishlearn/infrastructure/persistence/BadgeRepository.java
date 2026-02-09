package com.englishlearn.infrastructure.persistence;

import com.englishlearn.domain.entity.Badge;
import com.englishlearn.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BadgeRepository extends JpaRepository<Badge, Long> {
    List<Badge> findByUser(User user);
    
    Optional<Badge> findByUserAndName(User user, String name);
    
    boolean existsByUserAndName(User user, String name);
}
