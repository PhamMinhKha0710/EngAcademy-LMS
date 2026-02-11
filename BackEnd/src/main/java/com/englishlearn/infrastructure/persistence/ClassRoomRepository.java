package com.englishlearn.infrastructure.persistence;

import com.englishlearn.domain.entity.ClassRoom;
import com.englishlearn.domain.entity.School;
import com.englishlearn.domain.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClassRoomRepository extends JpaRepository<ClassRoom, Long> {

    List<ClassRoom> findBySchool(School school);

    List<ClassRoom> findByTeacher(User teacher);

    List<ClassRoom> findByIsActiveTrue();

    Page<ClassRoom> findBySchoolId(Long schoolId, Pageable pageable);

    Page<ClassRoom> findBySchoolIdAndIsActiveTrue(Long schoolId, Pageable pageable);

    List<ClassRoom> findBySchoolIdAndIsActiveTrue(Long schoolId);

    @Query("SELECT COUNT(sc) FROM StudentClass sc WHERE sc.classRoom.id = :classId AND sc.status = 'ACTIVE'")
    Long countStudentsByClassId(@Param("classId") Long classId);

    boolean existsByNameAndSchoolId(String name, Long schoolId);
}
