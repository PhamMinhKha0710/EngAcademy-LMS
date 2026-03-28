package com.englishlearn.infrastructure.persistence;

import com.englishlearn.domain.entity.LearningEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface LearningEventRepository extends JpaRepository<LearningEvent, Long> {

    @Query("""
        SELECT e FROM LearningEvent e
        WHERE e.userId = :userId
          AND e.createdAt >= :since
        ORDER BY e.createdAt DESC
        """)
    List<LearningEvent> findByUserIdSince(
            @Param("userId") Long userId,
            @Param("since") LocalDateTime since);

    @Query("""
        SELECT e FROM LearningEvent e
        WHERE e.userId = :userId
          AND e.skill = :skill
          AND e.createdAt >= :since
          AND e.isCorrect IS NOT NULL
        ORDER BY e.createdAt DESC
        """)
    List<LearningEvent> findAnswerEventsBySkillSince(
            @Param("userId") Long userId,
            @Param("skill") com.englishlearn.domain.enums.LearningSkill skill,
            @Param("since") LocalDateTime since);

    @Query("""
        SELECT COUNT(e) FROM LearningEvent e
        WHERE e.userId = :userId
          AND e.eventType = :eventType
          AND e.createdAt >= :since
        """)
    long countEventsSince(
            @Param("userId") Long userId,
            @Param("eventType") String eventType,
            @Param("since") LocalDateTime since);

    @Query("""
        SELECT AVG(e.timeSpentSeconds) FROM LearningEvent e
        WHERE e.userId = :userId
          AND e.skill = :skill
          AND e.createdAt >= :since
          AND e.timeSpentSeconds IS NOT NULL
        """)
    Double avgTimeSpentSince(
            @Param("userId") Long userId,
            @Param("skill") com.englishlearn.domain.enums.LearningSkill skill,
            @Param("since") LocalDateTime since);
}
