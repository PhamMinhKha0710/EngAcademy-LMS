package com.englishlearn.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "QUESTION_OPTION")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionOption {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "option_text", columnDefinition = "TEXT", nullable = false)
    private String optionText;

    @Column(name = "is_correct", columnDefinition = "boolean default false")
    @Builder.Default
    private Boolean isCorrect = false;
}
