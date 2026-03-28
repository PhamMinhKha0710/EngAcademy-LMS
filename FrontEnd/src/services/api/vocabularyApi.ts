import api, { AxiosRequestConfig } from './axios'
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
    getByLesson: async (lessonId: number, config?: AxiosRequestConfig) => {
        const r = await api.get<ApiResponse<VocabularyResponse[]>>(`/vocabulary/lesson/${lessonId}`, config)
        return r.data.data
    },
    getById: async (id: number, config?: AxiosRequestConfig) => {
        const r = await api.get<ApiResponse<VocabularyResponse>>(`/vocabulary/${id}`, config)
        return r.data.data
    },
    search: async (keyword: string, config?: AxiosRequestConfig) => {
        const r = await api.get<ApiResponse<VocabularyResponse[]>>(`/vocabulary/search?keyword=${encodeURIComponent(keyword)}`, config)
        return r.data.data
    },
    getFlashcards: async (lessonId: number, count = 10, config?: AxiosRequestConfig) => {
        const r = await api.get<ApiResponse<VocabularyResponse[]>>(`/vocabulary/flashcards/${lessonId}?count=${count}`, config)
        return r.data.data
    },
    getRandomFlashcards: async (count = 20, config?: AxiosRequestConfig) => {
        const r = await api.get<ApiResponse<VocabularyResponse[]>>(`/vocabulary/flashcards/random?count=${count}`, config)
        return r.data.data
    },
    create: async (data: VocabularyRequest, config?: AxiosRequestConfig) => {
        const r = await api.post<ApiResponse<VocabularyResponse>>('/vocabulary', data, config)
        return r.data.data
    },
    update: async (id: number, data: VocabularyRequest, config?: AxiosRequestConfig) => {
        const r = await api.put<ApiResponse<VocabularyResponse>>(`/vocabulary/${id}`, data, config)
        return r.data.data
    },
    delete: async (id: number, config?: AxiosRequestConfig) => {
        await api.delete(`/vocabulary/${id}`, config)
    },

    // Topic-based learning
    getTopics: async (userId: number, config?: AxiosRequestConfig) => {
        const r = await api.get<ApiResponse<TopicProgress[]>>(`/topics?userId=${userId}`, config)
        return r.data.data
    },
    getWordsToLearn: async (topicId: number, userId: number, config?: AxiosRequestConfig) => {
        const r = await api.get<ApiResponse<VocabularyResponse[]>>(`/topics/${topicId}/learn?userId=${userId}`, config)
        return r.data.data
    },
    reviewWord: async (vocabularyId: number, userId: number, result: 'correct' | 'wrong', config?: AxiosRequestConfig) => {
        const r = await api.post<ApiResponse<ReviewResult>>('/vocabulary/review', { vocabularyId, userId, result }, config)
        return r.data.data
    },
    getLearnedWords: async (userId: number, config?: AxiosRequestConfig) => {
        const r = await api.get<ApiResponse<VocabularyResponse[]>>(`/vocabulary/learned?userId=${userId}`, config)
        return r.data.data
    },
    getLearnedCount: async (userId: number, config?: AxiosRequestConfig) => {
        const r = await api.get<ApiResponse<number>>(`/vocabulary/learned/count?userId=${userId}`, config)
        return r.data.data
    },
}
