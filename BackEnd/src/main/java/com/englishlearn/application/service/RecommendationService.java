package com.englishlearn.application.service;

import com.englishlearn.application.dto.response.RecommendationResponse;
import com.englishlearn.application.dto.response.RecommendationResponse.RecommendedLesson;
import com.englishlearn.domain.entity.*;
import com.englishlearn.domain.enums.CefrLevel;
import com.englishlearn.domain.enums.LearningSkill;
import com.englishlearn.infrastructure.persistence.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {

    private static final double DIFFICULTY_WINDOW = 0.2;
    private static final int MAX_RECOMMENDATIONS = 10;
    private static final int DAYS_LOOKBACK = 7;

    private final LessonRepository lessonRepository;
    private final ProgressRepository progressRepository;
    private final LearningEventRepository eventRepository;
    private final UserLearningProfileRepository profileRepository;

    @Transactional(readOnly = true)
    public RecommendationResponse getDailyRecommendations(Long userId) {
        var profile = profileRepository.findByUserId(userId).orElse(null);
        if (profile == null) {
            return getDefaultRecommendations();
        }

        var weakSkills = profile.getWeakSkills();
        var preferredTopics = profile.getPreferredTopics();
        var overallLevel = profile.getOverallLevel();

        Map<LearningSkill, CefrLevel> skillLevels = Map.of(
                LearningSkill.GRAMMAR, profile.getGrammarLevel(),
                LearningSkill.VOCABULARY, profile.getVocabularyLevel(),
                LearningSkill.READING, profile.getReadingLevel(),
                LearningSkill.LISTENING, profile.getListeningLevel()
        );

        Set<Long> completed = progressRepository.findByUserId(userId).stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsCompleted()))
                .map(p -> p.getLesson().getId())
                .collect(Collectors.toSet());

        Set<RecommendedLesson> result = new LinkedHashSet<>();
        List<String> reasons = new ArrayList<>();

        // 1) Prioritize weak skills
        if (weakSkills != null && !weakSkills.isEmpty()) {
            for (LearningSkill weak : weakSkills) {
                CefrLevel targetLevel = skillLevels.getOrDefault(weak, overallLevel);
                List<RecommendedLesson> lessons = getLessonsForSkillAndLevel(
                        weak, targetLevel, DIFFICULTY_WINDOW, completed);
                for (var lesson : lessons) {
                    if (result.size() >= MAX_RECOMMENDATIONS) break;
                    result.add(lesson);
                    reasons.add("Luyện kỹ năng yếu: " + weak.name());
                }
            }
        }

        // 2) Preferred topics
        if (preferredTopics != null && !preferredTopics.isEmpty()) {
            for (String topic : preferredTopics) {
                if (result.size() >= MAX_RECOMMENDATIONS) break;
                var topicLessons = getLessonsByTopic(topic, completed, overallLevel);
                result.addAll(topicLessons.subList(0, Math.min(topicLessons.size(), 3)));
                reasons.add("Theo sở thích: " + topic);
            }
        }

        // 3) Fill with at-level lessons
        if (result.size() < MAX_RECOMMENDATIONS) {
            var fillLessons = getLessonsForSkillAndLevel(
                    LearningSkill.VOCABULARY, overallLevel, DIFFICULTY_WINDOW, completed);
            for (var lesson : fillLessons) {
                if (result.size() >= MAX_RECOMMENDATIONS) break;
                result.add(lesson);
            }
        }

        return RecommendationResponse.builder()
                .total(result.size())
                .lessons(new ArrayList<>(result))
                .reasons(reasons)
                .build();
    }

    private List<RecommendedLesson> getLessonsForSkillAndLevel(
            LearningSkill skill, CefrLevel level, double window, Set<Long> excludeIds) {
        List<Lesson> candidates = lessonRepository.findByIsPublishedTrueOrderByOrderIndexAsc();
        int targetOrder = level.getOrder();
        int minOrder = Math.max(1, targetOrder - 1);
        int maxOrder = Math.min(6, targetOrder + 1);

        return candidates.stream()
                .filter(l -> !excludeIds.contains(l.getId()))
                .filter(l -> {
                    int diff = l.getDifficultyLevel() != null ? l.getDifficultyLevel() : 3;
                    return diff >= minOrder && diff <= maxOrder;
                })
                .sorted(Comparator.comparingInt(l -> l.getOrderIndex() != null ? l.getOrderIndex() : 0))
                .limit(5)
                .map(l -> toRecommended(l, "Luyện " + skill.name().toLowerCase()))
                .collect(Collectors.toList());
    }

    private List<RecommendedLesson> getLessonsByTopic(String topic, Set<Long> excludeIds, CefrLevel level) {
        return lessonRepository.findByTopicNameIgnoreCaseAndIsPublishedTrueOrderByOrderIndexAsc(topic).stream()
                .filter(l -> !excludeIds.contains(l.getId()))
                .limit(3)
                .map(l -> toRecommended(l, "Chủ đề: " + topic))
                .collect(Collectors.toList());
    }

    private RecommendationResponse getDefaultRecommendations() {
        List<Lesson> lessons = lessonRepository.findByIsPublishedTrueOrderByOrderIndexAsc();
        List<RecommendedLesson> recommended = lessons.stream()
                .limit(MAX_RECOMMENDATIONS)
                .map(l -> toRecommended(l, "Bài học được đề xuất"))
                .collect(Collectors.toList());

        return RecommendationResponse.builder()
                .total(recommended.size())
                .lessons(recommended)
                .build();
    }

    private RecommendedLesson toRecommended(Lesson l, String reason) {
        String cefr = DIFFICULTY_MAP.getOrDefault(l.getDifficultyLevel(), "B1");
        return RecommendedLesson.builder()
                .lessonId(l.getId())
                .title(l.getTitle())
                .difficultyLevel(l.getDifficultyLevel())
                .topicName(l.getTopic() != null ? l.getTopic().getName() : null)
                .completionPercentage(0)
                .isCompleted(false)
                .cefrLevel(cefr)
                .reason(reason)
                .relevanceScore(0.5)
                .build();
    }

    private static final Map<Integer, String> DIFFICULTY_MAP = Map.ofEntries(
            Map.entry(1, "A1"), Map.entry(2, "A1"), Map.entry(3, "A2"),
            Map.entry(4, "A2"), Map.entry(5, "B1"), Map.entry(6, "B1"),
            Map.entry(7, "B2"), Map.entry(8, "B2"), Map.entry(9, "C1"), Map.entry(10, "C2")
    );
}
