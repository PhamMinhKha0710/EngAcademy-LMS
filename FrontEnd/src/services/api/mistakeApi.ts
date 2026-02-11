import api from './axios'
interface ApiResponse<T> { success: boolean; message: string; data: T }

export interface MistakeNotebook {
    id: number; userId?: number; vocabularyId?: number; word?: string; meaning?: string;
    mistakeCount?: number; lastMistakeAt?: string;
}
export interface MistakeRequest { vocabularyId: number }

export const mistakeApi = {
    getUserMistakes: async (userId: number) => {
        const r = await api.get<ApiResponse<MistakeNotebook[]>>(`/mistakes/user/${userId}`)
        return r.data.data
    },
    getTopMistakes: async (userId: number) => {
        const r = await api.get<ApiResponse<MistakeNotebook[]>>(`/mistakes/user/${userId}/top`)
        return r.data.data
    },
    getCount: async (userId: number) => {
        const r = await api.get<ApiResponse<number>>(`/mistakes/user/${userId}/count`)
        return r.data.data
    },
    addMistake: async (data: MistakeRequest) => {
        const r = await api.post<ApiResponse<MistakeNotebook>>('/mistakes', data)
        return r.data.data
    },
    deleteMistake: async (id: number) => { await api.delete(`/mistakes/${id}`) },
}
