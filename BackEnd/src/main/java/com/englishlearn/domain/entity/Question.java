package com.englishlearn.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "QUESTION", indexes = {
    @Index(name = "idx_question_lesson", columnList = "lesson_id"),
    @Index(name = "idx_question_vocab", columnList = "vocabulary_id"),
    @Index(name = "idx_question_type", columnList = "question_type")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id")
    private Lesson lesson;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vocabulary_id")
    private Vocabulary vocabulary;

    @Column(name = "question_type", length = 50)
    private String questionType; // MULTIPLE_CHOICE, FILL_IN_BLANK, TRUE_FALSE, ESSAY

    @Column(name = "question_text", columnDefinition = "TEXT", nullable = false)
    private String questionText;

    @Column(columnDefinition = "int default 1")
    @Builder.Default
    private Integer points = 1;

    @Column(columnDefinition = "TEXT")
    private String explanation;
}
