package com.englishlearn.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "EXAM", indexes = {
    @Index(name = "idx_exam_class", columnList = "class_id"),
    @Index(name = "idx_exam_teacher", columnList = "teacher_id"),
    @Index(name = "idx_exam_status", columnList = "status"),
    @Index(name = "idx_exam_time", columnList = "start_time, end_time")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_id", nullable = false)
    private ClassRoom classRoom;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "shuffle_questions", columnDefinition = "boolean default true")
    @Builder.Default
    private Boolean shuffleQuestions = true;

    @Column(name = "shuffle_answers", columnDefinition = "boolean default true")
    @Builder.Default
    private Boolean shuffleAnswers = true;

    @Column(name = "anti_cheat_enabled", columnDefinition = "boolean default true")
    @Builder.Default
    private Boolean antiCheatEnabled = true;

    @Column(length = 20)
    @Builder.Default
    private String status = "DRAFT"; // DRAFT, PUBLISHED, CLOSED

    @Column(name = "score_published", columnDefinition = "boolean default false")
    @Builder.Default
    private Boolean scorePublished = false;

    @ManyToMany
    @JoinTable(name = "EXAM_QUESTION", joinColumns = @JoinColumn(name = "exam_id"), inverseJoinColumns = @JoinColumn(name = "question_id"))
    @Builder.Default
    private Set<Question> questions = new HashSet<>();
}
