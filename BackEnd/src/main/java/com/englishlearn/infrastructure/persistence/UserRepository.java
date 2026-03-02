package com.englishlearn.infrastructure.persistence;

import com.englishlearn.domain.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    @Modifying
    @Query("UPDATE User u SET u.coins = u.coins + :coins WHERE u.id = :userId")
    void addCoinsToUser(@Param("userId") Long userId, @Param("coins") Integer coins);

    // Leaderboard queries - Only ROLE_STUDENT users
    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = 'ROLE_STUDENT' ORDER BY u.coins DESC, u.streakDays DESC")
    Page<User> findLeaderboard(Pageable pageable);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = 'ROLE_STUDENT' ORDER BY u.coins DESC, u.streakDays DESC LIMIT :limit")
    java.util.List<User> findTopUsersByCoins(@Param("limit") int limit);

    // Get all users with ROLE_STUDENT
    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = 'ROLE_STUDENT' ORDER BY u.coins DESC, u.streakDays DESC")
    java.util.List<User> findAllStudents();

    // Count only ROLE_STUDENT users
    @Query("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE r.name = 'ROLE_STUDENT'")
    long countStudents();

    Page<User> findAllBySchool(com.englishlearn.domain.entity.School school, Pageable pageable);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = 'ROLE_STUDENT' AND (LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND (:schoolId IS NULL OR u.school.id = :schoolId)")
    Page<User> searchStudents(@Param("keyword") String keyword, @Param("schoolId") Long schoolId, Pageable pageable);
}
