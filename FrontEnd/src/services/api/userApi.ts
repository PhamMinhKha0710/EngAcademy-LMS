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
        const response = await api.patch<ApiResponse<User>>('/users/me', null, {
            params: { fullName, avatarUrl }
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
}
