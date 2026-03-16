import api from './axios'
interface ApiResponse<T> { success: boolean; message: string; data: T }

export interface VocabularyResponse {
    id: number; word: string; meaning: string; pronunciation?: string;
    exampleSentence?: string; imageUrl?: string; audioUrl?: string;
    lessonId?: number; lessonTitle?: string;
}
export interface VocabularyRequest {
    word: string; meaning: string; pronunciation?: string; exampleSentence?: string;
    imageUrl?: string; audioUrl?: string; lessonId?: number;
}
export interface TopicProgress {
    id: number; name: string; description?: string;
    totalWords: number; masteredWords: number; progress: number; completed: boolean;
}
export interface ReviewResult {
    status: string; topicCompleted: boolean; questTaskCompleted?: boolean;
}

export const vocabularyApi = {
    getByLesson: async (lessonId: number) => {
        const r = await api.get<ApiResponse<VocabularyResponse[]>>(`/vocabulary/lesson/${lessonId}`)
        return r.data.data
    },
    getById: async (id: number) => {
        const r = await api.get<ApiResponse<VocabularyResponse>>(`/vocabulary/${id}`)
        return r.data.data
    },
    search: async (keyword: string) => {
        const r = await api.get<ApiResponse<VocabularyResponse[]>>(`/vocabulary/search?keyword=${encodeURIComponent(keyword)}`)
        return r.data.data
    },
    getFlashcards: async (lessonId: number, count = 10) => {
        const r = await api.get<ApiResponse<VocabularyResponse[]>>(`/vocabulary/flashcards/${lessonId}?count=${count}`)
        return r.data.data
    },
    getRandomFlashcards: async (count = 20) => {
        const r = await api.get<ApiResponse<VocabularyResponse[]>>(`/vocabulary/flashcards/random?count=${count}`)
        return r.data.data
    },
    create: async (data: VocabularyRequest) => {
        const r = await api.post<ApiResponse<VocabularyResponse>>('/vocabulary', data)
        return r.data.data
    },
    update: async (id: number, data: VocabularyRequest) => {
        const r = await api.put<ApiResponse<VocabularyResponse>>(`/vocabulary/${id}`, data)
        return r.data.data
    },
    delete: async (id: number) => { await api.delete(`/vocabulary/${id}`) },

    // Topic-based learning
    getTopics: async (userId: number) => {
        const r = await api.get<ApiResponse<TopicProgress[]>>(`/topics?userId=${userId}`)
        return r.data.data
    },
    getWordsToLearn: async (topicId: number, userId: number) => {
        const r = await api.get<ApiResponse<VocabularyResponse[]>>(`/topics/${topicId}/learn?userId=${userId}`)
        return r.data.data
    },
    reviewWord: async (vocabularyId: number, userId: number, result: 'correct' | 'wrong') => {
        const r = await api.post<ApiResponse<ReviewResult>>('/vocabulary/review', { vocabularyId, userId, result })
        return r.data.data
    },
    getLearnedWords: async (userId: number) => {
        const r = await api.get<ApiResponse<VocabularyResponse[]>>(`/vocabulary/learned?userId=${userId}`)
        return r.data.data
    },
    getLearnedCount: async (userId: number) => {
        const r = await api.get<ApiResponse<number>>(`/vocabulary/learned/count?userId=${userId}`)
        return r.data.data
    },
}
