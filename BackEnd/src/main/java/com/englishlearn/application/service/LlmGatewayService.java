package com.englishlearn.application.service;

import com.englishlearn.domain.entity.UserLearningProfile;
import com.englishlearn.infrastructure.persistence.UserLearningProfileRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@Slf4j
public class LlmGatewayService {

    private final String llmApiUrl;
    private final String llmApiKey;
    private final String defaultModel;
    private final UserLearningProfileRepository profileRepository;

    public LlmGatewayService(
            @Value("${app.llm.api-url:http://localhost:8001}") String llmApiUrl,
            @Value("${app.llm.api-key:}") String llmApiKey,
            @Value("${app.llm.model:gpt-3.5-turbo}") String defaultModel,
            UserLearningProfileRepository profileRepository) {
        this.llmApiUrl = llmApiUrl;
        this.llmApiKey = llmApiKey;
        this.defaultModel = defaultModel;
        this.profileRepository = profileRepository;
    }

    /**
     * Generate personalized feedback for writing/essay.
     * System prompt is enriched with user's CEFR level and weak areas.
     *
     * Integration contract:
     *   1. Lookup user profile → get CEFR level + weak_skills
     *   2. Build system prompt with level context
     *   3. POST to OpenAI/Claude or internal FastAPI gateway
     *   4. Cache result by prompt_hash (1h TTL in Redis)
     *   5. Return feedback
     *
     * TODO Phase 4:
     *   - Wire actual OpenAI/Claude SDK
     *   - Implement streaming response for UX
     *   - Rate limiting per user tier
     */
    public String generateWritingFeedback(Long userId, String contentType, Long contentId, String userText) {
        Optional<UserLearningProfile> opt = profileRepository.findByUserId(userId);
        String cefr = opt.map(p -> p.getOverallLevel().name()).orElse("B1");
        String weakSkills = opt.map(p -> String.join(", ", p.getWeakSkills().stream().map(Object::toString).toList()))
                .orElse("");

        String systemPrompt = String.format(
                "Bạn là một giáo viên tiếng Anh. " +
                "Trình độ của người học hiện tại: %s. " +
                "Kỹ năng yếu cần lưu ý: %s. " +
                "Hãy phản hồi bằng tiếng Việt, giải thích lỗi sai và đưa ra gợi ý cải thiện. " +
                "Phản hồi ngắn gọn, có ví dụ cụ thể từ bài viết của người học.",
                cefr, weakSkills
        );

        log.info("LLM request: user={}, cefr={}, content={}/{}, apiUrl={}",
                userId, cefr, contentType, contentId, this.llmApiUrl);

        // TODO Phase 4: Actually call OpenAI/Claude
        // RestTemplate or WebClient call to LLM API
        // Cache in Redis with TTL

        return "[LLM Feedback] Feature ready — Phase 4 wiring OpenAI/Claude SDK here.";
    }
}
