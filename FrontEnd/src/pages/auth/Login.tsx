import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { getRoleDashboard } from '../../lib/roles'
import { User, Lock, ArrowRight } from 'lucide-react'
import { GoogleLogin } from '@react-oauth/google'

const LOGIN_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwz77tXPhtaVu71kbj1TYD3l4p2jrk53hH9M-HUwzmI7Fd3fWTYTOoNvYzVAjftKhQi5Jxkumt-seiEd19PZ1EC5OwFpB2Mx8kj-G71H1R4G_vTXX_Hdo9NUrxac0RBZ5S-5AqOr4pHkyyVlFfh0g2hLjLffj0oYKdDAkvlVBrNv1rkeVAPGMfBzHo5in_EZJXI3Ozc10qM9DqUa6fjv54CLAIwXJWRxRYMZ_EYlywsq2vHs2I7zOnlD5maL2lAaiEJSJQPu3K1d9u'

export default function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [rememberMe, setRememberMe] = useState(false)
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
        <div className="bg-background-light dark:bg-background-dark font-sans">
            <main className="flex items-center justify-center py-10 px-4 md:px-6 w-full">
                <div className="max-w-6xl w-full bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                    <div className="grid lg:grid-cols-2 gap-0 min-h-[600px]">
                        {/* Left Column: Illustration */}
                        <div className="relative bg-amber-50 dark:bg-slate-800/50 flex flex-col justify-center items-center p-10 lg:p-14 order-last lg:order-first">
                            <div
                                className="absolute inset-0 opacity-10"
                                style={{
                                    backgroundImage: 'radial-gradient(#f49d25 1.5px, transparent 1.5px)',
                                    backgroundSize: '24px 24px',
                                }}
                            />
                            <div
                                className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden shadow-lg transform rotate-2 hover:rotate-0 transition-transform duration-500 bg-cover bg-center"
                                style={{ backgroundImage: `url('${LOGIN_IMAGE}')` }}
                            />
                            <div className="mt-8 text-center relative z-10">
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                                    Học tập thật vui!
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    Mở khóa tiềm năng với các bài học tiếng Anh tương tác được thiết kế dành riêng cho bạn.
                                </p>
                            </div>
                        </div>

                        {/* Right Column: Login Form */}
                        <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
                            <div className="w-full max-w-md mx-auto space-y-8">
                                <div className="space-y-2">
                                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                                        Chào mừng trở lại!
                                    </h1>
                                    <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
                                        Sẵn sàng tiếp tục cuộc phiêu lưu của bạn chứ?
                                    </p>
                                </div>

                                {(error || roleError) && (
                                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm">
                                        {error || roleError}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-slate-900 dark:text-slate-200 text-lg font-bold" htmlFor="username">
                                            Tên đăng nhập hoặc Email
                                        </label>
                                        <div className="relative flex items-center">
                                            <User className="absolute left-4 w-5 h-5 text-primary-500" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                            <input
                                                id="username"
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 focus:ring-0 text-slate-900 dark:text-white placeholder-slate-500 font-medium text-lg transition-all"
                                                placeholder="superlearner123"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-slate-900 dark:text-slate-200 text-lg font-bold" htmlFor="password">
                                            Mật khẩu
                                        </label>
                                        <div className="relative flex items-center">
                                            <Lock className="absolute left-4 w-5 h-5 text-primary-500" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                            <input
                                                id="password"
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 focus:ring-0 text-slate-900 dark:text-white placeholder-slate-500 font-medium text-lg transition-all"
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <input
                                                type="checkbox"
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                                className="w-5 h-5 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
                                            />
                                            <span className="text-slate-600 dark:text-slate-400 font-medium group-hover:text-primary-500 transition-colors">
                                                Ghi nhớ đăng nhập
                                            </span>
                                        </label>
                                        <Link
                                            to="/forgot-password"
                                            className="text-primary-500 hover:text-orange-600 font-bold text-base flex items-center gap-1 group"
                                        >
                                            Quên mật khẩu?
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                                        </Link>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-primary-500 hover:bg-orange-600 text-white text-xl font-black py-4 rounded-xl shadow-lg shadow-primary-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isLoading ? 'Đang đăng nhập...' : (
                                            <>
                                                Đăng nhập
                                                <ArrowRight className="w-5 h-5" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="relative flex py-2 items-center">
                                    <div className="flex-grow border-t border-slate-200 dark:border-slate-700" />
                                    <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-semibold uppercase tracking-wider">
                                        Hoặc tiếp tục với
                                    </span>
                                    <div className="flex-grow border-t border-slate-200 dark:border-slate-700" />
                                </div>

                                <div className="flex justify-center w-full">
                                    <GoogleLogin
                                        onSuccess={async (credentialResponse) => {
                                            if (credentialResponse.credential) {
                                                setRoleError('')
                                                clearError()
                                                try {
                                                    await useAuthStore.getState().loginWithGoogle(credentialResponse.credential)
                                                    const authState = useAuthStore.getState()
                                                    const roles = authState.user?.roles || []
                                                    if (roles.length === 0) {
                                                        setRoleError('Tài khoản không có quyền truy cập')
                                                        return
                                                    }
                                                    navigate(getRoleDashboard(roles), { replace: true })
                                                } catch {
                                                    // Error handled by store
                                                }
                                            }
                                        }}
                                        onError={() => {
                                            setRoleError('Đăng nhập Google thất bại.')
                                        }}
                                        useOneTap
                                        theme="outline"
                                        size="large"
                                        text="continue_with"
                                        shape="rectangular"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
