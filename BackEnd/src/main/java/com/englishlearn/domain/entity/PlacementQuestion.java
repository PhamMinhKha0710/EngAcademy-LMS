package com.englishlearn.domain.entity;

import com.englishlearn.domain.enums.CefrLevel;
import com.englishlearn.domain.enums.PlacementSkill;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "PLACEMENT_QUESTION", indexes = {
    @Index(name = "idx_placement_skill_cefr", columnList = "skill, cefr_band, is_active")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlacementQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "skill", nullable = false, length = 20)
    private PlacementSkill skill;

    @Enumerated(EnumType.STRING)
    @Column(name = "cefr_band", nullable = false, length = 10)
    private CefrLevel cefrBand;

    @Column(name = "difficulty_weight", nullable = false)
    @Builder.Default
    private Double difficultyWeight = 0.5;

    @Column(name = "question_text", columnDefinition = "TEXT", nullable = false)
    private String questionText;

    @Column(name = "correct_answer", length = 500)
    private String correctAnswer;

    @Column(columnDefinition = "TEXT")
    private String explanation;

    @Column(name = "option_a", length = 500)
    private String optionA;

    @Column(name = "option_b", length = 500)
    private String optionB;

    @Column(name = "option_c", length = 500)
    private String optionC;

    @Column(name = "option_d", length = 500)
    private String optionD;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
