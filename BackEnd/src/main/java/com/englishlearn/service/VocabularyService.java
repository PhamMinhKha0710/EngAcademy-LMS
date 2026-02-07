package com.englishlearn.service;

import com.englishlearn.dto.request.VocabularyRequest;
import com.englishlearn.dto.response.VocabularyResponse;
import com.englishlearn.entity.Lesson;
import com.englishlearn.entity.Vocabulary;
import com.englishlearn.exception.ResourceNotFoundException;
import com.englishlearn.repository.LessonRepository;
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
    private final LessonRepository lessonRepository;

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

    @Transactional
    public VocabularyResponse createVocabulary(VocabularyRequest request) {
        Lesson lesson = lessonRepository.findById(request.getLessonId())
                .orElseThrow(() -> new ResourceNotFoundException("Bài học", "id", request.getLessonId()));

        Vocabulary vocab = Vocabulary.builder()
                .lesson(lesson)
                .word(request.getWord())
                .pronunciation(request.getPronunciation())
                .meaning(request.getMeaning())
                .exampleSentence(request.getExampleSentence())
                .imageUrl(request.getImageUrl())
                .audioUrl(request.getAudioUrl())
                .build();

        Vocabulary saved = vocabularyRepository.save(vocab);
        return mapToResponse(saved);
    }

    @Transactional
    public VocabularyResponse updateVocabulary(Long id, VocabularyRequest request) {
        Vocabulary vocab = vocabularyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Từ vựng", "id", id));

        if (request.getLessonId() != null && !request.getLessonId().equals(vocab.getLesson().getId())) {
            Lesson lesson = lessonRepository.findById(request.getLessonId())
                    .orElseThrow(() -> new ResourceNotFoundException("Bài học", "id", request.getLessonId()));
            vocab.setLesson(lesson);
        }

        if (request.getWord() != null) vocab.setWord(request.getWord());
        if (request.getPronunciation() != null) vocab.setPronunciation(request.getPronunciation());
        if (request.getMeaning() != null) vocab.setMeaning(request.getMeaning());
        if (request.getExampleSentence() != null) vocab.setExampleSentence(request.getExampleSentence());
        if (request.getImageUrl() != null) vocab.setImageUrl(request.getImageUrl());
        if (request.getAudioUrl() != null) vocab.setAudioUrl(request.getAudioUrl());

        Vocabulary updated = vocabularyRepository.save(vocab);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteVocabulary(Long id) {
        Vocabulary vocab = vocabularyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Từ vựng", "id", id));
        vocabularyRepository.delete(vocab);
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
