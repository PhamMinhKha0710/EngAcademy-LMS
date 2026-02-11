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
}
