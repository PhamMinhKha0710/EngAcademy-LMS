package com.englishlearn.infrastructure.persistence;

import com.englishlearn.domain.entity.School;
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

    @Query("SELECT COUNT(DISTINCT u) FROM User u JOIN u.roles r WHERE u.school.id = :schoolId AND r.name = 'ROLE_TEACHER'")
    Long countTeachersBySchoolId(@Param("schoolId") Long schoolId);

    @Query("SELECT COUNT(DISTINCT u) FROM User u JOIN u.roles r WHERE u.school.id = :schoolId AND r.name = 'ROLE_STUDENT'")
    Long countStudentsBySchoolId(@Param("schoolId") Long schoolId);

    @Query("SELECT COUNT(c) FROM ClassRoom c WHERE c.school.id = :schoolId AND c.isActive = true")
    Long countClassesBySchoolId(@Param("schoolId") Long schoolId);
}
