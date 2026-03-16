package com.englishlearn.application.service;

import com.englishlearn.application.dto.request.VocabularyRequest;
import com.englishlearn.application.dto.response.VocabularyResponse;
import com.englishlearn.domain.entity.*;
import com.englishlearn.domain.exception.ResourceNotFoundException;
import com.englishlearn.infrastructure.persistence.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VocabularyService {

    private final VocabularyRepository vocabularyRepository;
    private final LessonRepository lessonRepository;
    private final UserVocabularyRepository userVocabularyRepository;
    private final UserTopicProgressRepository userTopicProgressRepository;
    private final UserRepository userRepository;
    private final TopicRepository topicRepository;
    private final DailyQuestService dailyQuestService;
    private final MistakeNotebookRepository mistakeNotebookRepository;

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

    // ==================== Topic-based learning ====================

    @Transactional(readOnly = true)
    public List<VocabularyResponse> getWordsToLearn(Long userId, Long topicId) {
        return vocabularyRepository.findUnmasteredByTopicAndUser(topicId, userId, PageRequest.of(0, 20))
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> reviewWord(Long userId, Long vocabularyId, boolean correct) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", userId));
        Vocabulary vocab = vocabularyRepository.findById(vocabularyId)
                .orElseThrow(() -> new ResourceNotFoundException("Từ vựng", "id", vocabularyId));

        UserVocabulary uv = userVocabularyRepository.findByUserIdAndVocabularyId(userId, vocabularyId)
                .orElseGet(() -> UserVocabulary.builder()
                        .user(user)
                        .vocabulary(vocab)
                        .reviewCount(0)
                        .build());

        uv.setStatus(correct ? VocabStatus.MASTERED : VocabStatus.LEARNING);
        uv.setReviewCount(uv.getReviewCount() + 1);
        uv.setLastReviewedAt(LocalDateTime.now());
        userVocabularyRepository.save(uv);

        boolean topicCompleted = false;
        Topic topic = vocab.getLesson() != null ? vocab.getLesson().getTopic() : null;
        if (topic != null) {
            topicCompleted = checkAndMarkTopicCompletion(userId, topic.getId(), user);
        }

        boolean questTaskCompleted = false;
        if (correct) {
            try {
                questTaskCompleted = dailyQuestService.incrementProgressForTaskType(userId, "LEARN_VOCAB", 1);
            } catch (Exception e) {
                log.debug("Could not update quest for LEARN_VOCAB: {}", e.getMessage());
            }
            if (mistakeNotebookRepository.findByUserIdAndVocabularyId(userId, vocabularyId).isPresent()) {
                try {
                    boolean reviewCompleted = dailyQuestService.incrementProgressForTaskType(userId, "REVIEW_MISTAKES", 1);
                    if (reviewCompleted) questTaskCompleted = true;
                } catch (Exception e) {
                    log.debug("Could not update quest for REVIEW_MISTAKES: {}", e.getMessage());
                }
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("status", uv.getStatus().name());
        result.put("topicCompleted", topicCompleted);
        result.put("questTaskCompleted", questTaskCompleted);
        return result;
    }

    private boolean checkAndMarkTopicCompletion(Long userId, Long topicId, User user) {
        Long totalWords = vocabularyRepository.countByTopicId(topicId);
        Long masteredWords = userVocabularyRepository.countByUserIdAndTopicIdAndStatus(userId, topicId, VocabStatus.MASTERED);

        if (totalWords > 0 && masteredWords.equals(totalWords)) {
            if (!userTopicProgressRepository.existsByUserIdAndTopicId(userId, topicId)) {
                Topic topic = topicRepository.findById(topicId)
                        .orElseThrow(() -> new ResourceNotFoundException("Chủ đề", "id", topicId));
                UserTopicProgress progress = UserTopicProgress.builder()
                        .user(user)
                        .topic(topic)
                        .completedAt(LocalDateTime.now())
                        .build();
                userTopicProgressRepository.save(progress);
                log.info("User {} completed topic: {}", user.getFullName(), topic.getName());
            }
            return true;
        }
        return false;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTopicsWithProgress(Long userId) {
        List<Topic> topics = topicRepository.findAll();
        List<Map<String, Object>> result = new ArrayList<>();

        for (Topic topic : topics) {
            Long totalWords = vocabularyRepository.countByTopicId(topic.getId());
            if (totalWords == 0) continue;

            Long masteredWords = userVocabularyRepository.countByUserIdAndTopicIdAndStatus(
                    userId, topic.getId(), VocabStatus.MASTERED);
            boolean completed = userTopicProgressRepository.existsByUserIdAndTopicId(userId, topic.getId());

            Map<String, Object> topicData = new LinkedHashMap<>();
            topicData.put("id", topic.getId());
            topicData.put("name", topic.getName());
            topicData.put("description", topic.getDescription());
            topicData.put("totalWords", totalWords);
            topicData.put("masteredWords", masteredWords);
            topicData.put("progress", totalWords > 0 ? (int) (masteredWords * 100 / totalWords) : 0);
            topicData.put("completed", completed);
            result.add(topicData);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public Long getLearnedCount(Long userId) {
        return userVocabularyRepository.countByUserIdAndStatus(userId, VocabStatus.MASTERED);
    }

    @Transactional(readOnly = true)
    public List<VocabularyResponse> getLearnedWords(Long userId) {
        return userVocabularyRepository.findMasteredByUserId(userId).stream()
                .map(uv -> mapToResponse(uv.getVocabulary()))
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
