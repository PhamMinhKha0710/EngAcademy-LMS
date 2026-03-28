package com.englishlearn.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "LESSON_TAG", indexes = {
    @Index(name = "idx_lesson_tag_tag", columnList = "tag_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonTag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tag_id", nullable = false)
    private ContentTag tag;

    public static LessonTag of(Lesson lesson, ContentTag tag) {
        LessonTag lt = new LessonTag();
        lt.lesson = lesson;
        lt.tag = tag;
        return lt;
    }
}
