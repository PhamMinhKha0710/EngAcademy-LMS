import api from './axios'
interface ApiResponse<T> { success: boolean; message: string; data: T }

export interface QuestionOption { id: number; optionText: string; isCorrect: boolean }
export interface QuestionResponse {
    id: number; questionType: string; questionText: string; points?: number;
    explanation?: string; lessonId?: number; lessonTitle?: string; options: QuestionOption[];
}
export interface QuestionRequest {
    lessonId?: number; questionType: string; questionText: string; points?: number;
    explanation?: string; options: { optionText: string; isCorrect: boolean }[];
}

export const questionApi = {
    getAll: async () => {
        const r = await api.get<ApiResponse<QuestionResponse[]>>('/questions')
        return r.data.data
    },
    getByLesson: async (lessonId: number) => {
        const r = await api.get<ApiResponse<QuestionResponse[]>>(`/questions/lesson/${lessonId}`)
        return r.data.data
    },
    getById: async (id: number) => {
        const r = await api.get<ApiResponse<QuestionResponse>>(`/questions/${id}`)
        return r.data.data
    },
    create: async (data: QuestionRequest) => {
        const r = await api.post<ApiResponse<QuestionResponse>>('/questions', data)
        return r.data.data
    },
    update: async (id: number, data: QuestionRequest) => {
        const r = await api.put<ApiResponse<QuestionResponse>>(`/questions/${id}`, data)
        return r.data.data
    },
    delete: async (id: number) => { await api.delete(`/questions/${id}`) },
}
