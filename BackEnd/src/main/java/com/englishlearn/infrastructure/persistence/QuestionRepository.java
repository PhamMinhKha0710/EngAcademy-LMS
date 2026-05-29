package com.englishlearn.infrastructure.persistence;

import com.englishlearn.domain.entity.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    @Query("""
            SELECT q.id FROM Question q
            WHERE (:lessonId IS NULL OR q.lesson.id = :lessonId)
              AND (:questionType IS NULL OR q.questionType = :questionType)
            """)
    Page<Long> findQuestionIds(
            @Param("lessonId") Long lessonId,
            @Param("questionType") String questionType,
            Pageable pageable);

    @Query("""
            SELECT DISTINCT q FROM Question q
            LEFT JOIN FETCH q.lesson
            LEFT JOIN FETCH q.vocabulary
            WHERE q.id IN :ids
            """)
    List<Question> findByIdsWithLessonAndVocabulary(@Param("ids") Collection<Long> ids);

    List<Question> findByLessonId(Long lessonId);

    Page<Question> findByQuestionType(String questionType, Pageable pageable);

    @Query("SELECT q FROM Question q WHERE q.lesson.topic.id = :topicId")
    List<Question> findByTopicId(@Param("topicId") Long topicId);

    @Query("SELECT q FROM Question q WHERE q.questionType = :type ORDER BY FUNCTION('RAND')")
    List<Question> findRandomByType(@Param("type") String type, Pageable pageable);

    @Query("SELECT COUNT(q) FROM Question q WHERE q.lesson.id = :lessonId")
    Long countByLessonId(@Param("lessonId") Long lessonId);

    /**
     * Tìm câu hỏi theo lesson ID với options (fetch join)
     */
    @Query("SELECT DISTINCT q FROM Question q LEFT JOIN FETCH q.lesson WHERE q.lesson.id = :lessonId")
    List<Question> findByLessonIdWithOptions(@Param("lessonId") Long lessonId);
}
