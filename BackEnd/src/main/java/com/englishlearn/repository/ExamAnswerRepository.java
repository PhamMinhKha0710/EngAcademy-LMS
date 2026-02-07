package com.englishlearn.repository;

import com.englishlearn.entity.ExamAnswer;
import com.englishlearn.entity.ExamResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamAnswerRepository extends JpaRepository<ExamAnswer, Long> {

    List<ExamAnswer> findByExamResult(ExamResult examResult);

    List<ExamAnswer> findByExamResultId(Long examResultId);
}
