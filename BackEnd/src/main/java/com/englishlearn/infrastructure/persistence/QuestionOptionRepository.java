package com.englishlearn.infrastructure.persistence;

import com.englishlearn.domain.entity.Question;
import com.englishlearn.domain.entity.QuestionOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuestionOptionRepository extends JpaRepository<QuestionOption, Long> {

    List<QuestionOption> findByQuestion(Question question);

    List<QuestionOption> findByQuestionId(Long questionId);

    void deleteByQuestionId(Long questionId);
}
