import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { getRoleDashboard } from '../lib/roles'
import { LogIn } from 'lucide-react'

export default function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [roleError, setRoleError] = useState('')
    const { login, isLoading, error, isAuthenticated, user, clearError } = useAuthStore()
    const navigate = useNavigate()

    useEffect(() => {
        if (isAuthenticated && user?.roles?.length) {
            navigate(getRoleDashboard(user.roles), { replace: true })
        }
    }, [isAuthenticated, user, navigate])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setRoleError('')
        clearError()
        try {
            await login({ username, password })
            const authState = useAuthStore.getState()
            const roles = authState.user?.roles || []
            if (roles.length === 0) {
                setRoleError('Tài khoản không có quyền truy cập')
                return
            }
            navigate(getRoleDashboard(roles), { replace: true })
        } catch {
            // error handled by store
        }
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="card p-8">
                    {/* Icon */}
                    <div className="flex items-center justify-center mb-6">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl flex items-center justify-center">
                            <LogIn className="w-7 h-7 text-white" />
                        </div>
                    </div>

                    {/* Heading */}
                    <h2 className="text-2xl font-bold text-center mb-2" style={{ color: 'var(--color-text)' }}>
                        Đăng nhập
                    </h2>
                    <p className="text-center mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                        Chào mừng trở lại!
                    </p>

                    {/* Error */}
                    {(error || roleError) && (
                        <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
                            {error || roleError}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                Mật khẩu
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full disabled:opacity-50"
                        >
                            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </button>
                    </form>

                    {/* Footer */}
                    <p className="mt-6 text-center text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        Chưa có tài khoản?{' '}
                        <Link to="/register" className="text-blue-500 hover:text-blue-400 font-medium">
                            Đăng ký
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
