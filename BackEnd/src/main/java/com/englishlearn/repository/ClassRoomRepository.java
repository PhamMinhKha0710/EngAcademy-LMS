package com.englishlearn.repository;

import com.englishlearn.entity.ClassRoom;
import com.englishlearn.entity.School;
import com.englishlearn.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ClassRoomRepository extends JpaRepository<ClassRoom, Long> {
    List<ClassRoom> findBySchool(School school);

    List<ClassRoom> findByTeacher(User teacher);

    List<ClassRoom> findByIsActiveTrue();
}
