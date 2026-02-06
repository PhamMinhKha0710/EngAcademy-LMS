package com.englishlearn.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ROLE")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String name;

    @Column(length = 255)
    private String description;

    // Role constants
    public static final String ADMIN = "ROLE_ADMIN";
    public static final String SCHOOL = "ROLE_SCHOOL";
    public static final String TEACHER = "ROLE_TEACHER";
    public static final String STUDENT = "ROLE_STUDENT";
}
