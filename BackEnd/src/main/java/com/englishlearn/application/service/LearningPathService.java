package com.englishlearn.application.service;

import com.englishlearn.application.dto.response.LearningPathResponse;
import com.englishlearn.application.dto.response.LearningPathResponse.PathNodeResponse;
import com.englishlearn.domain.entity.*;
import com.englishlearn.domain.enums.CefrLevel;
import com.englishlearn.domain.enums.LearningGoal;
import com.englishlearn.domain.enums.LearningSkill;
import com.englishlearn.domain.exception.ResourceNotFoundException;
import com.englishlearn.infrastructure.persistence.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LearningPathService {

    private final UserLearningProfileRepository profileRepository;
    private final LessonRepository lessonRepository;
    private final ProgressRepository progressRepository;

    /**
     * Get the recommended learning path for a user.
     * Falls back to rule-based graph traversal when ML service is not available.
     *
     * Integration contract for Phase 3 ML:
     *   Spring → GET http://ml-service:8001/api/recommend-path/{userId}
     *   If service unavailable or <1000 users, use rule-based path.
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "learningPath", key = "#userId")
    public LearningPathResponse getRecommendedPath(Long userId) {
        var profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile not found for user: " + userId));

        // TODO Phase 3: Call FastAPI ML service
        // try {
        //     return mlClient.getRecommendedPath(userId);
        // } catch (Exception e) {
        //     log.warn("ML service unavailable, falling back to rule-based: {}", e.getMessage());
        //     return buildRuleBasedPath(userId, profile);
        // }

        return buildRuleBasedPath(userId, profile);
    }

    private LearningPathResponse buildRuleBasedPath(Long userId, UserLearningProfile profile) {
        CefrLevel overall = profile.getOverallLevel();
        LearningGoal goal = profile.getPrimaryGoal();
        Set<String> topics = profile.getPreferredTopics();
        var weakSkills = profile.getWeakSkills();

        // Fetch completed lessons
        Set<Long> completedLessonIds = progressRepository.findByUserId(userId).stream()
                .filter(p -> Boolean.TRUE.equals(p.getIsCompleted()))
                .map(p -> p.getLesson().getId())
                .collect(Collectors.toSet());

        List<Lesson> candidates = lessonRepository.findByIsPublishedTrueOrderByOrderIndexAsc().stream()
                .filter(l -> !completedLessonIds.contains(l.getId()))
                .sorted(Comparator.comparingInt(l -> l.getOrderIndex() != null ? l.getOrderIndex() : 0))
                .limit(20)
                .toList();

        List<PathNodeResponse> nodes = new ArrayList<>();
        int order = 0;
        for (Lesson lesson : candidates) {
            Integer diffLevel = lesson.getDifficultyLevel() != null ? lesson.getDifficultyLevel() : 3;
            CefrLevel lessonCefr = CefrLevel.fromOrder(Math.min(6, Math.max(1, diffLevel)));

            String reason = buildReason(lessonCefr, overall, weakSkills, topics);

            nodes.add(PathNodeResponse.builder()
                    .nodeId(null) // no pre-defined node id in rule-based
                    .lessonId(lesson.getId())
                    .lessonTitle(lesson.getTitle())
                    .skill("VOCABULARY")
                    .cefrLevel(lessonCefr.name())
                    .orderIndex(order++)
                    .estimatedMinutes(15)
                    .isRequired(false)
                    .prerequisiteNodeIds(List.of())
                    .isCompleted(false)
                    .completionPercentage(0)
                    .build());

            if (nodes.size() >= 10) break;
        }

        return LearningPathResponse.builder()
                .pathId(null)
                .name("Lộ trình cá nhân cho " + overall.name() + " — " + goal.name())
                .description("Lộ trình tự động dựa trên trình độ và kỹ năng yếu của bạn")
                .targetCefr(overall.name())
                .targetGoal(goal.name())
                .estimatedDays(nodes.size())
                .nodes(nodes)
                .build();
    }

    private String buildReason(CefrLevel lessonCefr, CefrLevel overall, Set<LearningSkill> weakSkills, Set<String> topics) {
        if (weakSkills != null && !weakSkills.isEmpty()) {
            return "Luyện kỹ năng yếu — phù hợp CEFR " + lessonCefr.name();
        }
        return "Bài học CEFR " + lessonCefr.name() + " phù hợp với trình độ " + overall.name();
    }

    /**
     * Evicts the cached learning path for a user.
     * Call this after a user completes a lesson or updates their profile.
     */
    @CacheEvict(value = "learningPath", key = "#userId")
    public void evictLearningPath(Long userId) {
        log.debug("Evicted learning path cache for user {}", userId);
    }
}
