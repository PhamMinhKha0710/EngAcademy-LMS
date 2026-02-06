package com.englishlearn.repository;

import com.englishlearn.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {

    List<Lesson> findByTopicIdOrderByOrderIndexAsc(Long topicId);

    List<Lesson> findByIsPublishedTrueOrderByOrderIndexAsc();

    List<Lesson> findByDifficultyLevel(Integer level);

    boolean existsByTitle(String title);
}
