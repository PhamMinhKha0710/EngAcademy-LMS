package com.englishlearn.application.service;

import com.englishlearn.application.dto.request.BatchEventRequest;
import com.englishlearn.domain.entity.LearningEvent;
import com.englishlearn.infrastructure.persistence.LearningEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class LearningEventService {

    private final LearningEventRepository eventRepository;
    private final LearningEventPersistenceHelper persistenceHelper;

    /**
     * Async event tracking — runs in a separate thread via the taskExecutor pool.
     * Uses its own transaction to ensure the event is persisted independently of the caller's transaction.
     * Errors are caught and logged, but do not propagate to the caller.
     */
    /**
     * Delegates to the helper to avoid Spring proxy self-invocation issues.
     */
    public void trackEventAsync(Long userId, String eventType, BatchEventRequest.EventItem extra) {
        persistenceHelper.persistEventAsync(userId, eventType, extra);
    }

    @Transactional
    public LearningEvent trackEvent(Long userId, String eventType, BatchEventRequest.EventItem extra) {
        LearningEvent event = LearningEvent.builder()
                .userId(userId)
                .eventType(eventType)
                .contentType(extra != null ? extra.getContentType() : null)
                .contentId(extra != null ? extra.getContentId() : null)
                .skill(extra != null ? extra.getSkill() : null)
                .cefrLevel(extra != null ? extra.getCefrLevel() : null)
                .isCorrect(extra != null ? extra.getIsCorrect() : null)
                .timeSpentSeconds(extra != null ? extra.getTimeSpentSeconds() : null)
                .sessionId(extra != null ? extra.getSessionId() : null)
                .metadata(extra != null ? extra.getMetadata() : null)
                .build();

        LearningEvent saved = eventRepository.save(event);
        log.debug("Event tracked: user={}, type={}, content={}/{}",
                userId, eventType,
                saved.getContentType(), saved.getContentId());
        return saved;
    }

    /**
     * Batch event persistence.
     * Returns a structured result so the caller knows which events failed.
     */
    public BatchSaveResult saveBatch(Long userId, List<BatchEventRequest.EventItem> events) {
        if (events == null || events.isEmpty()) {
            return new BatchSaveResult(0, 0, List.of());
        }

        int saved = 0;
        List<String> failed = new ArrayList<>();
        for (BatchEventRequest.EventItem item : events) {
            try {
                trackEvent(userId, item.getEventType(), item);
                saved++;
            } catch (Exception e) {
                failed.add(item.getEventType());
                log.warn("Failed to save event {} for user {}: {}",
                        item.getEventType(), userId, e.getMessage());
            }
        }
        log.info("Batch saved {} / {} events for user {} (failed: {})",
                saved, events.size(), userId, failed);
        return new BatchSaveResult(saved, failed.size(), failed);
    }

    /**
     * Structured result for batch save operations.
     */
    public record BatchSaveResult(
            int savedCount,
            int failedCount,
            List<String> failedEventTypes
    ) {}
}
