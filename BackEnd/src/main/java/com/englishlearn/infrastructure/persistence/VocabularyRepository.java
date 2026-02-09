package com.englishlearn.infrastructure.persistence;

import com.englishlearn.domain.entity.Vocabulary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VocabularyRepository extends JpaRepository<Vocabulary, Long> {

    List<Vocabulary> findByLessonId(Long lessonId);

    Page<Vocabulary> findByLessonId(Long lessonId, Pageable pageable);

    @Query("SELECT v FROM Vocabulary v WHERE v.lesson.topic.id = :topicId")
    List<Vocabulary> findByTopicId(@Param("topicId") Long topicId);

    @Query("SELECT v FROM Vocabulary v WHERE LOWER(v.word) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Vocabulary> searchByWord(@Param("keyword") String keyword);

    @Query("SELECT v FROM Vocabulary v ORDER BY FUNCTION('RAND')")
    List<Vocabulary> findRandom(Pageable pageable);

    @Query("SELECT COUNT(v) FROM Vocabulary v WHERE v.lesson.id = :lessonId")
    Long countByLessonId(@Param("lessonId") Long lessonId);
}
