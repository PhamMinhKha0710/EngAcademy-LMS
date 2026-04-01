package com.englishlearn.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "LESSON")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lesson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "topic_id")
    private Topic topic;

    @Column(name = "content_html", columnDefinition = "TEXT")
    private String contentHtml;

    @Column(name = "grammar_html", columnDefinition = "TEXT")
    private String grammarHtml;

    @Column(name = "audio_url", length = 500)
    private String audioUrl;

    @Column(name = "video_url", length = 500)
    private String videoUrl;

    @Column(name = "difficulty_level")
    private Integer difficultyLevel;

    @Column(name = "order_index")
    private Integer orderIndex;

    @Column(name = "is_published", columnDefinition = "boolean default false")
    @Builder.Default
    private Boolean isPublished = false;

    @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Vocabulary> vocabularies = new ArrayList<>();

    @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Question> questions = new ArrayList<>();
}
