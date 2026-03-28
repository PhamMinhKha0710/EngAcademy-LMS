package com.englishlearn.infrastructure.persistence;

import com.englishlearn.domain.entity.PlacementQuestion;
import com.englishlearn.domain.enums.CefrLevel;
import com.englishlearn.domain.enums.PlacementSkill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PlacementQuestionRepository extends JpaRepository<PlacementQuestion, Long> {

    @Query("""
        SELECT q FROM PlacementQuestion q
        WHERE q.skill = :skill
          AND q.cefrBand = :cefrBand
          AND q.isActive = true
        ORDER BY q.difficultyWeight ASC
        """)
    List<PlacementQuestion> findBySkillAndCefrBand(
            @Param("skill") PlacementSkill skill,
            @Param("cefrBand") CefrLevel cefrBand);

    @Query("""
        SELECT q FROM PlacementQuestion q
        WHERE q.skill = :skill
          AND q.isActive = true
        ORDER BY q.cefrBand ASC, q.difficultyWeight ASC
        """)
    List<PlacementQuestion> findBySkillOrderByBand(
            @Param("skill") PlacementSkill skill);

    @Query("""
        SELECT q FROM PlacementQuestion q
        WHERE q.skill = :skill
          AND q.cefrBand IN :bands
          AND q.isActive = true
        ORDER BY q.cefrBand ASC, q.difficultyWeight ASC
        """)
    List<PlacementQuestion> findBySkillAndCefrBands(
            @Param("skill") PlacementSkill skill,
            @Param("bands") List<CefrLevel> bands);
}
