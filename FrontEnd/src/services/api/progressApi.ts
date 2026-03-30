import api, { AxiosRequestConfig } from './axios'
interface ApiResponse<T> { success: boolean; message: string; data: T }

export interface ProgressResponse {
    id: number; userId: number; lessonId?: number; lessonTitle?: string;
    completionPercentage?: number; isCompleted?: boolean; lastAccessed?: string;
    questTaskCompleted?: boolean;
}

export const progressApi = {
    // === STUDENT endpoints (userId từ auth token) ===
    getMyProgress: async (config?: AxiosRequestConfig) => {
        const r = await api.get<ApiResponse<ProgressResponse[]>>('/progress/me', config)
        return r.data.data
    },
    getMyCompleted: async (config?: AxiosRequestConfig) => {
        const r = await api.get<ApiResponse<ProgressResponse[]>>('/progress/me/completed', config)
        return r.data.data
    },
    getMyInProgress: async (config?: AxiosRequestConfig) => {
        const r = await api.get<ApiResponse<ProgressResponse[]>>('/progress/me/in-progress', config)
        return r.data.data
    },
    getMyLessonProgress: async (lessonId: number, config?: AxiosRequestConfig) => {
        const r = await api.get<ApiResponse<ProgressResponse>>(`/progress/me/lesson/${lessonId}`, config)
        return r.data.data
    },
    updateMyProgress: async (lessonId: number, percentage: number, config?: AxiosRequestConfig) => {
        const r = await api.post<ApiResponse<ProgressResponse>>(`/progress/me/lesson/${lessonId}?percentage=${percentage}`, undefined, config)
        return r.data.data
    },
    completeMyLesson: async (lessonId: number, config?: AxiosRequestConfig) => {
        const r = await api.post<ApiResponse<ProgressResponse>>(`/progress/me/lesson/${lessonId}/complete`, undefined, config)
        return r.data.data
    },
    getMyStats: async (config?: AxiosRequestConfig) => {
        const r = await api.get<ApiResponse<Record<string, unknown>>>(`/progress/me/stats`, config)
        return r.data.data
    },

    // === TEACHER/ADMIN endpoints (userId path param) ===
    getUserProgress: async (userId: number, config?: AxiosRequestConfig) => {
        const r = await api.get<ApiResponse<ProgressResponse[]>>(`/progress/user/${userId}`, config)
        return r.data.data
    },
    getUserStats: async (userId: number, config?: AxiosRequestConfig) => {
        const r = await api.get<ApiResponse<Record<string, unknown>>>(`/progress/user/${userId}/stats`, config)
        return r.data.data
    },
}
