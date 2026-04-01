import api from './axios'
interface ApiResponse<T> { success: boolean; message: string; data: T }

export interface MistakeNotebook {
    id: number; userId?: number; vocabularyId?: number; word?: string; meaning?: string;
    mistakeCount?: number; lastMistakeAt?: string; addedAt?: string;
}
export interface MistakeRequest { vocabularyId: number; userId?: number }

export const mistakeApi = {
    getMyMistakes: async () => {
        const r = await api.get<ApiResponse<MistakeNotebook[]>>('/mistakes/me')
        return r.data.data
    },
    getMyTopMistakes: async () => {
        const r = await api.get<ApiResponse<MistakeNotebook[]>>('/mistakes/me/top')
        return r.data.data
    },
    getMyCount: async () => {
        const r = await api.get<ApiResponse<number>>('/mistakes/me/count')
        return r.data.data
    },
    addMistake: async (data: MistakeRequest) => {
        const r = await api.post<ApiResponse<MistakeNotebook>>('/mistakes', data)
        return r.data.data
    },
    deleteMistake: async (id: number) => { await api.delete(`/mistakes/${id}`) },
}
