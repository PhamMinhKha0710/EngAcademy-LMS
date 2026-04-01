package com.englishlearn.infrastructure.persistence;

import com.englishlearn.domain.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

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

  @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = 'ROLE_STUDENT' ORDER BY u.coins DESC, u.streakDays DESC")
  Page<User> findTopUsersByCoins(Pageable pageable);

  // Leaderboard queries - Filtered by School
  @Query("SELECT u FROM User u LEFT JOIN FETCH u.school JOIN u.roles r WHERE r.name = 'ROLE_STUDENT' AND (:schoolId IS NULL OR u.school.id = :schoolId) ORDER BY u.coins DESC, u.streakDays DESC")
  Page<User> findLeaderboardBySchool(@Param("schoolId") Long schoolId, Pageable pageable);

  @Query("SELECT u FROM User u LEFT JOIN FETCH u.school JOIN u.roles r WHERE r.name = 'ROLE_STUDENT' AND (:schoolId IS NULL OR u.school.id = :schoolId) ORDER BY u.coins DESC, u.streakDays DESC")
  List<User> findTopUsersByCoinsBySchool(@Param("schoolId") Long schoolId, Pageable pageable);

  // Get all users with ROLE_STUDENT
  @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = 'ROLE_STUDENT' ORDER BY u.coins DESC, u.streakDays DESC")
  java.util.List<User> findAllStudents();

  @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = 'ROLE_STUDENT' AND (:schoolId IS NULL OR u.school.id = :schoolId) ORDER BY u.coins DESC, u.streakDays DESC")
  List<User> findAllStudentsBySchool(@Param("schoolId") Long schoolId);

  // Count only ROLE_STUDENT users
  @Query("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE r.name = 'ROLE_STUDENT'")
  long countStudents();

  @Query("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE r.name = 'ROLE_STUDENT' AND (:schoolId IS NULL OR u.school.id = :schoolId)")
  long countStudentsBySchool(@Param("schoolId") Long schoolId);

  Page<User> findAllBySchool(com.englishlearn.domain.entity.School school, Pageable pageable);

  @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = 'ROLE_STUDENT' AND (LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND (:schoolId IS NULL OR u.school.id = :schoolId)")
  Page<User> searchStudents(@Param("keyword") String keyword, @Param("schoolId") Long schoolId, Pageable pageable);

  @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = 'ROLE_TEACHER' AND (LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND (:schoolId IS NULL OR u.school.id = :schoolId)")
  Page<User> searchTeachers(@Param("keyword") String keyword, @Param("schoolId") Long schoolId, Pageable pageable);

  @Query("""
      SELECT DISTINCT u
      FROM User u
      JOIN u.roles r
      WHERE r.name = 'ROLE_STUDENT'
        AND (
            LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(COALESCE(u.fullName, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(COALESCE(u.email, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
        )
      ORDER BY u.fullName ASC, u.username ASC
      """)
  List<User> searchStudentsByKeyword(@Param("keyword") String keyword);

  @Query("SELECT u FROM User u JOIN u.roles r WHERE r.name = :roleName")
  List<User> findAllByRolesName(@Param("roleName") String roleName);

  @Query("SELECT u FROM User u WHERE u.school.id = :schoolId")
  List<User> findAllBySchoolId(@Param("schoolId") Long schoolId);

  @Query("SELECT COUNT(u) FROM User u WHERE u.isActive = true")
  long countActiveUsers();

  @Query("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE r.name = :roleName")
  long countByRoleName(@Param("roleName") String roleName);

  @Query("SELECT COUNT(u) FROM User u WHERE u.school.id = :schoolId AND u.isActive = true")
  long countActiveUsersBySchool(@Param("schoolId") Long schoolId);

  @Query("SELECT COUNT(u) FROM User u JOIN u.roles r WHERE u.school.id = :schoolId AND r.name = :roleName")
  long countBySchoolIdAndRoleName(@Param("schoolId") Long schoolId, @Param("roleName") String roleName);

  @Query("SELECT COUNT(u) FROM User u WHERE u.school.id = :schoolId")
  long countBySchoolId(@Param("schoolId") Long schoolId);

  @Query("SELECT SUM(u.coins) FROM User u")
  Long sumTotalCoins();
}
