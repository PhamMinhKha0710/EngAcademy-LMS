package com.englishlearn.infrastructure.persistence;

import com.englishlearn.domain.entity.DailyQuest;
import com.englishlearn.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DailyQuestRepository extends JpaRepository<DailyQuest, Long> {

    Optional<DailyQuest> findByUserIdAndQuestDate(Long userId, LocalDate questDate);

    Optional<DailyQuest> findByUserAndQuestDate(User user, LocalDate questDate);

    List<DailyQuest> findByUserId(Long userId);

    List<DailyQuest> findByUserOrderByQuestDateDesc(User user);

    boolean existsByUserIdAndQuestDate(Long userId, LocalDate questDate);

    @Query("SELECT dq FROM DailyQuest dq WHERE dq.user.id = :userId AND dq.isCompleted = true ORDER BY dq.questDate DESC")
    List<DailyQuest> findCompletedByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(dq) FROM DailyQuest dq WHERE dq.user.id = :userId AND dq.isCompleted = true")
    Long countCompletedByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(dq) FROM DailyQuest dq WHERE dq.user.id = :userId AND dq.questDate BETWEEN :startDate AND :endDate AND dq.isCompleted = true")
    Long countCompletedInDateRange(@Param("userId") Long userId, @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
