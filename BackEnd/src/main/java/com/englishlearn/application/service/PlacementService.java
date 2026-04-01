package com.englishlearn.application.service;

import com.englishlearn.application.dto.request.PlacementAnswerRequest;
import com.englishlearn.application.dto.response.PlacementAnswerAccepted;
import com.englishlearn.application.dto.response.PlacementQuestionResponse;
import com.englishlearn.application.dto.response.PlacementResultResponse;
import com.englishlearn.domain.entity.PlacementQuestion;
import com.englishlearn.domain.entity.UserLearningProfile;
import com.englishlearn.domain.enums.CefrLevel;
import com.englishlearn.domain.enums.PlacementSkill;
import com.englishlearn.infrastructure.persistence.PlacementQuestionRepository;
import com.englishlearn.infrastructure.persistence.UserLearningProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlacementService {

    private static final String SESSION_KEY_PREFIX = "placement:session:";
    private static final Duration SESSION_TTL = Duration.ofHours(24);

    private static final int QUESTIONS_PER_SKILL = 7;
    private static final int ADAPTIVE_STEP = 1;

    private static final List<CefrLevel> ALL_LEVELS = List.of(
            CefrLevel.A1, CefrLevel.A2, CefrLevel.B1, CefrLevel.B2, CefrLevel.C1, CefrLevel.C2);

    private static final Map<PlacementSkill, Double> SKILL_WEIGHTS = Map.of(
            PlacementSkill.GRAMMAR, 0.30,
            PlacementSkill.VOCABULARY, 0.30,
            PlacementSkill.READING, 0.25,
            PlacementSkill.LISTENING, 0.15);

    private final PlacementQuestionRepository questionRepository;
    private final UserLearningProfileRepository profileRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final @Lazy LearningPathService learningPathService;
    private final @Lazy ProgressService progressService;

    @Transactional(readOnly = true)
    public PlacementQuestionResponse getNextQuestion(String sessionId) {
        PlacementSession session = loadSession(sessionId);

        if (session.isComplete()) {
            return null;
        }

        PlacementSkill currentSkill = session.getCurrentSkill();
        CefrLevel currentBand = session.getCurrentBand(currentSkill);

        PlacementQuestion question = selectQuestion(session, currentSkill, currentBand);
        if (question == null) {
            log.warn("No placement question found for skill={}, band={}", currentSkill, currentBand);
            session.setCurrentSkillIndex(session.getCurrentSkillIndex() + 1);
            if (session.getCurrentSkillIndex() >= PlacementSkill.values().length) {
                session.setComplete(true);
            }
            saveSession(sessionId, session);
            return getNextQuestion(sessionId);
        }

        PlacementQuestionResponse response = toQuestionResponse(question, session);
        return response;
    }

    @Transactional
    public PlacementAnswerAccepted submitAnswer(String sessionId, PlacementAnswerRequest answer, Long userId) {
        String lockKey = SESSION_KEY_PREFIX + "lock:" + sessionId;
        Boolean acquired = null;
        try {
            acquired = redisTemplate.opsForValue()
                    .setIfAbsent(lockKey, "1", Duration.ofSeconds(5));
            if (!Boolean.TRUE.equals(acquired)) {
                throw new IllegalStateException("Phiên đang được xử lý. Vui lòng thử lại.");
            }

            PlacementSession session = loadSession(sessionId);

            PlacementQuestion question = questionRepository.findById(answer.getQuestionId())
                    .orElseThrow(() -> new IllegalArgumentException("Question not found: " + answer.getQuestionId()));

            boolean correct = question.getCorrectAnswer() != null
                    && question.getCorrectAnswer().equalsIgnoreCase(answer.getSelectedAnswer().trim());

            session.recordAnswer(question.getSkill(), correct);
            session.recordQuestionId(question.getSkill(), question.getId());

            if (session.isComplete()) {
                PlacementResultResponse result = buildResult(session, userId);
                redisTemplate.delete(SESSION_KEY_PREFIX + sessionId);
                return PlacementAnswerAccepted.finished(result);
            }

            if (correct) {
                session.increaseBand(question.getSkill());
            } else {
                session.decreaseBand(question.getSkill());
            }

            session.advanceSkill();
            saveSession(sessionId, session);

            return PlacementAnswerAccepted.moreQuestions();
        } finally {
            if (Boolean.TRUE.equals(acquired)) {
                redisTemplate.delete(lockKey);
            }
        }
    }

    public PlacementResultResponse getResult(String sessionId, Long userId) {
        PlacementSession session = loadSession(sessionId);
        if (!session.isComplete()) {
            return null;
        }
        return buildResult(session, userId);
    }

    public String createSession() {
        String sessionId = UUID.randomUUID().toString();
        PlacementSession session = new PlacementSession();
        session.setSessionId(sessionId);
        session.setCurrentSkillIndex(0);
        saveSession(sessionId, session);
        return sessionId;
    }

    private PlacementQuestion selectQuestion(PlacementSession session, PlacementSkill skill, CefrLevel band) {
        List<CefrLevel> targetBands = buildBandWindow(band);

        List<PlacementQuestion> pool = questionRepository.findBySkillAndCefrBands(skill, targetBands);

        if (pool.isEmpty()) {
            pool = questionRepository.findBySkillOrderByBand(skill);
        }

        List<PlacementQuestion> candidates = pool.stream()
                .filter(q -> !session.getAnsweredIds(skill).contains(q.getId()))
                .toList();

        if (candidates.isEmpty()) {
            candidates = pool;
        }

        if (candidates.isEmpty()) {
            return null;
        }

        return candidates.get(0);
    }

    private List<CefrLevel> buildBandWindow(CefrLevel current) {
        int idx = current.getOrder() - 1;
        int start = Math.max(0, idx - 1);
        int end = Math.min(ALL_LEVELS.size() - 1, idx + 1);
        return ALL_LEVELS.subList(start, end + 1);
    }

    private PlacementQuestionResponse toQuestionResponse(PlacementQuestion q, PlacementSession session) {
        List<String> options = new ArrayList<>();
        if (q.getOptionA() != null) options.add(q.getOptionA());
        if (q.getOptionB() != null) options.add(q.getOptionB());
        if (q.getOptionC() != null) options.add(q.getOptionC());
        if (q.getOptionD() != null) options.add(q.getOptionD());

        int totalPerSkill = QUESTIONS_PER_SKILL * PlacementSkill.values().length;
        int answered = session.getTotalAnswered();

        return PlacementQuestionResponse.builder()
                .questionId(q.getId())
                .skill(q.getSkill())
                .questionText(q.getQuestionText())
                .options(options)
                .questionIndex(answered)
                .totalQuestions(totalPerSkill)
                .sessionId(session.getSessionId())
                .build();
    }

    private PlacementResultResponse buildResult(PlacementSession session, Long userId) {
        Map<PlacementSkill, CefrLevel> skillLevels = new EnumMap<>(PlacementSkill.class);
        Map<PlacementSkill, Integer> correctCounts = new EnumMap<>(PlacementSkill.class);
        Map<PlacementSkill, Integer> totalCounts = new EnumMap<>(PlacementSkill.class);

        double weightedSum = 0;
        double totalWeight = 0;

        for (PlacementSkill skill : PlacementSkill.values()) {
            CefrLevel level = session.getFinalBand(skill);
            skillLevels.put(skill, level);

            int correct = session.getCorrectCount(skill);
            int total = session.getTotalCount(skill);
            correctCounts.put(skill, correct);
            totalCounts.put(skill, total);

            double weight = SKILL_WEIGHTS.getOrDefault(skill, 0.25);
            weightedSum += level.getOrder() * weight;
            totalWeight += weight;
        }

        CefrLevel overall = CefrLevel.fromOrder((int) Math.round(weightedSum / totalWeight));

        CefrLevel weakestSkillBand = skillLevels.entrySet().stream()
                .min(Comparator.comparingInt(e -> e.getValue().getOrder()))
                .map(Map.Entry::getValue)
                .orElse(overall);

        CefrLevel effectiveStart = weakestSkillBand.stepDown();

        if (userId != null) {
            updateProfile(userId, skillLevels);
            learningPathService.evictLearningPath(userId);
        }

        return PlacementResultResponse.builder()
                .sessionId(session.getSessionId())
                .completed(true)
                .skillLevels(skillLevels)
                .grammarLevel(skillLevels.get(PlacementSkill.GRAMMAR))
                .vocabularyLevel(skillLevels.get(PlacementSkill.VOCABULARY))
                .readingLevel(skillLevels.get(PlacementSkill.READING))
                .listeningLevel(skillLevels.get(PlacementSkill.LISTENING))
                .overallLevel(overall)
                .effectiveStartLevel(effectiveStart)
                .correctCounts(correctCounts)
                .totalCounts(totalCounts)
                .build();
    }

    private void updateProfile(Long userId, Map<PlacementSkill, CefrLevel> skillLevels) {
        Optional<UserLearningProfile> opt = profileRepository.findByUserId(userId);
        if (opt.isEmpty()) {
            log.warn("UserLearningProfile not found for user {} — skipping profile update", userId);
            return;
        }

        UserLearningProfile profile = opt.get();

        profile.setGrammarLevel(skillLevels.getOrDefault(PlacementSkill.GRAMMAR, CefrLevel.A1));
        profile.setVocabularyLevel(skillLevels.getOrDefault(PlacementSkill.VOCABULARY, CefrLevel.A1));
        profile.setReadingLevel(skillLevels.getOrDefault(PlacementSkill.READING, CefrLevel.A1));
        profile.setListeningLevel(skillLevels.getOrDefault(PlacementSkill.LISTENING, CefrLevel.A1));
        profile.recalculateOverallLevel();
        profile.completeOnboarding();

        profileRepository.save(profile);
        log.info("Placement result applied to user {}: overall={}", userId, profile.getOverallLevel());

        try {
            int credited = progressService.creditLessonsBelowOverallCefr(userId, profile.getOverallLevel());
            if (credited > 0) {
                log.info("Placement auto-credit: user {} — {} easier lessons (and vocab) marked done", userId, credited);
            }
        } catch (Exception e) {
            log.warn("Placement auto-credit failed for user {}: {}", userId, e.getMessage());
        }
    }

    private PlacementSession loadSession(String sessionId) {
        String key = SESSION_KEY_PREFIX + sessionId;
        try {
            Object raw = redisTemplate.opsForValue().get(key);
            if (raw == null) {
                throw new IllegalStateException("Invalid or missing placement session: " + sessionId);
            }
            if (raw instanceof PlacementSession) {
                return (PlacementSession) raw;
            }
            if (raw instanceof Map) {
                return PlacementSession.fromMap(castToStringObjectMap(raw));
            }
            throw new IllegalStateException("Invalid session data format: " + raw.getClass().getName());
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            log.warn("Failed to load placement session {}: {}", sessionId, e.getMessage());
            throw new IllegalStateException("Invalid or missing placement session: " + sessionId);
        }
    }

    @SuppressWarnings("unchecked")
    private static Map<String, Object> castToStringObjectMap(Object raw) {
        if (raw instanceof Map) return (Map<String, Object>) raw;
        throw new IllegalStateException("Unexpected type: " + raw.getClass().getName());
    }

    private void saveSession(String sessionId, PlacementSession session) {
        String key = SESSION_KEY_PREFIX + sessionId;
        redisTemplate.opsForValue().set(key, session.toMap(), SESSION_TTL.toSeconds(), TimeUnit.SECONDS);
    }

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class PlacementSession {
        private String sessionId;
        private int currentSkillIndex;
        private boolean complete;

        private CefrLevel grammarBand = CefrLevel.A2;
        private CefrLevel vocabBand = CefrLevel.A2;
        private CefrLevel readingBand = CefrLevel.A2;
        private CefrLevel listeningBand = CefrLevel.A2;

        private int grammarCorrect = 0;
        private int grammarTotal = 0;
        private int vocabCorrect = 0;
        private int vocabTotal = 0;
        private int readingCorrect = 0;
        private int readingTotal = 0;
        private int listeningCorrect = 0;
        private int listeningTotal = 0;

        private List<Long> grammarAnsweredIds = new ArrayList<>();
        private List<Long> vocabAnsweredIds = new ArrayList<>();
        private List<Long> readingAnsweredIds = new ArrayList<>();
        private List<Long> listeningAnsweredIds = new ArrayList<>();

        public PlacementSkill getCurrentSkill() {
            PlacementSkill[] skills = PlacementSkill.values();
            if (currentSkillIndex >= skills.length) {
                return skills[skills.length - 1];
            }
            return skills[currentSkillIndex];
        }

        public CefrLevel getCurrentBand(PlacementSkill skill) {
            return switch (skill) {
                case GRAMMAR -> grammarBand;
                case VOCABULARY -> vocabBand;
                case READING -> readingBand;
                case LISTENING -> listeningBand;
            };
        }

        public CefrLevel getFinalBand(PlacementSkill skill) {
            CefrLevel band = getCurrentBand(skill);
            int count = getTotalCount(skill);
            int correct = getCorrectCount(skill);
            if (count == 0) return band;

            double accuracy = (double) correct / count;
            if (accuracy >= 0.8 && count >= 4) {
                return band.stepUp();
            } else if (accuracy <= 0.3 && count >= 4) {
                return band.stepDown();
            }
            return band;
        }

        public int getCorrectCount(PlacementSkill skill) {
            return switch (skill) {
                case GRAMMAR -> grammarCorrect;
                case VOCABULARY -> vocabCorrect;
                case READING -> readingCorrect;
                case LISTENING -> listeningCorrect;
            };
        }

        public int getTotalCount(PlacementSkill skill) {
            return switch (skill) {
                case GRAMMAR -> grammarTotal;
                case VOCABULARY -> vocabTotal;
                case READING -> readingTotal;
                case LISTENING -> listeningTotal;
            };
        }

        public List<Long> getAnsweredIds(PlacementSkill skill) {
            return switch (skill) {
                case GRAMMAR -> grammarAnsweredIds;
                case VOCABULARY -> vocabAnsweredIds;
                case READING -> readingAnsweredIds;
                case LISTENING -> listeningAnsweredIds;
            };
        }

        public void recordQuestionId(PlacementSkill skill, Long questionId) {
            if (questionId == null) return;
            switch (skill) {
                case GRAMMAR -> { if (!grammarAnsweredIds.contains(questionId)) grammarAnsweredIds.add(questionId); }
                case VOCABULARY -> { if (!vocabAnsweredIds.contains(questionId)) vocabAnsweredIds.add(questionId); }
                case READING -> { if (!readingAnsweredIds.contains(questionId)) readingAnsweredIds.add(questionId); }
                case LISTENING -> { if (!listeningAnsweredIds.contains(questionId)) listeningAnsweredIds.add(questionId); }
            }
        }

        public int getTotalAnswered() {
            return grammarTotal + vocabTotal + readingTotal + listeningTotal;
        }

        public void recordAnswer(PlacementSkill skill, boolean correct) {
            if (correct) {
                switch (skill) {
                    case GRAMMAR -> grammarCorrect++;
                    case VOCABULARY -> vocabCorrect++;
                    case READING -> readingCorrect++;
                    case LISTENING -> listeningCorrect++;
                }
            }
            switch (skill) {
                case GRAMMAR -> grammarTotal++;
                case VOCABULARY -> vocabTotal++;
                case READING -> readingTotal++;
                case LISTENING -> listeningTotal++;
            }
        }

        public void increaseBand(PlacementSkill skill) {
            CefrLevel current = getCurrentBand(skill);
            CefrLevel next = current.stepUp();
            setBand(skill, next);
        }

        public void decreaseBand(PlacementSkill skill) {
            CefrLevel current = getCurrentBand(skill);
            CefrLevel next = current.stepDown();
            setBand(skill, next);
        }

        private void setBand(PlacementSkill skill, CefrLevel band) {
            switch (skill) {
                case GRAMMAR -> grammarBand = band;
                case VOCABULARY -> vocabBand = band;
                case READING -> readingBand = band;
                case LISTENING -> listeningBand = band;
            }
        }

        public void advanceSkill() {
            PlacementSkill[] skills = PlacementSkill.values();
            int currentSkillTotal = getTotalCount(skills[currentSkillIndex]);
            if (currentSkillTotal >= QUESTIONS_PER_SKILL) {
                currentSkillIndex++;
            }
            if (currentSkillIndex >= skills.length) {
                complete = true;
            }
        }

        public boolean isComplete() {
            if (complete) return true;
            PlacementSkill[] skills = PlacementSkill.values();
            for (PlacementSkill s : skills) {
                if (getTotalCount(s) < QUESTIONS_PER_SKILL) {
                    return false;
                }
            }
            complete = true;
            return true;
        }

        public Map<String, Object> toMap() {
            Map<String, Object> map = new HashMap<>();
            map.put("sessionId", sessionId);
            map.put("currentSkillIndex", currentSkillIndex);
            map.put("complete", complete);
            map.put("grammarBand", grammarBand != null ? grammarBand.name() : "A2");
            map.put("vocabBand", vocabBand != null ? vocabBand.name() : "A2");
            map.put("readingBand", readingBand != null ? readingBand.name() : "A2");
            map.put("listeningBand", listeningBand != null ? listeningBand.name() : "A2");
            map.put("grammarCorrect", grammarCorrect);
            map.put("grammarTotal", grammarTotal);
            map.put("grammarAnsweredIds", grammarAnsweredIds);
            map.put("vocabCorrect", vocabCorrect);
            map.put("vocabTotal", vocabTotal);
            map.put("vocabAnsweredIds", vocabAnsweredIds);
            map.put("readingCorrect", readingCorrect);
            map.put("readingTotal", readingTotal);
            map.put("readingAnsweredIds", readingAnsweredIds);
            map.put("listeningCorrect", listeningCorrect);
            map.put("listeningTotal", listeningTotal);
            map.put("listeningAnsweredIds", listeningAnsweredIds);
            return map;
        }

        public static PlacementSession fromMap(Map<String, Object> map) {
            PlacementSession s = new PlacementSession();
            s.sessionId = (String) map.get("sessionId");
            s.currentSkillIndex = ((Number) map.getOrDefault("currentSkillIndex", 0)).intValue();
            s.complete = Boolean.TRUE.equals(map.get("complete"));

            String gBand = (String) map.getOrDefault("grammarBand", "A2");
            String vBand = (String) map.getOrDefault("vocabBand", "A2");
            String rBand = (String) map.getOrDefault("readingBand", "A2");
            String lBand = (String) map.getOrDefault("listeningBand", "A2");

            s.grammarBand = CefrLevel.fromString(gBand);
            s.vocabBand = CefrLevel.fromString(vBand);
            s.readingBand = CefrLevel.fromString(rBand);
            s.listeningBand = CefrLevel.fromString(lBand);

            s.grammarCorrect = ((Number) map.getOrDefault("grammarCorrect", 0)).intValue();
            s.grammarTotal = ((Number) map.getOrDefault("grammarTotal", 0)).intValue();
            s.vocabCorrect = ((Number) map.getOrDefault("vocabCorrect", 0)).intValue();
            s.vocabTotal = ((Number) map.getOrDefault("vocabTotal", 0)).intValue();
            s.readingCorrect = ((Number) map.getOrDefault("readingCorrect", 0)).intValue();
            s.readingTotal = ((Number) map.getOrDefault("readingTotal", 0)).intValue();
            s.listeningCorrect = ((Number) map.getOrDefault("listeningCorrect", 0)).intValue();
            s.listeningTotal = ((Number) map.getOrDefault("listeningTotal", 0)).intValue();

            s.grammarAnsweredIds = parseIdList(map.get("grammarAnsweredIds"));
            s.vocabAnsweredIds = parseIdList(map.get("vocabAnsweredIds"));
            s.readingAnsweredIds = parseIdList(map.get("readingAnsweredIds"));
            s.listeningAnsweredIds = parseIdList(map.get("listeningAnsweredIds"));

            return s;
        }

        @SuppressWarnings("unchecked")
        private static List<Long> parseIdList(Object raw) {
            if (raw == null) return new ArrayList<>();
            if (raw instanceof List) {
                List<?> list = (List<?>) raw;
                List<Long> result = new ArrayList<>();
                for (Object item : list) {
                    if (item instanceof Number) {
                        result.add(((Number) item).longValue());
                    }
                }
                return result;
            }
            return new ArrayList<>();
        }
    }
}
