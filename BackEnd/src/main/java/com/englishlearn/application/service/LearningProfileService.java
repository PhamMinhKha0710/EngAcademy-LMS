package com.englishlearn.application.service;

import com.englishlearn.application.dto.request.CompleteOnboardingRequest;
import com.englishlearn.application.dto.request.UpdateLearningProfileRequest;
import com.englishlearn.application.dto.response.LearningProfileResponse;
import com.englishlearn.domain.entity.User;
import com.englishlearn.domain.entity.UserLearningProfile;
import com.englishlearn.domain.enums.CefrLevel;
import com.englishlearn.domain.enums.LearningGoal;
import com.englishlearn.domain.enums.LearningSkill;
import com.englishlearn.domain.exception.ResourceNotFoundException;
import com.englishlearn.infrastructure.persistence.UserLearningProfileRepository;
import com.englishlearn.infrastructure.persistence.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class LearningProfileService {

    private final UserLearningProfileRepository profileRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public LearningProfileResponse getProfile(Long userId) {
        UserLearningProfile profile = profileRepository.findByUserId(userId)
                .orElse(null);
        return toResponse(profile, false);
    }

    @Transactional(readOnly = true)
    public LearningProfileResponse getProfileOrThrow(Long userId) {
        UserLearningProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Learning profile not found for user: " + userId));
        return toResponse(profile, true);
    }

    @Transactional
    public LearningProfileResponse completeOnboarding(Long userId, CompleteOnboardingRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        UserLearningProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> UserLearningProfile.builder()
                        .user(user)
                        .grammarLevel(CefrLevel.A1)
                        .vocabularyLevel(CefrLevel.A1)
                        .readingLevel(CefrLevel.A1)
                        .listeningLevel(CefrLevel.A1)
                        .overallLevel(CefrLevel.A1)
                        .preferredTopics(new HashSet<>())
                        .weakSkills(new HashSet<>())
                        .build());

        profile.setPrimaryGoal(request.getPrimaryGoal());
        profile.setDailyTargetMinutes(request.getDailyTargetMinutes());
        if (request.getPreferredTopics() != null) {
            profile.setPreferredTopics(new HashSet<>(request.getPreferredTopics()));
        }
        profile.completeOnboarding();
        profile.recalculateOverallLevel();

        UserLearningProfile saved = profileRepository.save(profile);
        log.info("Onboarding completed for user {}: overall={}, goal={}",
                userId, saved.getOverallLevel(), saved.getPrimaryGoal());
        return toResponse(saved, true);
    }

    @Transactional
    public LearningProfileResponse updateProfile(Long userId, UpdateLearningProfileRequest request) {
        UserLearningProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Learning profile not found for user: " + userId));

        if (request.getGrammarLevel() != null) {
            profile.setGrammarLevel(request.getGrammarLevel());
        }
        if (request.getVocabularyLevel() != null) {
            profile.setVocabularyLevel(request.getVocabularyLevel());
        }
        if (request.getReadingLevel() != null) {
            profile.setReadingLevel(request.getReadingLevel());
        }
        if (request.getListeningLevel() != null) {
            profile.setListeningLevel(request.getListeningLevel());
        }
        if (request.getPrimaryGoal() != null) {
            profile.setPrimaryGoal(request.getPrimaryGoal());
        }
        if (request.getDailyTargetMinutes() != null) {
            profile.setDailyTargetMinutes(request.getDailyTargetMinutes());
        }
        if (request.getPreferredTopics() != null) {
            profile.setPreferredTopics(new HashSet<>(request.getPreferredTopics()));
        }
        profile.recalculateOverallLevel();

        UserLearningProfile saved = profileRepository.save(profile);
        log.info("Profile updated for user {}: overall={}", userId, saved.getOverallLevel());
        return toResponse(saved, true);
    }

    @Transactional
    public LearningProfileResponse setSkillLevel(Long userId, LearningSkill skill, CefrLevel level) {
        UserLearningProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Learning profile not found for user: " + userId));

        profile.setLevelForSkill(skill, level);
        profile.recalculateOverallLevel();

        UserLearningProfile saved = profileRepository.save(profile);
        log.info("Skill {} updated to {} for user {}: overall={}",
                skill, level, userId, saved.getOverallLevel());
        return toResponse(saved, true);
    }

    @Transactional
    public LearningProfileResponse updateWeakSkills(Long userId, Set<LearningSkill> weakSkills) {
        UserLearningProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Learning profile not found for user: " + userId));
        profile.setWeakSkills(new HashSet<>(weakSkills));
        UserLearningProfile saved = profileRepository.save(profile);
        return toResponse(saved, true);
    }

    @Transactional(readOnly = true)
    public boolean hasCompletedOnboarding(Long userId) {
        return profileRepository.findByUserId(userId)
                .map(UserLearningProfile::getOnboardingCompleted)
                .orElse(false);
    }

    private LearningProfileResponse toResponse(UserLearningProfile profile, boolean throwIfNull) {
        if (profile == null) {
            if (throwIfNull) {
                throw new ResourceNotFoundException("Learning profile not found");
            }
            return LearningProfileResponse.builder()
                    .hasCompletedOnboarding(false)
                    .onboardingCompleted(false)
                    .build();
        }
        return LearningProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .grammarLevel(profile.getGrammarLevel())
                .vocabularyLevel(profile.getVocabularyLevel())
                .readingLevel(profile.getReadingLevel())
                .listeningLevel(profile.getListeningLevel())
                .overallLevel(profile.getOverallLevel())
                .primaryGoal(profile.getPrimaryGoal())
                .dailyTargetMinutes(profile.getDailyTargetMinutes())
                .preferredTopics(profile.getPreferredTopics())
                .weakSkills(profile.getWeakSkills())
                .onboardingCompleted(profile.getOnboardingCompleted())
                .hasCompletedOnboarding(profile.getOnboardingCompleted())
                .build();
    }
}
