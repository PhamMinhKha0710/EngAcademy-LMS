import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { getRoleDashboard } from '../../lib/roles'
import { UserPlus } from 'lucide-react'

type PasswordStrength = 'weak' | 'medium' | 'strong'

function getPasswordStrength(password: string): PasswordStrength {
    if (password.length === 0) return 'weak'

    let score = 0
    if (password.length >= 6) score++
    if (password.length >= 10) score++
    if (/[A-Z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++

    if (score <= 1) return 'weak'
    if (score <= 3) return 'medium'
    return 'strong'
}

const strengthConfig: Record<PasswordStrength, { label: string; color: string; width: string }> = {
    weak: { label: 'Yếu', color: 'bg-red-500', width: 'w-1/3' },
    medium: { label: 'Trung bình', color: 'bg-yellow-500', width: 'w-2/3' },
    strong: { label: 'Mạnh', color: 'bg-emerald-500', width: 'w-full' },
}

export default function Register() {
    const [fullName, setFullName] = useState('')
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [validationError, setValidationError] = useState('')

    const { register, isLoading, error, isAuthenticated, user, clearError } = useAuthStore()
    const navigate = useNavigate()

    const passwordStrength = useMemo(() => getPasswordStrength(password), [password])

    useEffect(() => {
        if (isAuthenticated && user?.roles?.length) {
            navigate(getRoleDashboard(user.roles), { replace: true })
        }
    }, [isAuthenticated, user, navigate])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setValidationError('')
        clearError()

        if (password.length < 6) {
            setValidationError('Mật khẩu phải có ít nhất 6 ký tự')
            return
        }

        if (password !== confirmPassword) {
            setValidationError('Mật khẩu xác nhận không khớp')
            return
        }

        try {
            await register({ fullName, username, email, password })
            const authState = useAuthStore.getState()
            const roles = authState.user?.roles || []
            if (roles.length === 0) {
                setValidationError('Tài khoản không có quyền truy cập')
                return
            }
            navigate(getRoleDashboard(roles), { replace: true })
        } catch {
            // error handled by store
        }
    }

    const displayError = error || validationError

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="card p-8">
                    {/* Icon */}
                    <div className="flex items-center justify-center mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-xl flex items-center justify-center">
                            <UserPlus className="w-7 h-7 text-white" />
                        </div>
                    </div>

                    {/* Heading */}
                    <h2 className="text-2xl font-bold text-center mb-2" style={{ color: 'var(--color-text)' }}>
                        Tạo tài khoản
                    </h2>
                    <p className="text-center mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                        Bắt đầu hành trình học tiếng Anh
                    </p>

                    {/* Error */}
                    {displayError && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
                            {displayError}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                                Họ và tên
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="input-field"
                                placeholder="Nguyễn Văn A"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                                Tên đăng nhập
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="input-field"
                                placeholder="username"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field"
                                placeholder="email@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                                Mật khẩu
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field"
                                placeholder="Ít nhất 6 ký tự"
                                required
                            />

                            {/* Password strength indicator */}
                            {password.length > 0 && (
                                <div className="mt-2">
                                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-tertiary)' }}>
                                        <div
                                            className={`h-full rounded-full transition-all duration-300 ${strengthConfig[passwordStrength].color} ${strengthConfig[passwordStrength].width}`}
                                        />
                                    </div>
                                    <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                                        Độ mạnh: {strengthConfig[passwordStrength].label}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                                Xác nhận mật khẩu
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="input-field"
                                placeholder="Nhập lại mật khẩu"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full disabled:opacity-50"
                        >
                            {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="mt-6 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        Đã có tài khoản?{' '}
                        <Link to="/login" className="text-blue-500 hover:text-blue-400 font-medium">
                            Đăng nhập
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
