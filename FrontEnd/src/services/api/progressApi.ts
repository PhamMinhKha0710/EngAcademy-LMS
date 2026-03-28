import api, { AxiosRequestConfig } from './axios'
interface ApiResponse<T> { success: boolean; message: string; data: T }

export interface ProgressResponse {
    id: number; userId: number; lessonId?: number; lessonTitle?: string;
    completionPercentage?: number; isCompleted?: boolean; lastAccessed?: string;
    questTaskCompleted?: boolean;
}

export const progressApi = {
    getAll: async (userId: number, config?: AxiosRequestConfig) => {
        const r = await api.get<ApiResponse<ProgressResponse[]>>(`/progress/user/${userId}`, config)
        return r.data.data
    },
    getCompleted: async (userId: number, config?: AxiosRequestConfig) => {
        const r = await api.get<ApiResponse<ProgressResponse[]>>(`/progress/user/${userId}/completed`, config)
        return r.data.data
    },
    getInProgress: async (userId: number, config?: AxiosRequestConfig) => {
        const r = await api.get<ApiResponse<ProgressResponse[]>>(`/progress/user/${userId}/in-progress`, config)
        return r.data.data
    },
    getForLesson: async (userId: number, lessonId: number, config?: AxiosRequestConfig) => {
        const r = await api.get<ApiResponse<ProgressResponse>>(`/progress/user/${userId}/lesson/${lessonId}`, config)
        return r.data.data
    },
    updateProgress: async (userId: number, lessonId: number, percentage: number, config?: AxiosRequestConfig) => {
        const r = await api.post<ApiResponse<ProgressResponse>>(`/progress/user/${userId}/lesson/${lessonId}?percentage=${percentage}`, undefined, config)
        return r.data.data
    },
    completeLesson: async (userId: number, lessonId: number, config?: AxiosRequestConfig) => {
        const r = await api.post<ApiResponse<ProgressResponse>>(`/progress/user/${userId}/lesson/${lessonId}/complete`, undefined, config)
        return r.data.data
    },
    getStats: async (userId: number, config?: AxiosRequestConfig) => {
        const r = await api.get<ApiResponse<Record<string, unknown>>>(`/progress/user/${userId}/stats`, config)
        return r.data.data
    },
}
