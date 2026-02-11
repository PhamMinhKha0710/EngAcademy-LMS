import api from './axios'
interface ApiResponse<T> { success: boolean; message: string; data: T }

export interface ProgressResponse {
    id: number; userId: number; lessonId?: number; lessonTitle?: string;
    completionPercentage?: number; isCompleted?: boolean; lastAccessed?: string;
}

export const progressApi = {
    getAll: async (userId: number) => {
        const r = await api.get<ApiResponse<ProgressResponse[]>>(`/progress/user/${userId}`)
        return r.data.data
    },
    getCompleted: async (userId: number) => {
        const r = await api.get<ApiResponse<ProgressResponse[]>>(`/progress/user/${userId}/completed`)
        return r.data.data
    },
    getInProgress: async (userId: number) => {
        const r = await api.get<ApiResponse<ProgressResponse[]>>(`/progress/user/${userId}/in-progress`)
        return r.data.data
    },
    getForLesson: async (userId: number, lessonId: number) => {
        const r = await api.get<ApiResponse<ProgressResponse>>(`/progress/user/${userId}/lesson/${lessonId}`)
        return r.data.data
    },
    updateProgress: async (userId: number, lessonId: number, percentage: number) => {
        const r = await api.post<ApiResponse<ProgressResponse>>(`/progress/user/${userId}/lesson/${lessonId}?percentage=${percentage}`)
        return r.data.data
    },
    completeLesson: async (userId: number, lessonId: number) => {
        const r = await api.post<ApiResponse<ProgressResponse>>(`/progress/user/${userId}/lesson/${lessonId}/complete`)
        return r.data.data
    },
    getStats: async (userId: number) => {
        const r = await api.get<ApiResponse<Record<string, unknown>>>(`/progress/user/${userId}/stats`)
        return r.data.data
    },
}
