import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import api from '@/lib/api'
import type { ApiResponse, AuthResponse, LoginRequest, User } from '@/types/api'

interface AuthState {
    user: User | null
    accessToken: string | null
    refreshToken: string | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
}

// Load initial state from localStorage
const storedToken = localStorage.getItem('accessToken')
const storedUser = localStorage.getItem('user')

const initialState: AuthState = {
    user: storedUser ? JSON.parse(storedUser) : null,
    accessToken: storedToken,
    refreshToken: localStorage.getItem('refreshToken'),
    isAuthenticated: !!storedToken,
    isLoading: false,
    error: null,
}

// Async thunk: Login
export const login = createAsyncThunk(
    'auth/login',
    async (credentials: LoginRequest, { rejectWithValue }) => {
        try {
            const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials)
            const data = response.data.data

            // Persist tokens
            localStorage.setItem('accessToken', data.accessToken)
            localStorage.setItem('refreshToken', data.refreshToken)

            // Map AuthResponse to User
            const user: User = {
                id: data.id,
                username: data.username,
                email: data.email,
                fullName: data.username,
                roles: data.roles,
            }
            localStorage.setItem('user', JSON.stringify(user))

            return { user, accessToken: data.accessToken, refreshToken: data.refreshToken }
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } }
            return rejectWithValue(err.response?.data?.message || 'Đăng nhập thất bại')
        }
    }
)

// Async thunk: Fetch current user
export const fetchCurrentUser = createAsyncThunk(
    'auth/fetchCurrentUser',
    async (_, { rejectWithValue }) => {
        try {
            const response = await api.get<ApiResponse<User>>('/users/me')
            const user = response.data.data
            localStorage.setItem('user', JSON.stringify(user))
            return user
        } catch (error: unknown) {
            const err = error as { response?: { data?: { message?: string } } }
            return rejectWithValue(err.response?.data?.message || 'Không thể lấy thông tin người dùng')
        }
    }
)

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.user = null
            state.accessToken = null
            state.refreshToken = null
            state.isAuthenticated = false
            state.error = null
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            localStorage.removeItem('user')
        },
        clearError: (state) => {
            state.error = null
        },
        setCredentials: (state, action: PayloadAction<{ user: User; accessToken: string; refreshToken: string }>) => {
            state.user = action.payload.user
            state.accessToken = action.payload.accessToken
            state.refreshToken = action.payload.refreshToken
            state.isAuthenticated = true
        },
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(login.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false
                state.user = action.payload.user
                state.accessToken = action.payload.accessToken
                state.refreshToken = action.payload.refreshToken
                state.isAuthenticated = true
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })
            // Fetch current user
            .addCase(fetchCurrentUser.fulfilled, (state, action) => {
                state.user = action.payload
            })
    },
})

export const { logout, clearError, setCredentials } = authSlice.actions
export default authSlice.reducer
