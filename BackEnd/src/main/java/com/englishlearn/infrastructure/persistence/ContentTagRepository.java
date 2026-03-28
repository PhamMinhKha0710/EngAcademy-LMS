package com.englishlearn.infrastructure.persistence;

import com.englishlearn.domain.entity.ContentTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ContentTagRepository extends JpaRepository<ContentTag, Long> {

    Optional<ContentTag> findByName(String name);

    List<ContentTag> findByCategory(String category);

    @Query("SELECT t FROM ContentTag t JOIN t.lessonTags lt WHERE lt.lesson.id = :lessonId")
    List<ContentTag> findByLessonId(@Param("lessonId") Long lessonId);
}
