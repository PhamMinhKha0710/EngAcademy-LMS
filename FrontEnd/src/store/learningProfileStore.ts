import { create } from 'zustand'
import {
  learningApi,
  LearningProfileResponse,
  PlacementResultResponse,
  CompleteOnboardingRequest,
} from '../services/api/learningApi'

interface LearningProfileState {
  profile: LearningProfileResponse | null
  onboardingCompleted: boolean
  placementResult: PlacementResultResponse | null
  placementSessionId: string | null
  isLoading: boolean
  error: string | null

  // Actions
  fetchProfile: () => Promise<void>
  fetchOnboardingStatus: () => Promise<void>
  completeOnboarding: (payload: CompleteOnboardingRequest) => Promise<LearningProfileResponse>
  setPlacementResult: (result: PlacementResultResponse | null) => void
  setPlacementSessionId: (id: string | null) => void
  clearError: () => void
}

export const useLearningProfileStore = create<LearningProfileState>((set, get) => ({
  profile: null,
  onboardingCompleted: false,
  placementResult: null,
  placementSessionId: null,
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null })
    try {
      const profile = await learningApi.getProfile()
      set({
        profile,
        onboardingCompleted: profile.onboardingCompleted ?? false,
        isLoading: false,
      })
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to load learning profile'
      set({ error: msg, isLoading: false })
    }
  },

  // Distinguish 401 (reset state) from 5xx (keep state)
  fetchOnboardingStatus: async () => {
    try {
      const status = await learningApi.getOnboardingStatus()
      set({ onboardingCompleted: status.onboardingCompleted })
    } catch (err: any) {
      if (err?.response?.status === 401) {
        set({ onboardingCompleted: false })
      }
      // 5xx / network: keep current state
    }
  },

  completeOnboarding: async (payload: CompleteOnboardingRequest) => {
    set({ isLoading: true, error: null })
    try {
      const profile = await learningApi.completeOnboarding(payload)
      const prev = get().profile
      // Guard merge: only use prev if it's the same user
      set({
        profile: (prev && prev.id === profile.id) ? { ...prev, ...profile } : profile,
        onboardingCompleted: true,
        isLoading: false,
      })
      return profile
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to complete onboarding'
      set({ error: msg, isLoading: false })
      throw err
    }
  },

  setPlacementResult: (result) => set({ placementResult: result }),
  setPlacementSessionId: (id) => set({ placementSessionId: id }),
  clearError: () => set({ error: null }),
}))
