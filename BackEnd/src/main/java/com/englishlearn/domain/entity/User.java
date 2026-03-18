package com.englishlearn.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "USERS", indexes = {
    @Index(name = "idx_user_coins", columnList = "coins"),
    @Index(name = "idx_user_streak", columnList = "streak_days"),
    @Index(name = "idx_user_school", columnList = "school_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false, length = 50)
    private String username;

    @Column(unique = true, nullable = false, length = 100)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "full_name", length = 100)
    private String fullName;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(columnDefinition = "int default 0")
    @Builder.Default
    private Integer coins = 0;

    @Column(name = "streak_days", columnDefinition = "int default 0")
    @Builder.Default
    private Integer streakDays = 0;

    @Column(name = "is_active", columnDefinition = "boolean default true")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "ROLE_USER", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "role_id"))
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id")
    private School school;

    // ===== User preferences for settings page =====

    @Column(name = "sound_effects_enabled", columnDefinition = "boolean default true")
    @Builder.Default
    private Boolean soundEffectsEnabled = true;

    @Column(name = "daily_reminders_enabled", columnDefinition = "boolean default true")
    @Builder.Default
    private Boolean dailyRemindersEnabled = true;

    /**
     * Nullable: if null, follow system/default theme. true = dark, false = light.
     */
    @Column(name = "prefers_dark_mode")
    private Boolean prefersDarkMode;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
