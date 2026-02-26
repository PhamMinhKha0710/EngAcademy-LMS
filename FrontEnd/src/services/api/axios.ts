import axios from 'axios'
import { useToastStore } from '../../store/toastStore'

// Create axios instance with base configuration
const api = axios.create({
    baseURL: '/api/v1',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor - Add JWT token to headers
api.interceptors.request.use(
    (config) => {
        // Get token from localStorage (persisted by zustand)
        const authStorage = localStorage.getItem('auth-storage')
        if (authStorage) {
            try {
                const { state } = JSON.parse(authStorage)
                if (state?.accessToken) {
                    config.headers.Authorization = `Bearer ${state.accessToken}`
                }
            } catch (e) {
                console.error('Error parsing auth storage:', e)
            }
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor - Handle errors globally
api.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        const { addToast } = useToastStore.getState()

        // Handle 401 Unauthorized - Token expired or invalid
        if (error.response?.status === 401) {
            addToast({
                type: 'error',
                message: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.',
            })
            // Clear auth storage and redirect to login
            localStorage.removeItem('auth-storage')
            window.location.href = '/login'
        }
        // Handle 403 Forbidden
        else if (error.response?.status === 403) {
            addToast({
                type: 'warning',
                message: 'Bạn không có quyền truy cập chức năng này.',
            })
            console.error('Access denied')
        }
        // Handle network errors
        else if (!error.response) {
            addToast({
                type: 'error',
                message: 'Lỗi mạng - Vui lòng kiểm tra kết nối internet của bạn.',
            })
            console.error('Network error - please check your connection')
        }
        // Other errors (400, 500, etc.)
        else {
            addToast({
                type: 'error',
                message: error.response?.data?.message || 'Đã xảy ra lỗi hệ thống.',
            })
        }

        return Promise.reject(error)
    }
)

export default api
