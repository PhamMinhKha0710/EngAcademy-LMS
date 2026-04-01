import api from './axios'

// ===== Types matching Backend DTOs =====

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'
export type LearningGoal = 'COMMUNICATION' | 'EXAM_PREP' | 'BUSINESS'
export type LearningSkill = 'GRAMMAR' | 'VOCABULARY' | 'READING' | 'LISTENING'
export type PlacementSkill = 'GRAMMAR' | 'VOCABULARY' | 'READING' | 'LISTENING'

export interface LearningProfileResponse {
  id: number
  userId: number
  grammarLevel: CefrLevel
  vocabularyLevel: CefrLevel
  readingLevel: CefrLevel
  listeningLevel: CefrLevel
  overallLevel: CefrLevel
  primaryGoal: LearningGoal
  dailyTargetMinutes: number
  preferredTopics: string[]
  weakSkills: LearningSkill[]
  onboardingCompleted: boolean
  hasCompletedOnboarding?: boolean
}

export interface CompleteOnboardingRequest {
  primaryGoal: LearningGoal
  dailyTargetMinutes: number
  preferredTopics?: string[]
}

/** Chỉ chứa các trường client được phép gửi — không bao gồm id/userId */
export interface UpdateLearningProfilePayload {
  grammarLevel?: CefrLevel
  vocabularyLevel?: CefrLevel
  readingLevel?: CefrLevel
  listeningLevel?: CefrLevel
  primaryGoal?: LearningGoal
  dailyTargetMinutes?: number
  preferredTopics?: string[]
}

export interface PlacementQuestionResponse {
  questionId: number
  skill: PlacementSkill
  questionText: string
  options: string[]
  questionIndex: number
  totalQuestions: number
  sessionId: string
}

export interface PlacementResultResponse {
  sessionId: string
  completed: boolean
  grammarLevel: CefrLevel
  vocabularyLevel: CefrLevel
  readingLevel: CefrLevel
  listeningLevel: CefrLevel
  overallLevel: CefrLevel
  effectiveStartLevel: CefrLevel
  correctCounts: Record<PlacementSkill, number>
  totalCounts: Record<PlacementSkill, number>
}

export interface PlacementAnswerAccepted {
  nextQuestionAvailable: boolean
  result: PlacementResultResponse | null
}

export interface BatchEventRequest {
  events: EventItem[]
}

export interface EventItem {
  eventType: string
  contentType?: string
  contentId?: number
  skill?: LearningSkill
  cefrLevel?: string
  isCorrect?: boolean
  timeSpentSeconds?: number
  sessionId?: string
  metadata?: string
}

// ===== API Functions =====

export const learningApi = {
  // --- Profile ---
  getProfile: async (): Promise<LearningProfileResponse> => {
    const res = await api.get<{ data: LearningProfileResponse }>('/learning-profile/me')
    return res.data.data
  },

  completeOnboarding: async (payload: CompleteOnboardingRequest): Promise<LearningProfileResponse> => {
    const res = await api.post<{ data: LearningProfileResponse }>('/learning-profile/onboarding', payload)
    return res.data.data
  },

  updateProfile: async (payload: UpdateLearningProfilePayload): Promise<LearningProfileResponse> => {
    const res = await api.put<{ data: LearningProfileResponse }>('/learning-profile/me', payload)
    return res.data.data
  },

  getOnboardingStatus: async (): Promise<{ onboardingCompleted: boolean }> => {
    const res = await api.get<{ data: { onboardingCompleted: boolean } }>('/learning-profile/status')
    return res.data.data
  },

  // --- Placement ---
  createSession: async (): Promise<{ sessionId: string }> => {
    const res = await api.post<{ data: { sessionId: string } }>('/placement/session')
    return res.data.data
  },

  getNextQuestion: async (sessionId: string): Promise<PlacementQuestionResponse | null> => {
    const res = await api.get<{ data: PlacementQuestionResponse | null }>('/placement/question', {
      params: { sessionId },
    })
    return res.data.data ?? null
  },

  submitAnswer: async (
    sessionId: string,
    questionId: number,
    selectedAnswer: string,
    timeSpentSeconds: number,
  ): Promise<PlacementAnswerAccepted> => {
    const res = await api.post<{ data: PlacementAnswerAccepted }>(
      '/placement/answer',
      { questionId, selectedAnswer, timeSpentSeconds },
      { params: { sessionId } },
    )
    return res.data.data
  },

  getResult: async (sessionId: string): Promise<PlacementResultResponse | null> => {
    const res = await api.get<{ data: PlacementResultResponse | null }>('/placement/result', {
      params: { sessionId },
    })
    return res.data.data ?? null
  },

  // --- Events ---
  trackEvents: async (events: EventItem[]): Promise<{ saved: number }> => {
    const res = await api.post<{ data: { saved: number } }>('/events/batch', { events })
    return res.data.data
  },
}
