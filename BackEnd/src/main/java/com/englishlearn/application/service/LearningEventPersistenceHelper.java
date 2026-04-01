package com.englishlearn.application.service;

import com.englishlearn.application.dto.request.BatchEventRequest;
import com.englishlearn.domain.entity.LearningEvent;
import com.englishlearn.infrastructure.persistence.LearningEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Helper component to avoid Spring proxy self-invocation issues.
 * When LearningEventService calls persistEventAsync internally, routing through
 * this separate bean ensures the @Async and @Transactional annotations are respected.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class LearningEventPersistenceHelper {

    private final LearningEventRepository eventRepository;

    @Async("taskExecutor")
    @Transactional
    public void persistEventAsync(Long userId, String eventType, BatchEventRequest.EventItem extra) {
        try {
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

            eventRepository.save(event);
            log.debug("Async event tracked: user={}, type={}", userId, eventType);
        } catch (Exception e) {
            log.error("Failed to persist async event for user {}: {}", userId, e.getMessage(), e);
        }
    }
}
