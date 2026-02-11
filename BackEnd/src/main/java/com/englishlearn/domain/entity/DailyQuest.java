package com.englishlearn.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "DAILY_QUEST")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyQuest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "quest_date", nullable = false)
    private LocalDate questDate;

    @Column(name = "is_completed", columnDefinition = "boolean default false")
    @Builder.Default
    private Boolean isCompleted = false;

    @OneToMany(mappedBy = "dailyQuest", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DailyQuestTask> tasks = new ArrayList<>();
}
