package com.englishlearn.repository;

import com.englishlearn.entity.Question;
import com.englishlearn.entity.QuestionOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionOptionRepository extends JpaRepository<QuestionOption, Long> {

    List<QuestionOption> findByQuestion(Question question);

    List<QuestionOption> findByQuestionId(Long questionId);

    void deleteByQuestionId(Long questionId);
}
