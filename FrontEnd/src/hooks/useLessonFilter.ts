import { useMemo } from 'react'
import { Lesson } from '../services/api/lessonApi'
import { CefrLevel } from '../services/api/learningApi'

const DIFFICULTY_TO_CEFR: Record<number, CefrLevel> = {
  1: 'A1',
  2: 'A1',
  3: 'A2',
  4: 'A2',
  5: 'B1',
  6: 'B1',
  7: 'B2',
  8: 'B2',
  9: 'C1',
  10: 'C2',
}

const CEFR_ORDER: Record<CefrLevel, number> = {
  A1: 1, A2: 2, B1: 3, B2: 4, C1: 5, C2: 6,
}

export function useLessonFilter(
  lessons: Lesson[] | undefined,
  overallLevel: CefrLevel | null,
  weakSkills: string[],
): Lesson[] {
  return useMemo(() => {
    if (!lessons || lessons.length === 0) return []
    if (!overallLevel) return lessons

    const targetOrder = CEFR_ORDER[overallLevel]
    const windowMin = Math.max(1, targetOrder - 1)
    const windowMax = Math.min(6, targetOrder + 1)

    return lessons.filter((lesson) => {
      const lessonCefr = DIFFICULTY_TO_CEFR[lesson.difficultyLevel ?? 1]
      if (!lessonCefr) return true
      const order = CEFR_ORDER[lessonCefr]
      return order >= windowMin && order <= windowMax
    })
  }, [lessons, overallLevel, weakSkills])
}
