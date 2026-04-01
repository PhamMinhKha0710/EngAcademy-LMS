package com.englishlearn.service;

import com.englishlearn.application.dto.response.BadgeDTO;
import com.englishlearn.application.dto.response.BadgeProgressDTO;
import com.englishlearn.application.dto.response.CheckBadgeResponse;
import com.englishlearn.application.event.BadgeEventPublisher;
import com.englishlearn.application.service.BadgeCheckService;
import com.englishlearn.application.service.BadgeDefinitionService;
import com.englishlearn.application.service.BadgeEvaluator;
import com.englishlearn.application.service.BadgeProgressService;
import com.englishlearn.domain.entity.BadgeDefinition;
import com.englishlearn.domain.entity.User;
import com.englishlearn.domain.entity.UserStudyStats;
import com.englishlearn.domain.enums.BadgeDifficulty;
import com.englishlearn.domain.enums.BadgeGroup;
import com.englishlearn.domain.exception.ResourceNotFoundException;
import com.englishlearn.infrastructure.persistence.BadgeDefinitionRepository;
import com.englishlearn.infrastructure.persistence.UserBadgeRepository;
import com.englishlearn.infrastructure.persistence.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

/**
 * Unit test cho Badge system - BadgeEvaluator, BadgeProgressService, BadgeCheckService, BadgeDefinitionService.
 */
