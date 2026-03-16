package com.englishlearn.domain.entity;

import com.englishlearn.domain.enums.BadgeDifficulty;
import com.englishlearn.domain.enums.BadgeGroup;
import jakarta.persistence.*;
import lombok.*;

/**
 * Định nghĩa badge toàn cục - danh mục badge có sẵn trong hệ thống.
 * Mỗi badge có badgeKey duy nhất để tra cứu điều kiện đạt được.
 */
@Entity
@Table(name = "BADGE_DEFINITION", uniqueConstraints = {
    @UniqueConstraint(columnNames = "badge_key")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BadgeDefinition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "badge_key", nullable = false, unique = true, length = 50)
    private String badgeKey;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(name = "icon_emoji", length = 10)
    private String iconEmoji;

    @Enumerated(EnumType.STRING)
    @Column(name = "group_name", nullable = false, length = 20)
    private BadgeGroup groupName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BadgeDifficulty difficulty;

    @Column(name = "is_secret", columnDefinition = "boolean default false")
    @Builder.Default
    private Boolean isSecret = false;
}
