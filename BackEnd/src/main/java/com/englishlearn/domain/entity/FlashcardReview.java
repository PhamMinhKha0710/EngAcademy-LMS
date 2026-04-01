package com.englishlearn.domain.entity;

import com.englishlearn.domain.entity.Grammar;
import com.englishlearn.domain.entity.User;
import com.englishlearn.domain.entity.Vocabulary;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "FLASHCARD_REVIEW", indexes = {
    @Index(name = "idx_review_user_next", columnList = "user_id, next_review_at"),
    @Index(name = "idx_review_vocab_user", columnList = "user_id, vocabulary_id")
}, uniqueConstraints = {
    @UniqueConstraint(name = "idx_review_user_vocab", columnNames = {"user_id", "vocabulary_id"}),
    @UniqueConstraint(name = "idx_review_user_grammar", columnNames = {"user_id", "grammar_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlashcardReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Optimistic lock version field.
     * Prevents concurrent SM-2 updates from overwriting each other's changes.
     * JPA throws OptimisticLockException when the version mismatches.
     */
    @Version
    private Long version;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vocabulary_id")
    private Vocabulary vocabulary;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "grammar_id")
    private Grammar grammar;

    @Column(name = "easiness_factor", nullable = false)
    @Builder.Default
    private Double easinessFactor = 2.5;

    @Column(name = "interval_days", nullable = false)
    @Builder.Default
    private Integer intervalDays = 1;

    @Column(nullable = false)
    @Builder.Default
    private Integer repetitions = 0;

    @Column(name = "next_review_at", nullable = false)
    private LocalDate nextReviewAt;

    @Column(name = "last_reviewed_at")
    private LocalDateTime lastReviewedAt;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (nextReviewAt == null) {
            nextReviewAt = LocalDate.now();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /**
     * Apply SM-2 algorithm.
     * quality: 0–5 (0=complete blackout, 1=wrong but remembered on seeing, 2=wrong but easy to recall,
     *           3=correct with difficulty, 4=correct with hesitation, 5=perfect)
     */
    public void applySM2(int quality) {
        this.lastReviewedAt = LocalDateTime.now();

        if (quality >= 3) {
            if (repetitions == 0) {
                intervalDays = 1;
            } else if (repetitions == 1) {
                intervalDays = 6;
            } else {
                intervalDays = (int) Math.round(intervalDays * easinessFactor);
            }
            repetitions++;
        } else {
            repetitions = 0;
            intervalDays = 1;
        }

        // Update easiness factor: EF' = EF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        double efDelta = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
        this.easinessFactor = Math.max(1.3, this.easinessFactor + efDelta);

        this.nextReviewAt = LocalDate.now().plusDays(intervalDays);
    }
}
