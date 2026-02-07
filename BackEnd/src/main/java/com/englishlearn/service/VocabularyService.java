package com.englishlearn.service;

import com.englishlearn.dto.response.VocabularyResponse;
import com.englishlearn.entity.Vocabulary;
import com.englishlearn.exception.ResourceNotFoundException;
import com.englishlearn.repository.VocabularyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VocabularyService {

    private final VocabularyRepository vocabularyRepository;

    @Transactional(readOnly = true)
    public List<VocabularyResponse> getVocabularyByLesson(Long lessonId) {
        return vocabularyRepository.findByLessonId(lessonId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<VocabularyResponse> getVocabularyByLessonPaged(Long lessonId, Pageable pageable) {
        return vocabularyRepository.findByLessonId(lessonId, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<VocabularyResponse> getVocabularyByTopic(Long topicId) {
        return vocabularyRepository.findByTopicId(topicId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VocabularyResponse getVocabularyById(Long id) {
        Vocabulary vocab = vocabularyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Từ vựng", "id", id));
        return mapToResponse(vocab);
    }

    @Transactional(readOnly = true)
    public List<VocabularyResponse> searchVocabulary(String keyword) {
        return vocabularyRepository.searchByWord(keyword).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VocabularyResponse> getFlashcards(Long lessonId, int count) {
        List<Vocabulary> vocabs = vocabularyRepository.findByLessonId(lessonId);
        Collections.shuffle(vocabs);
        return vocabs.stream()
                .limit(count)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<VocabularyResponse> getRandomFlashcards(int count) {
        return vocabularyRepository.findRandom(PageRequest.of(0, count)).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private VocabularyResponse mapToResponse(Vocabulary vocab) {
        return VocabularyResponse.builder()
                .id(vocab.getId())
                .word(vocab.getWord())
                .pronunciation(vocab.getPronunciation())
                .meaning(vocab.getMeaning())
                .exampleSentence(vocab.getExampleSentence())
                .imageUrl(vocab.getImageUrl())
                .audioUrl(vocab.getAudioUrl())
                .lessonId(vocab.getLesson().getId())
                .lessonTitle(vocab.getLesson().getTitle())
                .build();
    }
}
