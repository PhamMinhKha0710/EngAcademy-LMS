package com.englishlearn.infrastructure.persistence;

import com.englishlearn.domain.entity.DailyQuestTask;
import com.englishlearn.domain.entity.DailyQuest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DailyQuestTaskRepository extends JpaRepository<DailyQuestTask, Long> {
    List<DailyQuestTask> findByDailyQuest(DailyQuest dailyQuest);

    List<DailyQuestTask> findByDailyQuestAndIsCompletedFalse(DailyQuest dailyQuest);

    Optional<DailyQuestTask> findByDailyQuestAndTaskType(DailyQuest dailyQuest, String taskType);
}
