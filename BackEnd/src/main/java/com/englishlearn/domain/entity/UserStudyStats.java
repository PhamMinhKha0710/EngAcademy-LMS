package com.englishlearn.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

/**
 * Thống kê học tập của user - dùng để kiểm tra điều kiện trao badge.
 * Được cập nhật từ User, Progress, UserVocabulary, ExamResult.
 */
@Entity
@Table(name = "USER_STUDY_STATS", uniqueConstraints = {
    @UniqueConstraint(columnNames = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStudyStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "current_streak", columnDefinition = "int default 0")
    @Builder.Default
    private Integer currentStreak = 0;

    @Column(name = "longest_streak", columnDefinition = "int default 0")
    @Builder.Default
    private Integer longestStreak = 0;

    @Column(name = "last_study_date")
    private LocalDate lastStudyDate;

    @Column(name = "total_lessons_completed", columnDefinition = "int default 0")
    @Builder.Default
    private Integer totalLessonsCompleted = 0;

    @Column(name = "lessons_completed_today", columnDefinition = "int default 0")
    @Builder.Default
    private Integer lessonsCompletedToday = 0;

    @Column(name = "total_words_learned", columnDefinition = "int default 0")
    @Builder.Default
    private Integer totalWordsLearned = 0;

    @Column(name = "words_reviewed_today", columnDefinition = "int default 0")
    @Builder.Default
    private Integer wordsReviewedToday = 0;

    @Column(name = "word_retention_rate", columnDefinition = "double default 0")
    @Builder.Default
    private Double wordRetentionRate = 0.0;

    @Column(name = "total_quizzes_taken", columnDefinition = "int default 0")
    @Builder.Default
    private Integer totalQuizzesTaken = 0;

    @Column(name = "consecutive_perfect_quizzes", columnDefinition = "int default 0")
    @Builder.Default
    private Integer consecutivePerfectQuizzes = 0;

    @Column(name = "last_quiz_score", columnDefinition = "int default 0")
    @Builder.Default
    private Integer lastQuizScore = 0;

    @Column(name = "last_quiz_duration_seconds", columnDefinition = "int default 0")
    @Builder.Default
    private Integer lastQuizDurationSeconds = 0;

    @Column(name = "quiz_retake_after_fail", columnDefinition = "boolean default false")
    @Builder.Default
    private Boolean quizRetakeAfterFail = false;

    @Column(name = "last_study_hour", columnDefinition = "int default 0")
    @Builder.Default
    private Integer lastStudyHour = 0;

    @Column(name = "early_morning_streak", columnDefinition = "int default 0")
    @Builder.Default
    private Integer earlyMorningStreak = 0;

    @Column(name = "friends_invited", columnDefinition = "int default 0")
    @Builder.Default
    private Integer friendsInvited = 0;

    @Column(name = "pvp_wins", columnDefinition = "int default 0")
    @Builder.Default
    private Integer pvpWins = 0;

    @Column(name = "dialogues_completed", columnDefinition = "int default 0")
    @Builder.Default
    private Integer dialoguesCompleted = 0;

    @Column(name = "mini_games_correct", columnDefinition = "int default 0")
    @Builder.Default
    private Integer miniGamesCorrect = 0;

    @Column(name = "current_level", columnDefinition = "int default 1")
    @Builder.Default
    private Integer currentLevel = 1;

    @Column(name = "weekly_tasks_completion_rate", columnDefinition = "double default 0")
    @Builder.Default
    private Double weeklyTasksCompletionRate = 0.0;

    @Column(name = "is_top_of_leaderboard", columnDefinition = "boolean default false")
    @Builder.Default
    private Boolean isTopOfLeaderboard = false;
}
