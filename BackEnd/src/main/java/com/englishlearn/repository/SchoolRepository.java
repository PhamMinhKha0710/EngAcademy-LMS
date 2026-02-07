package com.englishlearn.repository;

import com.englishlearn.entity.School;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SchoolRepository extends JpaRepository<School, Long> {

    List<School> findByIsActiveTrue();

    List<School> findByNameContainingIgnoreCase(String name);

    Page<School> findByIsActiveTrue(Pageable pageable);

    Optional<School> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("SELECT COUNT(u) FROM User u WHERE u.school.id = :schoolId AND 'ROLE_TEACHER' MEMBER OF u.roles")
    Long countTeachersBySchoolId(@Param("schoolId") Long schoolId);

    @Query("SELECT COUNT(u) FROM User u WHERE u.school.id = :schoolId AND 'ROLE_STUDENT' MEMBER OF u.roles")
    Long countStudentsBySchoolId(@Param("schoolId") Long schoolId);

    @Query("SELECT COUNT(c) FROM ClassRoom c WHERE c.school.id = :schoolId AND c.isActive = true")
    Long countClassesBySchoolId(@Param("schoolId") Long schoolId);
}
