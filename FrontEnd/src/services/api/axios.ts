import axios from 'axios'
import { useToastStore } from '../../store/toastStore'

export type { AxiosRequestConfig } from 'axios'

const api = axios.create({
    baseURL: (import.meta.env.VITE_API_URL || '') + '/api/v1',
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
})

api.interceptors.request.use(
    (config) => {
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
    (error) => Promise.reject(error)
)

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const { addToast } = useToastStore.getState()

        if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
            addToast({ type: 'error', message: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.' })
            localStorage.removeItem('auth-storage')
            window.location.href = '/login'
        } else if (error.response?.status === 403) {
            addToast({ type: 'warning', message: 'Bạn không có quyền truy cập chức năng này.' })
        } else if (!error.response) {
            addToast({ type: 'error', message: 'Lỗi mạng - Vui lòng kiểm tra kết nối internet của bạn.' })
        } else {
            const isLoginRequest = error.config?.url?.includes('/auth/login')
            if (!isLoginRequest) {
                const message = error.response?.data?.message || 'Đã xảy ra lỗi hệ thống.'
                addToast({ type: 'error', message })
            }
        }
        return Promise.reject(error)
    }
)

export default api
