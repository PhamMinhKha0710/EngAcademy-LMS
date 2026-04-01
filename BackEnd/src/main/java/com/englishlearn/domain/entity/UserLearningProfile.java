package com.englishlearn.domain.entity;

import com.englishlearn.domain.enums.CefrLevel;
import com.englishlearn.domain.enums.LearningGoal;
import com.englishlearn.domain.enums.LearningSkill;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "USER_LEARNING_PROFILE", uniqueConstraints = {
    @UniqueConstraint(columnNames = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserLearningProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "grammar_level", nullable = false, length = 10)
    @Builder.Default
    private CefrLevel grammarLevel = CefrLevel.A1;

    @Enumerated(EnumType.STRING)
    @Column(name = "vocabulary_level", nullable = false, length = 10)
    @Builder.Default
    private CefrLevel vocabularyLevel = CefrLevel.A1;

    @Enumerated(EnumType.STRING)
    @Column(name = "reading_level", nullable = false, length = 10)
    @Builder.Default
    private CefrLevel readingLevel = CefrLevel.A1;

    @Enumerated(EnumType.STRING)
    @Column(name = "listening_level", nullable = false, length = 10)
    @Builder.Default
    private CefrLevel listeningLevel = CefrLevel.A1;

    @Enumerated(EnumType.STRING)
    @Column(name = "overall_level", nullable = false, length = 10)
    @Builder.Default
    private CefrLevel overallLevel = CefrLevel.A1;

    @Enumerated(EnumType.STRING)
    @Column(name = "primary_goal", nullable = false, length = 20)
    @Builder.Default
    private LearningGoal primaryGoal = LearningGoal.COMMUNICATION;

    @Column(name = "daily_target_minutes", columnDefinition = "int default 15")
    @Builder.Default
    private Integer dailyTargetMinutes = 15;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "PROFILE_PREFERRED_TOPICS",
            joinColumns = @JoinColumn(name = "profile_id"))
    @Column(name = "topic")
    @Builder.Default
    private Set<String> preferredTopics = new HashSet<>();

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "PROFILE_WEAK_SKILLS",
            joinColumns = @JoinColumn(name = "profile_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "skill")
    @Builder.Default
    private Set<LearningSkill> weakSkills = new HashSet<>();

    @Column(name = "onboarding_completed", columnDefinition = "boolean default false")
    @Builder.Default
    private Boolean onboardingCompleted = false;

    @Column(name = "onboarding_completed_at")
    private LocalDateTime onboardingCompletedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        recalculateOverallLevel();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        recalculateOverallLevel();
    }

    public void recalculateOverallLevel() {
        int avgOrder = (grammarLevel.getOrder() + vocabularyLevel.getOrder()
                + readingLevel.getOrder() + listeningLevel.getOrder()) / 4;
        this.overallLevel = CefrLevel.fromOrder(Math.round(avgOrder));
    }

    public CefrLevel getLevelForSkill(LearningSkill skill) {
        return switch (skill) {
            case GRAMMAR -> grammarLevel;
            case VOCABULARY -> vocabularyLevel;
            case READING -> readingLevel;
            case LISTENING -> listeningLevel;
        };
    }

    public void setLevelForSkill(LearningSkill skill, CefrLevel level) {
        switch (skill) {
            case GRAMMAR -> this.grammarLevel = level;
            case VOCABULARY -> this.vocabularyLevel = level;
            case READING -> this.readingLevel = level;
            case LISTENING -> this.listeningLevel = level;
        }
        recalculateOverallLevel();
    }

    public void completeOnboarding() {
        this.onboardingCompleted = true;
        this.onboardingCompletedAt = LocalDateTime.now();
    }
}
