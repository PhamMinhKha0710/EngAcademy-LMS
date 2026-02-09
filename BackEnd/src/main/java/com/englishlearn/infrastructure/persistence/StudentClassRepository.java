package com.englishlearn.infrastructure.persistence;

import com.englishlearn.domain.entity.ClassRoom;
import com.englishlearn.domain.entity.StudentClass;
import com.englishlearn.domain.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentClassRepository extends JpaRepository<StudentClass, Long> {

    List<StudentClass> findByClassRoom(ClassRoom classRoom);

    List<StudentClass> findByStudent(User student);

    Optional<StudentClass> findByStudentAndClassRoom(User student, ClassRoom classRoom);

    boolean existsByStudentAndClassRoom(User student, ClassRoom classRoom);

    @Query("SELECT sc FROM StudentClass sc WHERE sc.classRoom.id = :classId AND sc.status = 'ACTIVE'")
    List<StudentClass> findActiveStudentsByClassId(@Param("classId") Long classId);

    @Query("SELECT COUNT(sc) FROM StudentClass sc WHERE sc.classRoom.id = :classId AND sc.status = 'ACTIVE'")
    Long countActiveStudentsByClassId(@Param("classId") Long classId);

    @Query("SELECT COUNT(sc) FROM StudentClass sc WHERE sc.classRoom.school.id = :schoolId AND sc.status = 'ACTIVE'")
    Long countActiveStudentsBySchoolId(@Param("schoolId") Long schoolId);
}
