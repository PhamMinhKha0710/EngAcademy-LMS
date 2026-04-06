package com.englishlearn.infrastructure.persistence;

import com.englishlearn.domain.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {

    List<Lesson> findByTopicIdOrderByOrderIndexAsc(Long topicId);

    List<Lesson> findByIsPublishedTrueOrderByOrderIndexAsc();

    List<Lesson> findByDifficultyLevel(Integer level);

    List<Lesson> findByTopicIdAndDifficultyLevel(Long topicId, Integer difficultyLevel);

    List<Lesson> findByTopic_NameIgnoreCaseAndIsPublishedTrueOrderByOrderIndexAsc(String topicName);

    boolean existsByTitle(String title);
}
