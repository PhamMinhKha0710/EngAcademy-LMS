package com.englishlearn.application.service;

import com.englishlearn.application.dto.request.MistakeNotebookRequest;
import com.englishlearn.application.dto.response.MistakeNotebookDTO;
import com.englishlearn.domain.entity.MistakeNotebook;
import com.englishlearn.domain.entity.User;
import com.englishlearn.domain.entity.Vocabulary;
import com.englishlearn.domain.exception.ResourceNotFoundException;
import com.englishlearn.infrastructure.persistence.MistakeNotebookRepository;
import com.englishlearn.infrastructure.persistence.UserRepository;
import com.englishlearn.infrastructure.persistence.VocabularyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * MistakeNotebookService - Quản lý sổ tay lỗi sai
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MistakeNotebookService {

    private final MistakeNotebookRepository mistakeNotebookRepository;
    private final UserRepository userRepository;
    private final VocabularyRepository vocabularyRepository;

    /**
     * Lấy danh sách lỗi sai của user
     */
    @Transactional(readOnly = true)
    public List<MistakeNotebookDTO> getMistakesByUserId(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("Người dùng", "id", userId);
        }

        List<MistakeNotebook> mistakes = mistakeNotebookRepository.findByUserIdWithVocabulary(userId);
        return mistakes.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Thêm lỗi sai vào sổ tay (hoặc tăng count nếu đã tồn tại)
     */
    @Transactional
    public MistakeNotebookDTO addMistake(MistakeNotebookRequest request) {
        if (request.getUserId() == null) {
            throw new IllegalArgumentException("Thiếu userId để ghi nhận lỗi sai");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng", "id", request.getUserId()));

        Vocabulary vocabulary = vocabularyRepository.findById(request.getVocabularyId())
                .orElseThrow(() -> new ResourceNotFoundException("Từ vựng", "id", request.getVocabularyId()));

        // Kiểm tra đã tồn tại chưa
        MistakeNotebook existing = mistakeNotebookRepository
                .findByUserIdAndVocabularyId(request.getUserId(), request.getVocabularyId())
                .orElse(null);

        MistakeNotebook mistake;
        if (existing != null) {
            // Tăng count nếu đã tồn tại
            existing.setMistakeCount(existing.getMistakeCount() + 1);
            if (request.getUserRecordingUrl() != null) {
                existing.setUserRecordingUrl(request.getUserRecordingUrl());
            }
            mistake = mistakeNotebookRepository.save(existing);
            log.info("Incremented mistake count for user {} vocabulary {}: count={}",
                    request.getUserId(), request.getVocabularyId(), mistake.getMistakeCount());
        } else {
            // Tạo mới
            mistake = MistakeNotebook.builder()
                    .user(user)
                    .vocabulary(vocabulary)
                    .mistakeCount(1)
                    .userRecordingUrl(request.getUserRecordingUrl())
                    .build();
            mistake = mistakeNotebookRepository.save(mistake);
            log.info("Added new mistake for user {} vocabulary {}", request.getUserId(), request.getVocabularyId());
        }

        return mapToDTO(mistake);
    }

    /**
     * Thêm lỗi sai (shorthand method cho auto-add từ ExamService)
     */
    @Transactional
    public void addMistake(Long userId, Long vocabularyId) {
        MistakeNotebookRequest request = MistakeNotebookRequest.builder()
                .userId(userId)
                .vocabularyId(vocabularyId)
                .build();
        addMistake(request);
    }

    /**
     * Xóa lỗi sai khỏi sổ tay
     */
    @Transactional
    public void removeMistake(Long id) {
        if (!mistakeNotebookRepository.existsById(id)) {
            throw new ResourceNotFoundException("Lỗi sai", "id", id);
        }
        mistakeNotebookRepository.deleteById(id);
        log.info("Removed mistake with ID: {}", id);
    }

    /**
     * Lấy top 10 lỗi sai nhiều nhất của user
     */
    @Transactional(readOnly = true)
    public List<MistakeNotebookDTO> getTopMistakes(Long userId) {
        return mistakeNotebookRepository.findTop10ByUserIdOrderByMistakeCountDesc(userId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Đếm số lỗi sai của user
     */
    @Transactional(readOnly = true)
    public long countMistakes(Long userId) {
        return mistakeNotebookRepository.countByUserId(userId);
    }

    /**
     * Map entity sang DTO
     */
    private MistakeNotebookDTO mapToDTO(MistakeNotebook mistake) {
        Vocabulary vocabulary = mistake.getVocabulary();
        return MistakeNotebookDTO.builder()
                .id(mistake.getId())
                .userId(mistake.getUser().getId())
                .vocabularyId(vocabulary != null ? vocabulary.getId() : null)
                .word(vocabulary != null ? vocabulary.getWord() : null)
                .meaning(vocabulary != null ? vocabulary.getMeaning() : null)
                .pronunciation(vocabulary != null ? vocabulary.getPronunciation() : null)
                .audioUrl(vocabulary != null ? vocabulary.getAudioUrl() : null)
                .mistakeCount(mistake.getMistakeCount())
                .userRecordingUrl(mistake.getUserRecordingUrl())
                .addedAt(mistake.getAddedAt())
                .lastMistakeAt(mistake.getAddedAt())
                .build();
    }
}
