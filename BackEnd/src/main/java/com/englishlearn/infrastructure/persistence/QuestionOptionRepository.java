package com.englishlearn.infrastructure.persistence;

import com.englishlearn.domain.entity.Question;
import com.englishlearn.domain.entity.QuestionOption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface QuestionOptionRepository extends JpaRepository<QuestionOption, Long> {

    List<QuestionOption> findByQuestion(Question question);

    List<QuestionOption> findByQuestionId(Long questionId);

    @Query("SELECT o FROM QuestionOption o WHERE o.question.id IN :questionIds ORDER BY o.question.id, o.id")
    List<QuestionOption> findByQuestionIdIn(@Param("questionIds") Collection<Long> questionIds);

    void deleteByQuestionId(Long questionId);
}
