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

export interface LoginRequest {
    username: string
    password: string
}

export interface RegisterRequest {
    username: string
    email: string
    password: string
    fullName: string
    role?: string
}

// Backend returns AuthResponse inside ApiResponse.data
export interface AuthResponse {
    accessToken: string
    refreshToken: string
    id: number
    username: string
    email: string
    roles: string[]
}

// Generic API Response wrapper from backend
export interface ApiResponse<T> {
    success: boolean
    message: string
    data: T
    timestamp: string
}

// ===== Auth API Functions =====

export const authApi = {
    /**
     * POST /api/v1/auth/login
     */
    login: async (credentials: LoginRequest): Promise<AuthResponse> => {
        const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials)
        return response.data.data // Extract from ApiResponse wrapper
    },

    /**
     * POST /api/v1/auth/register
     */
    register: async (data: RegisterRequest): Promise<AuthResponse> => {
        const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data)
        return response.data.data
    },

    /**
     * GET /api/v1/users/me - Get current logged in user
     */
    getCurrentUser: async (): Promise<User> => {
        const response = await api.get<ApiResponse<User>>('/users/me')
        return response.data.data
    },

    /**
     * GET /api/v1/auth/health - Check server status
     */
    healthCheck: async (): Promise<string> => {
        const response = await api.get<ApiResponse<string>>('/auth/health')
        return response.data.data
    },
}
