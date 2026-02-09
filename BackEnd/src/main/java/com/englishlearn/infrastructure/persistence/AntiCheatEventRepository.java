package com.englishlearn.infrastructure.persistence;

import com.englishlearn.domain.entity.AntiCheatEvent;
import com.englishlearn.domain.entity.ExamResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AntiCheatEventRepository extends JpaRepository<AntiCheatEvent, Long> {

    /**
     * Tìm tất cả sự kiện anti-cheat theo exam result
     */
    List<AntiCheatEvent> findByExamResultOrderByEventTimeAsc(ExamResult examResult);

    /**
     * Tìm tất cả sự kiện anti-cheat theo exam result ID
     */
    List<AntiCheatEvent> findByExamResultIdOrderByEventTimeAsc(Long examResultId);

    /**
     * Đếm số vi phạm theo exam result
     */
    long countByExamResultId(Long examResultId);

    /**
     * Đếm số vi phạm theo loại sự kiện
     */
    long countByExamResultIdAndEventType(Long examResultId, String eventType);
}
