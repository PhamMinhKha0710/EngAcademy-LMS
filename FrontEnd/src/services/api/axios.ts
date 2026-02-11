import axios from 'axios'

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
        // Handle 401 Unauthorized - Token expired or invalid
        if (error.response?.status === 401) {
            // Clear auth storage and redirect to login
            localStorage.removeItem('auth-storage')
            window.location.href = '/login'
        }

        // Handle 403 Forbidden
        if (error.response?.status === 403) {
            console.error('Access denied')
        }

        // Handle network errors
        if (!error.response) {
            console.error('Network error - please check your connection')
        }

        return Promise.reject(error)
    }
)

export default api
