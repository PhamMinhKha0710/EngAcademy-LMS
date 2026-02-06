package com.englishlearn.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "DAILY_QUEST_TASK")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyQuestTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "daily_quest_id", nullable = false)
    private DailyQuest dailyQuest;

    @Column(name = "task_type", nullable = false, length = 50)
    private String taskType; // LEARN_VOCAB, COMPLETE_LESSON, SCORE_EXAM

    @Column(name = "target_count")
    private Integer targetCount;

    @Column(name = "current_count", columnDefinition = "int default 0")
    @Builder.Default
    private Integer currentCount = 0;

    @Column(name = "is_completed", columnDefinition = "boolean default false")
    @Builder.Default
    private Boolean isCompleted = false;
}
