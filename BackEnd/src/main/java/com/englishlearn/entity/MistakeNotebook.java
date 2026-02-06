package com.englishlearn.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "MISTAKE_NOTEBOOK")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MistakeNotebook {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vocabulary_id")
    private Vocabulary vocabulary;

    @Column(name = "mistake_count", columnDefinition = "int default 1")
    @Builder.Default
    private Integer mistakeCount = 1;

    @Column(name = "user_recording_url", length = 500)
    private String userRecordingUrl;

    @Column(name = "added_at")
    private LocalDateTime addedAt;

    @PrePersist
    protected void onCreate() {
        addedAt = LocalDateTime.now();
    }
}
