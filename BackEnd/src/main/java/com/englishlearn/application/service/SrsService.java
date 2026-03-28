package com.englishlearn.application.service;

import com.englishlearn.application.dto.request.SrsReviewRequest;
import com.englishlearn.application.dto.response.SrsDueResponse;
import com.englishlearn.domain.entity.FlashcardReview;
import com.englishlearn.domain.entity.User;
import com.englishlearn.domain.entity.Vocabulary;
import com.englishlearn.domain.exception.ResourceNotFoundException;
import com.englishlearn.infrastructure.persistence.FlashcardReviewRepository;
import com.englishlearn.infrastructure.persistence.UserRepository;
import com.englishlearn.infrastructure.persistence.VocabularyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SrsService {

    private final FlashcardReviewRepository reviewRepository;
    private final VocabularyRepository vocabularyRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public SrsDueResponse getDueToday(Long userId) {
        LocalDate today = LocalDate.now();

        List<FlashcardReview> due = reviewRepository.findDueToday(userId, today);
        long totalDue = reviewRepository.countDueToday(userId, today);

        List<SrsDueResponse> items = due.stream()
                .map(r -> toResponse(r, today))
                .toList();

        SrsDueResponse first = items.isEmpty() ? null : items.get(0);

        return SrsDueResponse.builder()
                .totalDue((int) totalDue)
                .totalReviewedToday(0)
                .items(items)
                .vocabularyId(first != null ? first.getVocabularyId() : null)
                .word(first != null ? first.getWord() : null)
                .meaning(first != null ? first.getMeaning() : null)
                .easinessFactor(first != null ? first.getEasinessFactor() : 2.5)
                .intervalDays(first != null ? first.getIntervalDays() : 0)
                .repetitions(first != null ? first.getRepetitions() : 0)
                .nextReviewAt(first != null ? first.getNextReviewAt() : today)
                .build();
    }

    @Transactional
    public SrsDueResponse submitReview(Long userId, SrsReviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Vocabulary vocab = vocabularyRepository.findById(request.getVocabularyId())
                .orElseThrow(() -> new ResourceNotFoundException("Vocabulary not found: " + request.getVocabularyId()));

        FlashcardReview review = reviewRepository.findByUserIdAndVocabularyId(userId, request.getVocabularyId())
                .orElseGet(() -> FlashcardReview.builder()
                        .user(user)
                        .vocabulary(vocab)
                        .easinessFactor(2.5)
                        .intervalDays(1)
                        .repetitions(0)
                        .nextReviewAt(LocalDate.now())
                        .build());

        try {
            review.applySM2(request.getQuality());
            FlashcardReview saved = reviewRepository.save(review);
            log.info("SRS review: user={}, vocab={}, quality={}, next_review={}, ef={}, interval={}",
                    userId, request.getVocabularyId(), request.getQuality(),
                    saved.getNextReviewAt(), saved.getEasinessFactor(), saved.getIntervalDays());
        } catch (ObjectOptimisticLockingFailureException e) {
            // Concurrent update — retry once by re-fetching
            log.warn("Optimistic lock conflict on SRS review for user={}, vocab={}. Retrying...",
                    userId, request.getVocabularyId());
            FlashcardReview retry = reviewRepository.findByUserIdAndVocabularyId(userId, request.getVocabularyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vocabulary not in review queue"));
            retry.applySM2(request.getQuality());
            reviewRepository.save(retry);
        }

        return getDueToday(userId);
    }

    @Transactional
    public FlashcardReview addToReviewQueue(Long userId, Long vocabularyId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Vocabulary vocab = vocabularyRepository.findById(vocabularyId)
                .orElseThrow(() -> new ResourceNotFoundException("Vocabulary not found: " + vocabularyId));

        Optional<FlashcardReview> existing = reviewRepository.findByUserIdAndVocabularyId(userId, vocabularyId);
        if (existing.isPresent()) {
            return existing.get();
        }

        FlashcardReview review = FlashcardReview.builder()
                .user(user)
                .vocabulary(vocab)
                .easinessFactor(2.5)
                .intervalDays(1)
                .repetitions(0)
                .nextReviewAt(LocalDate.now())
                .build();

        try {
            return reviewRepository.save(review);
        } catch (DataIntegrityViolationException e) {
            // Concurrent insert — another thread won the race. Return the winner's record.
            return reviewRepository.findByUserIdAndVocabularyId(userId, vocabularyId)
                    .orElseThrow(() -> new IllegalStateException(
                            "Unexpected state after concurrent insert for userId=" + userId + ", vocabularyId=" + vocabularyId, e));
        }
    }

    private SrsDueResponse toResponse(FlashcardReview r, LocalDate today) {
        int overdueDays = (int) ChronoUnit.DAYS.between(r.getNextReviewAt(), today);

        String word = null, meaning = null, pronunciation = null, example = null, audioUrl = null;

        if (r.getVocabulary() != null) {
            Vocabulary v = r.getVocabulary();
            word = v.getWord();
            meaning = v.getMeaning();
            pronunciation = v.getPronunciation();
            example = v.getExampleSentence();
            audioUrl = v.getAudioUrl();
        }

        return SrsDueResponse.builder()
                .vocabularyId(r.getVocabulary() != null ? r.getVocabulary().getId() : null)
                .grammarId(r.getGrammar() != null ? r.getGrammar().getId() : null)
                .contentType(r.getVocabulary() != null ? "VOCABULARY" : "GRAMMAR")
                .word(word)
                .pronunciation(pronunciation)
                .meaning(meaning)
                .exampleSentence(example)
                .audioUrl(audioUrl)
                .easinessFactor(r.getEasinessFactor())
                .intervalDays(r.getIntervalDays())
                .repetitions(r.getRepetitions())
                .nextReviewAt(r.getNextReviewAt())
                .lastReviewedAt(r.getLastReviewedAt())
                .overdueDays(Math.max(0, overdueDays))
                .build();
    }
}
