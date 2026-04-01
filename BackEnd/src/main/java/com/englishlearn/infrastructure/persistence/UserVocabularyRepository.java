package com.englishlearn.infrastructure.persistence;

import com.englishlearn.domain.entity.UserVocabulary;
import com.englishlearn.domain.entity.VocabStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserVocabularyRepository extends JpaRepository<UserVocabulary, Long> {

    Optional<UserVocabulary> findByUserIdAndVocabularyId(Long userId, Long vocabularyId);

    Long countByUserIdAndStatus(Long userId, VocabStatus status);

    @Query("SELECT COUNT(uv) FROM UserVocabulary uv " +
           "WHERE uv.user.id = :userId AND uv.vocabulary.lesson.topic.id = :topicId AND uv.status = :status")
    Long countByUserIdAndTopicIdAndStatus(@Param("userId") Long userId,
                                          @Param("topicId") Long topicId,
                                          @Param("status") VocabStatus status);

    @Query("SELECT uv FROM UserVocabulary uv JOIN FETCH uv.vocabulary v JOIN FETCH v.lesson " +
           "WHERE uv.user.id = :userId AND uv.status = 'MASTERED' ORDER BY uv.lastReviewedAt DESC")
    List<UserVocabulary> findMasteredByUserId(@Param("userId") Long userId);

    /** Đếm từ đã ôn hôm nay (lastReviewedAt trong ngày) */
    @Query("SELECT COUNT(uv) FROM UserVocabulary uv WHERE uv.user.id = :userId " +
           "AND uv.lastReviewedAt >= :startOfDay AND uv.lastReviewedAt < :endOfDay")
    Long countReviewedTodayByUserId(@Param("userId") Long userId,
                                    @Param("startOfDay") java.time.LocalDateTime startOfDay,
                                    @Param("endOfDay") java.time.LocalDateTime endOfDay);
}
