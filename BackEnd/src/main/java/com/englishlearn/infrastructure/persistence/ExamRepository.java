package com.englishlearn.infrastructure.persistence;

import com.englishlearn.domain.entity.Exam;
import com.englishlearn.domain.entity.User;
import com.englishlearn.domain.entity.ClassRoom;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {

    List<Exam> findByTeacher(User teacher);

    List<Exam> findByClassRoom(ClassRoom classRoom);

    List<Exam> findByStatus(String status);

    Page<Exam> findByTeacherId(Long teacherId, Pageable pageable);

    Page<Exam> findByClassRoomId(Long classRoomId, Pageable pageable);

    @Query("SELECT e FROM Exam e LEFT JOIN FETCH e.classRoom LEFT JOIN FETCH e.teacher WHERE e.id = :id")
    Optional<Exam> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT e FROM Exam e LEFT JOIN FETCH e.classRoom cr LEFT JOIN FETCH cr.school LEFT JOIN FETCH e.teacher WHERE e.id = :id")
    Optional<Exam> findByIdWithFullDetails(@Param("id") Long id);

    /**
     * Eagerly loads questions — prevents LazyInitializationException when accessing exam.getQuestions()
     * in read-only transactions. Used by mapToResponse().
     */
    @Query("SELECT DISTINCT e FROM Exam e LEFT JOIN FETCH e.questions LEFT JOIN FETCH e.classRoom LEFT JOIN FETCH e.teacher WHERE e.id = :id")
    Optional<Exam> findByIdWithQuestions(@Param("id") Long id);

    @Query("SELECT e FROM Exam e WHERE e.classRoom.id = :classId AND e.status = 'PUBLISHED' AND e.startTime <= :now AND e.endTime >= :now")
    List<Exam> findActiveExamsByClassId(@Param("classId") Long classId, @Param("now") LocalDateTime now);

    @Query("SELECT e FROM Exam e WHERE e.teacher.id = :teacherId AND e.status = :status")
    List<Exam> findByTeacherIdAndStatus(@Param("teacherId") Long teacherId, @Param("status") String status);

    @Query("SELECT COUNT(e) FROM Exam e WHERE e.classRoom.id = :classId")
    Long countByClassId(@Param("classId") Long classId);

    @Query("SELECT e FROM Exam e WHERE e.classRoom.school.id = :schoolId")
    Page<Exam> findBySchoolId(@Param("schoolId") Long schoolId, Pageable pageable);

    long countByStatus(String status);

    @Query("SELECT COUNT(e) FROM Exam e WHERE e.classRoom.school.id = :schoolId")
    long countBySchoolId(@Param("schoolId") Long schoolId);
}
