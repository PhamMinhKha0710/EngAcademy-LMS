package com.englishlearn.infrastructure.persistence;

import com.englishlearn.domain.entity.Exam;
import com.englishlearn.domain.entity.ExamResult;
import com.englishlearn.domain.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExamResultRepository extends JpaRepository<ExamResult, Long> {

    List<ExamResult> findByExam(Exam exam);

    List<ExamResult> findByStudent(User student);

    @Query("SELECT er FROM ExamResult er WHERE er.student.id = :userId")
    List<ExamResult> findByUserId(@Param("userId") Long userId);

    Optional<ExamResult> findByExamAndStudent(Exam exam, User student);

    boolean existsByExamAndStudent(Exam exam, User student);

    @Query("SELECT COUNT(DISTINCT er.student.id) FROM ExamResult er WHERE er.exam.id = :examId AND er.submittedAt IS NOT NULL")
    Long countSubmittedStudentsByExamId(@Param("examId") Long examId);

    @Query("SELECT AVG(er.score) FROM ExamResult er WHERE er.exam.id = :examId")
    Double averageScoreByExamId(@Param("examId") Long examId);

    @Query("SELECT AVG(er.score) FROM ExamResult er WHERE er.student.id = :userId")
    Double averageScoreByUserId(@Param("userId") Long userId);

    @Query("SELECT er FROM ExamResult er WHERE er.exam.id = :examId ORDER BY er.score DESC")
    List<ExamResult> findTopScoresByExamId(@Param("examId") Long examId);

    /**
     * Lấy phiên làm bài đang mở gần nhất (chưa nộp) của một học sinh cho một bài
     * thi.
     */
    Optional<ExamResult> findTopByExamIdAndStudentIdAndSubmittedAtIsNullOrderByIdDesc(Long examId, Long studentId);

    /**
     * Lấy kết quả đã nộp mới nhất của một học sinh cho một bài thi.
     */
    Optional<ExamResult> findTopByExamIdAndStudentIdAndSubmittedAtIsNotNullOrderBySubmittedAtDescIdDesc(Long examId,
            Long studentId);

    /**
     * Lấy tất cả kết quả của một bài thi, sắp xếp theo điểm giảm dần
     */
    List<ExamResult> findByExamIdOrderByScoreDesc(Long examId);

    /**
     * Lấy tất cả kết quả thi của một sinh viên, sắp xếp theo thời gian nộp giảm dần
     */
    List<ExamResult> findByStudentIdOrderBySubmittedAtDesc(Long studentId);

    /**
     * Kiểm tra sinh viên đã làm bài thi chưa (theo ID)
     */
    boolean existsByExamIdAndStudentId(Long examId, Long studentId);

    /**
     * Lấy kết quả thi theo trường - dùng cho ROLE_SCHOOL
     */
    @Query("SELECT er FROM ExamResult er JOIN FETCH er.exam e LEFT JOIN FETCH e.classRoom JOIN FETCH er.student WHERE er.exam.classRoom.school.id = :schoolId AND er.submittedAt IS NOT NULL")
    Page<ExamResult> findBySchoolIdWithDetails(@Param("schoolId") Long schoolId, Pageable pageable);

    @Query("SELECT AVG(er.score) FROM ExamResult er WHERE er.submittedAt IS NOT NULL")
    Double averageScoreAll();

    long countBySubmittedAtIsNotNull();
}
