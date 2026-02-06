package com.englishlearn.repository;

import com.englishlearn.entity.Exam;
import com.englishlearn.entity.User;
import com.englishlearn.entity.ClassRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByTeacher(User teacher);

    List<Exam> findByClassRoom(ClassRoom classRoom);

    List<Exam> findByStatus(String status);
}