@ExtendWith(MockitoExtension.class)
class BadgeServiceTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private BadgeDefinitionRepository badgeDefinitionRepository;
    @Mock
    private UserBadgeRepository userBadgeRepository;
    @Mock
    private BadgeEventPublisher badgeEventPublisher;

    private User testUser;
    private BadgeDefinition streak3Badge;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@test.com")
                .passwordHash("hash")
                .fullName("Test User")
                .streakDays(5)
                .coins(100)
                .build();
        streak3Badge = BadgeDefinition.builder()
                .id(1L)
                .badgeKey("streak_3")
                .name("Khởi đầu")
                .description("Học 3 ngày liên tiếp")
                .iconEmoji("🔥")
                .groupName(BadgeGroup.STREAK)
                .difficulty(BadgeDifficulty.EASY)
                .isSecret(false)
                .build();
    }

    @Test
    @DisplayName("checkAndAward trả về badge mới khi đủ điều kiện")
    void checkAndAward_traVeBadgeMoiKhiDuDieuKien() {
        // Cần BadgeEvaluatorImpl với các mock - test qua BadgeCheckService
        // Vì BadgeEvaluatorImpl phụ thuộc nhiều service, ta test BadgeCheckService với mock BadgeEvaluator
        BadgeEvaluator mockEvaluator = mock(BadgeEvaluator.class);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(mockEvaluator.checkAndAward(1L)).thenReturn(List.of(
                BadgeDTO.builder().badgeKey("streak_3").name("Khởi đầu").earnedAt(java.time.LocalDateTime.now()).build()
        ));
        when(userBadgeRepository.countByUserId(1L)).thenReturn(1L);

        BadgeCheckService service = new BadgeCheckService(userRepository, mockEvaluator, userBadgeRepository);
        CheckBadgeResponse response = service.checkAndAward(1L);

        assertThat(response.getNewlyEarnedBadges()).hasSize(1);
        assertThat(response.getNewlyEarnedBadges().get(0).getBadgeKey()).isEqualTo("streak_3");
        assertThat(response.getTotalBadgesEarned()).isEqualTo(1);
    }

    @Test
    @DisplayName("checkAndAward không trả badge trùng - user đã có badge")
    void checkAndAward_khongTraBadgeTrung() {
        BadgeEvaluator mockEvaluator = mock(BadgeEvaluator.class);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(mockEvaluator.checkAndAward(1L)).thenReturn(List.of());
        when(userBadgeRepository.countByUserId(1L)).thenReturn(1L);

        BadgeCheckService service = new BadgeCheckService(userRepository, mockEvaluator, userBadgeRepository);
        CheckBadgeResponse response = service.checkAndAward(1L);

        assertThat(response.getNewlyEarnedBadges()).isEmpty();
        assertThat(response.getTotalBadgesEarned()).isEqualTo(1);
    }

    @Test
    @DisplayName("checkAndAward user không tồn tại throw ResourceNotFoundException")
    void checkAndAward_userKhongTonTai_throwResourceNotFoundException() {
        when(userRepository.findById(999L)).thenReturn(Optional.empty());

        BadgeCheckService service = new BadgeCheckService(userRepository, mock(BadgeEvaluator.class), userBadgeRepository);

        assertThatThrownBy(() -> service.checkAndAward(999L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Người dùng");
    }

    @Test
    @DisplayName("getProgress trả về đúng percentComplete")
    void getProgress_traVeDungPercentComplete() {
        com.englishlearn.application.service.UserStudyStatsService mockStatsService = mock(com.englishlearn.application.service.UserStudyStatsService.class);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(badgeDefinitionRepository.findByBadgeKey("streak_3")).thenReturn(Optional.of(streak3Badge));
        when(userBadgeRepository.existsByUserIdAndBadgeBadgeKey(1L, "streak_3")).thenReturn(false);

        UserStudyStats stats = UserStudyStats.builder()
                .currentStreak(2)
                .totalLessonsCompleted(0)
                .totalWordsLearned(0)
                .wordsReviewedToday(0)
                .wordRetentionRate(0.0)
                .totalQuizzesTaken(0)
                .consecutivePerfectQuizzes(0)
                .lastQuizScore(0)
                .lastQuizDurationSeconds(0)
                .quizRetakeAfterFail(false)
                .currentLevel(1)
                .weeklyTasksCompletionRate(0.0)
                .isTopOfLeaderboard(false)
                .friendsInvited(0)
                .pvpWins(0)
                .dialoguesCompleted(0)
                .miniGamesCorrect(0)
                .lessonsCompletedToday(0)
                .earlyMorningStreak(0)
                .build();
        when(mockStatsService.refreshStats(1L)).thenReturn(stats);

        BadgeProgressService service = new BadgeProgressService(userRepository, badgeDefinitionRepository, userBadgeRepository, mockStatsService);
        BadgeProgressDTO dto = service.getProgress(1L, "streak_3");

        assertThat(dto.getBadgeKey()).isEqualTo("streak_3");
        assertThat(dto.getCurrentValue()).isEqualTo(2);
        assertThat(dto.getRequiredValue()).isEqualTo(3);
        assertThat(dto.getPercentComplete()).isEqualTo(2.0 / 3.0 * 100);
    }

    @Test
    @DisplayName("getAllProgress trả về danh sách badge chưa đạt")
    void getAllProgress_traVeDanhSachBadgeChuaDat() {
        com.englishlearn.application.service.UserStudyStatsService mockStatsService = mock(com.englishlearn.application.service.UserStudyStatsService.class);
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(badgeDefinitionRepository.findAll()).thenReturn(List.of(streak3Badge));
        when(userBadgeRepository.existsByUserIdAndBadgeId(1L, 1L)).thenReturn(false);

        UserStudyStats stats = UserStudyStats.builder()
                .currentStreak(1)
                .totalLessonsCompleted(0)
                .totalWordsLearned(0)
                .wordsReviewedToday(0)
                .wordRetentionRate(0.0)
                .totalQuizzesTaken(0)
                .consecutivePerfectQuizzes(0)
                .lastQuizScore(0)
                .lastQuizDurationSeconds(0)
                .quizRetakeAfterFail(false)
                .currentLevel(1)
                .weeklyTasksCompletionRate(0.0)
                .isTopOfLeaderboard(false)
                .friendsInvited(0)
                .pvpWins(0)
                .dialoguesCompleted(0)
                .miniGamesCorrect(0)
                .lessonsCompletedToday(0)
                .earlyMorningStreak(0)
                .build();
        when(mockStatsService.refreshStats(1L)).thenReturn(stats);

        BadgeProgressService service = new BadgeProgressService(userRepository, badgeDefinitionRepository, userBadgeRepository, mockStatsService);
        List<BadgeProgressDTO> list = service.getAllProgress(1L);

        assertThat(list).hasSize(1);
        assertThat(list.get(0).getBadgeKey()).isEqualTo("streak_3");
    }

    @Test
    @DisplayName("badgeSecret không hiện trong getAllBadges")
    void badgeSecret_khongHienTrongGetAllBadges() {
        BadgeDefinition secretBadge = BadgeDefinition.builder()
                .id(2L)
                .badgeKey("secret_badge")
                .name("Bí mật")
                .description("Badge bí mật")
                .iconEmoji("❓")
                .groupName(BadgeGroup.SPECIAL)
                .difficulty(BadgeDifficulty.LEGENDARY)
                .isSecret(true)
                .build();
        when(badgeDefinitionRepository.findAll()).thenReturn(List.of(streak3Badge, secretBadge));

        BadgeDefinitionService service = new BadgeDefinitionService(badgeDefinitionRepository, userBadgeRepository, userRepository);
        List<BadgeDTO> list = service.getAllBadges(null);

        assertThat(list).hasSize(1);
        assertThat(list.get(0).getBadgeKey()).isEqualTo("streak_3");
    }
}
