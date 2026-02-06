package com.englishlearn.repository;

import com.englishlearn.entity.School;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SchoolRepository extends JpaRepository<School, Long> {
    List<School> findByIsActiveTrue();

    List<School> findByNameContainingIgnoreCase(String name);
}
