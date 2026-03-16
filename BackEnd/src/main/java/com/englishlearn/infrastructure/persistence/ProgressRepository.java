package com.englishlearn.infrastructure.persistence;

import com.englishlearn.domain.entity.Progress;
import com.englishlearn.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProgressRepository extends JpaRepository<Progress, Long> {

    List<Progress> findByUser(User user);

    List<Progress> findByUserId(Long userId);

    Optional<Progress> findByUserIdAndLessonId(Long userId, Long lessonId);

    boolean existsByUserIdAndLessonId(Long userId, Long lessonId);

    @Query("SELECT p FROM Progress p WHERE p.user.id = :userId AND p.isCompleted = true")
    List<Progress> findCompletedByUserId(@Param("userId") Long userId);

    @Query("SELECT p FROM Progress p WHERE p.user.id = :userId AND p.isCompleted = false ORDER BY p.lastAccessed DESC")
    List<Progress> findInProgressByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(p) FROM Progress p WHERE p.user.id = :userId AND p.isCompleted = true")
    Long countCompletedByUserId(@Param("userId") Long userId);

    @Query("SELECT AVG(p.completionPercentage) FROM Progress p WHERE p.user.id = :userId")
    Double averageCompletionByUserId(@Param("userId") Long userId);

    /** Đếm bài học hoàn thành hôm nay (lastAccessed trong ngày) */
    @Query("SELECT COUNT(p) FROM Progress p WHERE p.user.id = :userId AND p.isCompleted = true " +
           "AND p.lastAccessed >= :startOfDay AND p.lastAccessed < :endOfDay")
    Long countCompletedTodayByUserId(@Param("userId") Long userId,
                                    @Param("startOfDay") java.time.LocalDateTime startOfDay,
                                    @Param("endOfDay") java.time.LocalDateTime endOfDay);
}
