package com.englishlearn.infrastructure.persistence;

import com.englishlearn.domain.entity.FlashcardReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface FlashcardReviewRepository extends JpaRepository<FlashcardReview, Long> {

    @Query("""
        SELECT r FROM FlashcardReview r
        WHERE r.user.id = :userId
          AND r.nextReviewAt <= :today
        ORDER BY r.nextReviewAt ASC, r.easinessFactor ASC
        """)
    List<FlashcardReview> findDueToday(
            @Param("userId") Long userId,
            @Param("today") LocalDate today);

    @Query("""
        SELECT COUNT(r) FROM FlashcardReview r
        WHERE r.user.id = :userId
          AND r.nextReviewAt <= :today
        """)
    long countDueToday(
            @Param("userId") Long userId,
            @Param("today") LocalDate today);

    Optional<FlashcardReview> findByUserIdAndVocabularyId(Long userId, Long vocabularyId);

    Optional<FlashcardReview> findByUserIdAndGrammarId(Long userId, Long grammarId);

    @Query("""
        SELECT r FROM FlashcardReview r
        WHERE r.user.id = :userId
        ORDER BY r.nextReviewAt ASC
        """)
    List<FlashcardReview> findByUserId(@Param("userId") Long userId);
}
