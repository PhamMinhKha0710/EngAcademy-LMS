import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/authStore'
import { useToastStore } from '../../store/toastStore'
import { getRoleDashboard } from '../../lib/roles'
import { UserIcon as User, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useGoogleLogin } from '@react-oauth/google'

const LOGIN_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwz77tXPhtaVu71kbj1TYD3l4p2jrk53hH9M-HUwzmI7Fd3fWTYTOoNvYzVAjftKhQi5Jxkumt-seiEd19PZ1EC5OwFpB2Mx8kj-G71H1R4G_vTXX_Hdo9NUrxac0RBZ5S-5AqOr4pHkyyVlFfh0g2hLjLffj0oYKdDAkvlVBrNv1rkeVAPGMfBzHo5in_EZJXI3Ozc10qM9DqUa6fjv54CLAIwXJWRxRYMZ_EYlywsq2vHs2I7zOnlD5maL2lAaiEJSJQPu3K1d9u'

export default function Login() {
    const { t } = useTranslation()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [rememberMe, setRememberMe] = useState(false)
    const [roleError, setRoleError] = useState('')
    const { login, isLoading, error, isAuthenticated, user, clearError } = useAuthStore()
    const { addToast } = useToastStore()
    const navigate = useNavigate()

    const googleLoginFlow = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setRoleError('')
            clearError()
            try {
                // When using useGoogleLogin, we receive an access_token by default, 
                // not an ID token (credential). We send it to backend to fetch user info.
                await useAuthStore.getState().loginWithGoogle(tokenResponse.access_token)
                
                const authState = useAuthStore.getState()
                const roles = authState.user?.roles || []
                if (roles.length === 0) {
                    setRoleError('Tài khoản không có quyền truy cập')
                    return
                }
                navigate(getRoleDashboard(roles), { replace: true })
            } catch {
                 // error
            }
        },
        onError: () => setRoleError('Đăng nhập Google thất bại.'),
    })

    useEffect(() => {
        clearError()
    }, [clearError])

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
                setRoleError(t('auth.accountNoAccess'))
                return
            }
            addToast({ type: 'success', message: 'Đăng nhập thành công! Chào mừng bạn.' })
            navigate(getRoleDashboard(roles), { replace: true })
        } catch {
            // Error already shown in-line via authStore.error (no duplicate toast)
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
                                className="relative w-full max-w-md aspect-square rounded-2xl overflow-hidden shadow-lg"
                                style={{ backgroundImage: `url('${LOGIN_IMAGE}')` }}
                            />
                            <div className="mt-8 text-center relative z-10">
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">
                                    {t('auth.learningIsFun')}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400">
                                    {t('auth.unlockPotential')}
                                </p>
                            </div>
                        </div>

                        {/* Right Column: Login Form */}
                        <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16">
                            <div className="w-full max-w-md mx-auto space-y-8">
                                <div className="space-y-2">
                                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                                        {t('auth.welcomeBack')}
                                    </h1>
                                    <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
                                        {t('auth.readyToContinue')}
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
                                            {t('auth.usernameOrEmail')}
                                        </label>
                                        <div className="relative flex items-center">
                                            <User className="absolute left-4 w-5 h-5 text-primary-500" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                            <input
                                                id="username"
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 focus:ring-0 text-slate-900 dark:text-white placeholder-slate-500 font-medium text-lg transition-all"
                                                placeholder={t('auth.usernamePlaceholder')} 
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-slate-900 dark:text-slate-200 text-lg font-bold" htmlFor="password">
                                            {t('auth.password')}
                                        </label>
                                        <div className="relative flex items-center">
                                            <Lock className="absolute left-4 w-5 h-5 text-primary-500" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                            <input
                                                id="password"
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-primary-500 focus:ring-0 text-slate-900 dark:text-white placeholder-slate-500 font-medium text-lg transition-all"
                                                placeholder={t('auth.passwordPlaceholder')} 
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="w-5 h-5" strokeWidth={2} />
                                                ) : (
                                                    <Eye className="w-5 h-5" strokeWidth={2} />
                                                )}
                                            </button>
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
                                                {t('auth.rememberMe')}
                                            </span>
                                        </label>
                                        <Link
                                            to="/forgot-password"
                                            className="text-primary-500 hover:text-orange-600 font-bold text-base flex items-center gap-1 group"
                                        >
                                            {t('auth.forgotPassword.title')}
                                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
                                        </Link>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-primary-500 hover:bg-orange-600 text-white text-xl font-black py-4 rounded-xl shadow-lg shadow-primary-500/30 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isLoading ? t('common.loading') : (
                                            <>
                                                {t('nav.login')}
                                                <ArrowRight className="w-5 h-5" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="relative flex py-2 items-center">
                                    <div className="flex-grow border-t border-slate-200 dark:border-slate-700" />
                                    <span className="flex-shrink-0 mx-4 text-slate-400 text-sm font-semibold uppercase tracking-wider">
                                        {t('auth.orContinueWith')}
                                    </span>
                                    <div className="flex-grow border-t border-slate-200 dark:border-slate-700" />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => googleLoginFlow()}
                                    className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-lg font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-3"
                                >
                                    <svg className="w-6 h-6" viewBox="0 0 24 24">
                                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>
                                    {t('auth.loginWithGoogle')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
