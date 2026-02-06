package com.englishlearn.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "CLASS")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id")
    private User teacher;

    @Column(name = "academic_year", length = 20)
    private String academicYear;

    @Column(name = "is_active", columnDefinition = "boolean default true")
    @Builder.Default
    private Boolean isActive = true;
}
