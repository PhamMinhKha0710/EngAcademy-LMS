package com.englishlearn.repository;

import com.englishlearn.entity.Question;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionRepository extends JpaRepository<Question, Long> {

    List<Question> findByLessonId(Long lessonId);

    Page<Question> findByQuestionType(String questionType, Pageable pageable);

    @Query("SELECT q FROM Question q WHERE q.lesson.topic.id = :topicId")
    List<Question> findByTopicId(@Param("topicId") Long topicId);

    @Query("SELECT q FROM Question q WHERE q.questionType = :type ORDER BY FUNCTION('RAND')")
    List<Question> findRandomByType(@Param("type") String type, Pageable pageable);

    @Query("SELECT COUNT(q) FROM Question q WHERE q.lesson.id = :lessonId")
    Long countByLessonId(@Param("lessonId") Long lessonId);
}
