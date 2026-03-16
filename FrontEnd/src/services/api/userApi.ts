import api from './axios'

// ===== Types matching Backend DTOs =====

export interface User {
    id: number
    username: string
    email: string
    fullName: string
    avatarUrl?: string
    coins?: number
    streakDays?: number
    isActive?: boolean
    roles: string[]
}

export interface ApiResponse<T> {
    success: boolean
    message: string
    data: T
    timestamp: string
}

export interface PageResponse<T> {
    content: T[]
    totalElements: number
    totalPages: number
    size: number
    number: number
}

export interface UserLearningStats {
    totalStudyMinutes: number
    weeklyStudyMinutes: number
    weeklyGoalMinutes: number
}

export interface UserSettings {
    soundEffectsEnabled: boolean | null
    dailyRemindersEnabled: boolean | null
    prefersDarkMode: boolean | null
    totalStudyMinutes: number
    weeklyStudyMinutes: number
    weeklyGoalMinutes: number
}

// ===== User API Functions =====

export const userApi = {
    /**
     * GET /api/v1/users/me - Get current user profile
     */
    getMe: async (): Promise<User> => {
        const response = await api.get<ApiResponse<User>>('/users/me')
        return response.data.data
    },

    /**
     * GET /api/v1/users/{id} - Get user by ID (Admin/Teacher)
     */
    getById: async (id: number): Promise<User> => {
        const response = await api.get<ApiResponse<User>>(`/users/${id}`)
        return response.data.data
    },

    /**
     * GET /api/v1/users - Get all users (Admin/School)
     */
    getAll: async (page = 0, size = 10): Promise<PageResponse<User>> => {
        const response = await api.get<ApiResponse<PageResponse<User>>>('/users', {
            params: { page, size }
        })
        return response.data.data
    },

    /**
     * PATCH /api/v1/users/me - Update own profile
     */
    updateProfile: async (fullName?: string, avatarUrl?: string): Promise<User> => {
        const params: any = {}
        if (fullName) params.fullName = fullName
        if (avatarUrl) params.avatarUrl = avatarUrl

        const response = await api.patch<ApiResponse<User>>('/users/me', null, {
            params
        })
        return response.data.data
    },

    /**
     * POST /api/v1/users/{id}/coins - Add coins to user (Admin/Teacher)
     */
    addCoins: async (userId: number, amount: number): Promise<void> => {
        await api.post(`/users/${userId}/coins`, null, {
            params: { amount }
        })
    },

    /**
     * PATCH /api/v1/users/me/password - Đổi mật khẩu
     */
    changePassword: async (oldPassword: string, newPassword: string, confirmPassword: string): Promise<void> => {
        await api.patch('/users/me/password', { oldPassword, newPassword, confirmPassword })
    },

    /**
     * GET /api/v1/users/me/settings - Lấy cài đặt cá nhân + thống kê học tập
     */
    getSettings: async (): Promise<UserSettings> => {
        const response = await api.get<ApiResponse<UserSettings>>('/users/me/settings')
        return response.data.data
    },

    /**
     * PUT /api/v1/users/me/settings - Cập nhật cài đặt cá nhân (preferences)
     */
    updateSettings: async (payload: Partial<Pick<UserSettings, 'soundEffectsEnabled' | 'dailyRemindersEnabled' | 'prefersDarkMode'>>): Promise<UserSettings> => {
        const response = await api.put<ApiResponse<UserSettings>>('/users/me/settings', payload)
        return response.data.data
    },
}
