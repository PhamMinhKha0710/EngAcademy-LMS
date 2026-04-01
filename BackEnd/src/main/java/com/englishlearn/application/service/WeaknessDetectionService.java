package com.englishlearn.application.service;

import com.englishlearn.domain.entity.LearningEvent;
import com.englishlearn.domain.entity.UserLearningProfile;
import com.englishlearn.domain.enums.CefrLevel;
import com.englishlearn.domain.enums.LearningSkill;
import com.englishlearn.infrastructure.persistence.LearningEventRepository;
import com.englishlearn.infrastructure.persistence.UserLearningProfileRepository;
import com.englishlearn.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class WeaknessDetectionService {

    private static final int DAYS_LOOKBACK = 7;
    private static final int MIN_ANSWERS_PER_SKILL = 3;
    private static final double WEAK_ACCURACY_THRESHOLD = 0.6;
    private static final int PAGE_SIZE = 100;

    private final LearningEventRepository eventRepository;
    private final UserLearningProfileRepository profileRepository;
    private final UserRepository userRepository;

    /**
     * Runs nightly at 2 AM.
     * Processes users in batches with REQUIRES_NEW per user so a single failure
     * does not rollback the entire job. In a multi-instance deployment, use
     * ShedLock (@SchedulerLock) to prevent duplicate execution.
     */
    @Scheduled(cron = "0 0 2 * * *")
    public void detectAndUpdateWeaknesses() {
        log.info("Starting nightly weakness detection job");
        LocalDateTime since = LocalDateTime.now().minusDays(DAYS_LOOKBACK);
        int pageNum = 0;
        int updated = 0;
        int failed = 0;

        Page<com.englishlearn.domain.entity.User> page;
        do {
            page = userRepository.findAll(PageRequest.of(pageNum++, PAGE_SIZE));
            for (var user : page.getContent()) {
                try {
                    boolean changed = updateWeakSkillsNewTx(user.getId(), since);
                    if (changed) updated++;
                } catch (Exception e) {
                    failed++;
                    log.warn("Weakness detection failed for user {}: {}", user.getId(), e.getMessage());
                }
            }
        } while (page.hasNext());

        log.info("Nightly weakness detection complete: {} profiles updated, {} failed");
    }

    /**
     * Runs in a separate transaction so one user's failure does not rollback others.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public boolean updateWeakSkillsNewTx(Long userId, LocalDateTime since) {
        return updateWeakSkills(userId, since);
    }

    @Transactional
    public boolean updateWeakSkills(Long userId, LocalDateTime since) {
        Optional<UserLearningProfile> opt = profileRepository.findByUserId(userId);
        if (opt.isEmpty()) return false;

        UserLearningProfile profile = opt.get();
        Set<LearningSkill> newWeak = new HashSet<>();

        for (LearningSkill skill : LearningSkill.values()) {
            List<LearningEvent> events = eventRepository
                    .findAnswerEventsBySkillSince(userId, skill, since);

            if (events == null || events.size() < MIN_ANSWERS_PER_SKILL) {
                continue;
            }

            long correct = events.stream()
                    .filter(e -> Boolean.TRUE.equals(e.getIsCorrect()))
                    .count();

            double accuracy = (double) correct / events.size();

            if (accuracy < WEAK_ACCURACY_THRESHOLD) {
                newWeak.add(skill);
                log.debug("User {} skill {} is weak: accuracy={} ({}/{})",
                        userId, skill, String.format("%.2f", accuracy), correct, events.size());
            }
        }

        if (!newWeak.equals(profile.getWeakSkills())) {
            profile.setWeakSkills(newWeak);
            profileRepository.save(profile);
            log.info("Updated weak skills for user {}: {}", userId, newWeak);
            return true;
        }

        return false;
    }

    /**
     * Called after placement result — sync weak skills based on relative band.
     * Skills at the weakest level become weak initially.
     */
    @Transactional
    public void seedWeakSkillsFromPlacement(Long userId) {
        Optional<UserLearningProfile> opt = profileRepository.findByUserId(userId);
        if (opt.isEmpty()) return;

        UserLearningProfile profile = opt.get();

        Map<LearningSkill, CefrLevel> levels = Map.of(
                LearningSkill.GRAMMAR, profile.getGrammarLevel(),
                LearningSkill.VOCABULARY, profile.getVocabularyLevel(),
                LearningSkill.READING, profile.getReadingLevel(),
                LearningSkill.LISTENING, profile.getListeningLevel()
        );

        int minOrder = levels.values().stream()
                .mapToInt(CefrLevel::getOrder)
                .min()
                .orElse(3);

        Set<LearningSkill> weak = new HashSet<>();
        for (var e : levels.entrySet()) {
            if (e.getValue().getOrder() <= minOrder) {
                weak.add(e.getKey());
            }
        }

        if (!weak.isEmpty()) {
            profile.setWeakSkills(weak);
            profileRepository.save(profile);
            log.info("Seeded weak skills from placement for user {}: {}", userId, weak);
        }
    }
}
