import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const Register = () => {
    const navigate = useNavigate()
    const { register, isLoading, error, clearError } = useAuthStore()

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
    })
    const [validationError, setValidationError] = useState('')

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        clearError()
        setValidationError('')
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.password !== formData.confirmPassword) {
            setValidationError('Mật khẩu xác nhận không khớp')
            return
        }

        if (formData.password.length < 6) {
            setValidationError('Mật khẩu phải có ít nhất 6 ký tự')
            return
        }

        try {
            await register({
                fullName: formData.fullName,
                email: formData.email,
                username: formData.username,
                password: formData.password,
            })
            navigate('/login', { state: { message: 'Đăng ký thành công! Vui lòng đăng nhập.' } })
        } catch {
            // Error is handled in store
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/30 via-slate-900 to-blue-900/20"></div>

            <div className="relative max-w-md w-full">
                <div className="card p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-white font-bold text-2xl">E</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white">Tạo tài khoản</h2>
                        <p className="text-slate-400 mt-2">Bắt đầu hành trình học tiếng Anh</p>
                    </div>

                    {/* Error Message */}
                    {(error || validationError) && (
                        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                            {error || validationError}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-2">
                                Họ và tên
                            </label>
                            <input
                                id="fullName"
                                name="fullName"
                                type="text"
                                required
                                value={formData.fullName}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Nguyễn Văn A"
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="email@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
                                Tên đăng nhập
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                value={formData.username}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Chọn tên đăng nhập"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                                Mật khẩu
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={formData.password}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Ít nhất 6 ký tự"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                                Xác nhận mật khẩu
                            </label>
                            <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="input-field"
                                placeholder="Nhập lại mật khẩu"
                            />
                        </div>

                        <div className="flex items-start">
                            <input
                                type="checkbox"
                                required
                                className="w-4 h-4 mt-1 rounded border-slate-600 text-blue-500 focus:ring-blue-500 bg-slate-800"
                            />
                            <span className="ml-2 text-sm text-slate-400">
                                Tôi đồng ý với{' '}
                                <a href="#" className="text-blue-400 hover:text-blue-300">Điều khoản sử dụng</a>
                                {' '}và{' '}
                                <a href="#" className="text-blue-400 hover:text-blue-300">Chính sách bảo mật</a>
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Đang xử lý...
                                </span>
                            ) : (
                                'Đăng ký'
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="mt-8 text-center text-slate-400">
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Register
