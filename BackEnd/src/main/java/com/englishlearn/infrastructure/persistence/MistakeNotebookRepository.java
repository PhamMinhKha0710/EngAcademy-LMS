package com.englishlearn.infrastructure.persistence;

import com.englishlearn.domain.entity.MistakeNotebook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MistakeNotebookRepository extends JpaRepository<MistakeNotebook, Long> {

    /**
     * Tìm tất cả lỗi sai của user
     */
    List<MistakeNotebook> findByUserIdOrderByMistakeCountDesc(Long userId);

    /**
     * Tìm lỗi sai theo user và vocabulary (kiểm tra đã tồn tại chưa)
     */
    Optional<MistakeNotebook> findByUserIdAndVocabularyId(Long userId, Long vocabularyId);

    /**
     * Đếm số lỗi sai của user
     */
    long countByUserId(Long userId);

    /**
     * Tìm các lỗi sai với số lần sai nhiều nhất
     */
    List<MistakeNotebook> findTop10ByUserIdOrderByMistakeCountDesc(Long userId);

    /**
     * Tìm lỗi sai kèm thông tin vocabulary
     */
    @Query("SELECT m FROM MistakeNotebook m JOIN FETCH m.vocabulary WHERE m.user.id = :userId ORDER BY m.mistakeCount DESC")
    List<MistakeNotebook> findByUserIdWithVocabulary(@Param("userId") Long userId);
}
