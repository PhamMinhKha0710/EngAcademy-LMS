package com.englishlearn.infrastructure.persistence;

import com.englishlearn.domain.entity.Lesson;
import com.englishlearn.domain.entity.LessonTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LessonTagRepository extends JpaRepository<LessonTag, Long> {

    void deleteByLessonId(Long lessonId);

    @Query("SELECT lt.tag.id FROM LessonTag lt WHERE lt.lesson.id = :lessonId")
    List<Long> findTagIdsByLessonId(@Param("lessonId") Long lessonId);

    @Query("""
        SELECT DISTINCT lt.lesson FROM LessonTag lt
        JOIN lt.tag t
        WHERE t.id IN :tagIds
          AND lt.lesson.isPublished = true
        """)
    List<Lesson> findPublishedByTagIds(@Param("tagIds") List<Long> tagIds);
}
