package com.englishlearn.domain.entity;

import com.englishlearn.domain.enums.LearningSkill;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "LEARNING_EVENT", indexes = {
    @Index(name = "idx_event_user", columnList = "user_id"),
    @Index(name = "idx_event_type", columnList = "event_type"),
    @Index(name = "idx_event_created", columnList = "created_at"),
    @Index(name = "idx_event_user_created", columnList = "user_id, created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType;

    @Column(name = "content_type", length = 50)
    private String contentType;

    @Column(name = "content_id")
    private Long contentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "skill", length = 20)
    private LearningSkill skill;

    @Column(name = "cefr_level", length = 10)
    private String cefrLevel;

    @Column(name = "is_correct")
    private Boolean isCorrect;

    @Column(name = "time_spent_seconds")
    private Integer timeSpentSeconds;

    @Column(name = "session_id", length = 100)
    private String sessionId;

    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
