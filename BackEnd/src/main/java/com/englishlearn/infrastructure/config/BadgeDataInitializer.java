package com.englishlearn.infrastructure.config;

import com.englishlearn.domain.entity.BadgeDefinition;
import com.englishlearn.domain.enums.BadgeDifficulty;
import com.englishlearn.domain.enums.BadgeGroup;
import com.englishlearn.infrastructure.persistence.BadgeDefinitionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * CommandLineRunner - Insert 24 badge definitions khi app khởi động (nếu chưa có).
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class BadgeDataInitializer {

    private final BadgeDefinitionRepository badgeDefinitionRepository;

    @Bean
    public CommandLineRunner initBadges() {
        return args -> {
            if (badgeDefinitionRepository.count() > 0) {
                log.info("Badge definitions already exist, skipping init.");
                return;
            }

            List<BadgeDefinition> badges = List.of(
                    // STREAK
                    create("streak_3", "Khởi đầu", "Học 3 ngày liên tiếp", "🔥", BadgeGroup.STREAK, BadgeDifficulty.EASY, false),
                    create("streak_7", "Tuần lửa", "Học 7 ngày liên tiếp", "⚡", BadgeGroup.STREAK, BadgeDifficulty.MEDIUM, false),
                    create("streak_30", "Tháng kiên trì", "Học 30 ngày liên tiếp", "🏆", BadgeGroup.STREAK, BadgeDifficulty.HARD, false),
                    create("night_owl", "Cú đêm", "Học sau 9 giờ tối", "🌙", BadgeGroup.STREAK, BadgeDifficulty.MEDIUM, false),
                    create("early_bird", "Chim sơn ca", "Học trước 7 giờ sáng 7 ngày liên tiếp", "🌅", BadgeGroup.STREAK, BadgeDifficulty.MEDIUM, false),
                    // LESSON
                    create("first_lesson", "Bước đầu", "Hoàn thành bài học đầu tiên", "📖", BadgeGroup.LESSON, BadgeDifficulty.EASY, false),
                    create("lesson_50", "Học giả", "Hoàn thành 50 bài học", "🎓", BadgeGroup.LESSON, BadgeDifficulty.HARD, false),
                    create("vocab_50", "Mầm từ vựng", "Học 50 từ vựng mới", "🌱", BadgeGroup.LESSON, BadgeDifficulty.EASY, false),
                    create("vocab_500", "Rừng từ vựng", "Học 500 từ vựng", "🌳", BadgeGroup.LESSON, BadgeDifficulty.HARD, false),
                    create("review_rush", "Ôn luyện thần tốc", "Ôn 20 từ trong 1 ngày", "🔁", BadgeGroup.LESSON, BadgeDifficulty.MEDIUM, false),
                    create("perfect_memory", "Ghi nhớ siêu tốc", "Nhớ 100% từ đã học (sau khi ôn >= 10 từ)", "📝", BadgeGroup.LESSON, BadgeDifficulty.MEDIUM, false),
                    // QUIZ
                    create("perfect_quiz", "Hoàn hảo", "Đạt 100% bài kiểm tra", "⭐", BadgeGroup.QUIZ, BadgeDifficulty.MEDIUM, false),
                    create("diamond", "Kim cương", "100% 5 bài liên tiếp", "💎", BadgeGroup.QUIZ, BadgeDifficulty.LEGENDARY, false),
                    create("speed_quiz", "Tốc độ ánh sáng", "Hoàn thành bài thi trong 2 phút với điểm >= 80%", "🚀", BadgeGroup.QUIZ, BadgeDifficulty.MEDIUM, false),
                    create("never_give_up", "Không bỏ cuộc", "Làm lại bài sau khi thất bại", "💪", BadgeGroup.QUIZ, BadgeDifficulty.EASY, false),
                    // LEVEL
                    create("level_2", "Gà con", "Đạt cấp 2", "🐣", BadgeGroup.LEVEL, BadgeDifficulty.EASY, false),
                    create("level_10", "Đại bàng", "Đạt cấp 10", "🦅", BadgeGroup.LEVEL, BadgeDifficulty.HARD, false),
                    create("king", "Vương giả", "Đứng đầu bảng xếp hạng", "👑", BadgeGroup.LEVEL, BadgeDifficulty.LEGENDARY, false),
                    create("sharpshooter", "Xạ thủ", "Hoàn thành 100% nhiệm vụ tuần", "🎯", BadgeGroup.LEVEL, BadgeDifficulty.HARD, false),
                    // SPECIAL
                    create("holiday_learner", "Học ngày lễ", "Học vào ngày nghỉ lễ", "🎄", BadgeGroup.SPECIAL, BadgeDifficulty.MEDIUM, false),
                    create("birthday_badge", "Sinh nhật", "Học vào ngày sinh nhật", "🎂", BadgeGroup.SPECIAL, BadgeDifficulty.MEDIUM, false),
                    // SOCIAL
                    create("good_friend", "Người bạn tốt", "Mời 3 bạn cùng học", "🤝", BadgeGroup.SOCIAL, BadgeDifficulty.MEDIUM, false),
                    create("pvp_warrior", "Đấu sĩ", "Thắng 5 thách thức bạn bè", "⚔️", BadgeGroup.SOCIAL, BadgeDifficulty.MEDIUM, false),
                    create("talker", "Nói chuyện hay", "Hoàn thành 10 bài hội thoại", "💬", BadgeGroup.SOCIAL, BadgeDifficulty.MEDIUM, false),
                    create("puzzle_master", "Giải đố", "Làm đúng mini game 10 lần", "🧩", BadgeGroup.SOCIAL, BadgeDifficulty.MEDIUM, false)
            );

            badgeDefinitionRepository.saveAll(badges);
            log.info("✅ Initialized {} badge definitions.", badges.size());
        };
    }

    private BadgeDefinition create(String key, String name, String desc, String emoji,
                                   BadgeGroup group, BadgeDifficulty diff, boolean secret) {
        return BadgeDefinition.builder()
                .badgeKey(key)
                .name(name)
                .description(desc)
                .iconEmoji(emoji)
                .groupName(group)
                .difficulty(diff)
                .isSecret(secret)
                .build();
    }
}
