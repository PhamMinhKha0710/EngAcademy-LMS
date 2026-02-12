import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi, LoginRequest, RegisterRequest, User, AuthResponse } from '../services/api/authApi'

interface AuthState {
    user: User | null
    accessToken: string | null
    refreshToken: string | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null

    // Actions
    login: (credentials: LoginRequest) => Promise<void>
    register: (data: RegisterRequest) => Promise<void>
    logout: () => void
    clearError: () => void
    fetchCurrentUser: () => Promise<void>
    setUser: (user: User | null) => void
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (credentials: LoginRequest) => {
                set({ isLoading: true, error: null })
                try {
                    const response: AuthResponse = await authApi.login(credentials)

                    // Map AuthResponse to User
                    const user: User = {
                        id: response.id,
                        username: response.username,
                        email: response.email,
                        fullName: response.username, // Will be fetched from /users/me
                        roles: response.roles,
                    }

                    set({
                        user,
                        accessToken: response.accessToken,
                        refreshToken: response.refreshToken,
                        isAuthenticated: true,
                        isLoading: false,
                    })

                    // Fetch full user profile
                    await get().fetchCurrentUser()
                } catch (error: any) {
                    set({
                        error: error.response?.data?.message || 'Đăng nhập thất bại',
                        isLoading: false,
                    })
                    throw error
                }
            },

            register: async (data: RegisterRequest) => {
                set({ isLoading: true, error: null })
                try {
                    const response: AuthResponse = await authApi.register(data)

                    const user: User = {
                        id: response.id,
                        username: response.username,
                        email: response.email,
                        fullName: data.fullName,
                        roles: response.roles,
                    }

                    set({
                        user,
                        accessToken: response.accessToken,
                        refreshToken: response.refreshToken,
                        isAuthenticated: true,
                        isLoading: false,
                    })
                } catch (error: any) {
                    set({
                        error: error.response?.data?.message || 'Đăng ký thất bại',
                        isLoading: false,
                    })
                    throw error
                }
            },

            fetchCurrentUser: async () => {
                try {
                    const user = await authApi.getCurrentUser()
                    set({ user })
                } catch (error) {
                    console.error('Failed to fetch user profile:', error)
                }
            },

            logout: () => {
                set({
                    user: null,
                    accessToken: null,
                    refreshToken: null,
                    isAuthenticated: false,
                    error: null,
                })
            },

            clearError: () => set({ error: null }),

            setUser: (user: User | null) => set({ user }),
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
)

// Re-export User type for convenience
export type { User } from '../services/api/authApi'
