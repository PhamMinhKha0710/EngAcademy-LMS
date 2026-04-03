import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuthStore } from '../../store/authStore'
import { useToastStore } from '../../store/toastStore'
import { userApi } from '../../services/api/userApi'
import { getRoleDashboard } from '../../lib/roles'
import { User, Mail, Lock, ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { AVATARS, type Avatar } from '../../constants/avatars'

const MASCOT_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0aO4gpunlu02PLWAUmJ7s8bvVvwt2UJey0fzaBr2TrhxdLRrAQQbBmkBbgKVS81cuADz7QgGKxFznJpiDbW7sYGSKJPVmLNF8kn1SEkabCFlvU1BEamoI-9zPUGGoGV3VOLMz3MB0LQFxM_QnsSMB1m7kvW0NU5CZ3pgUVD1Xh98g5pWFl57xLzHiGcgvfTJVeCUbnwXtsMpSMxKw9Y5xVkyDXVlaAOmj3HE6gzwm9p5WUnCbZal_hUunGr0FTL1It2w6DEM29_nl'

type Step = 1 | 2 | 3

export default function Register() {
    const { t } = useTranslation()
    const [step, setStep] = useState<Step>(1)
    const [fullName, setFullName] = useState('')
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [selectedAvatar, setSelectedAvatar] = useState<Avatar>(AVATARS[0])
    const [validationError, setValidationError] = useState('')

    const { register, isLoading, error, isAuthenticated, user, clearError } = useAuthStore()
    const { addToast } = useToastStore()
    const navigate = useNavigate()

    useEffect(() => {
        clearError()
    }, [clearError])

    useEffect(() => {
        // Nếu đã ở bước 2 (đã đăng ký thành công nhưng chờ chọn avatar) hoặc bước 3 (màn welcome) thì không auto navigate
        if (step === 2 || step === 3) return 
        if (isAuthenticated && user?.roles?.length) {
            navigate(getRoleDashboard(user.roles), { replace: true })
        }
    }, [isAuthenticated, user, navigate, step])

    const validateStep1 = () => {
        setValidationError('')
        clearError()

        if (!fullName.trim()) {
            setValidationError(t('auth.register.step1.error.fullNameRequired'))
            return false
        }
        if (!username.trim()) {
            setValidationError(t('auth.register.step1.error.usernameRequired'))
            return false
        }
        if (!email.trim()) {
            setValidationError(t('auth.register.step1.error.emailRequired'))
            return false
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            setValidationError(t('auth.register.step1.error.emailInvalid'))
            return false
        }
        if (password.length < 6) {
            setValidationError(t('auth.register.step1.error.passwordLength'))
            return false
        }
        if (password !== confirmPassword) {
            setValidationError(t('auth.register.step1.error.confirmMismatch'))
            return false
        }
        return true
    }

    const handleFinishSignUp = async () => {
        if (!validateStep1()) return
        try {
            await register({ fullName, username, email, password })
            // Update avatar after registration
            try {
                await userApi.updateProfile(undefined, selectedAvatar.url)
                useAuthStore.getState().setUser({ ...useAuthStore.getState().user!, avatarUrl: selectedAvatar.url })
            } catch {
                // Avatar update optional
            }
            addToast({ type: 'success', message: 'Tạo tài khoản thành công! Chào đón bạn mới!' })
            setStep(3)
        } catch {
            addToast({ type: 'error', message: 'Lỗi đăng ký. Vui lòng kiểm tra lại thông tin.' })
        }
    }

    const handleLetsGo = () => {
        if (user?.roles?.length) {
            navigate(getRoleDashboard(user.roles), { replace: true })
        } else {
            navigate('/', { replace: true })
        }
    }

    const displayError = error || validationError

    return (
        <div className="bg-background-light dark:bg-background-dark font-sans">
            <main className="flex-1 flex justify-center py-8 px-4 sm:px-6 lg:px-8">
                <div className="w-full max-w-[1024px] flex flex-col gap-8">
                    {/* Progress */}
                    {step < 3 && (
                        <div className="flex justify-center">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <div className={`size-8 rounded-full flex items-center justify-center font-bold shadow-md ${step >= 1 ? 'bg-primary-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>1</div>
                                    <span className={`text-base font-bold ${step >= 1 ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{t('auth.register.step2.steps.info')}</span>
                                </div>
                                <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
                                <div className="flex items-center gap-2">
                                    <div className={`size-8 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-primary-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>2</div>
                                    <span className={`text-base ${step >= 2 ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{t('auth.register.step2.steps.avatar')}</span>
                                </div>
                                <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full opacity-50" />
                                <div className="flex items-center gap-2 opacity-50">
                                    <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500">3</div>
                                    <span className="text-slate-500 dark:text-slate-400">{t('auth.register.step2.steps.done')}</span>
                                </div>
                            </div>
                        </div>  
                    )}

                    {/* Step 1: Account Info */}
                    {step === 1 && (
                        <div className="flex flex-col lg:flex-row bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden min-h-[500px]">
                            <div className="lg:w-5/12 bg-primary-500/10 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
                                <div className="absolute top-[-50px] left-[-50px] size-40 bg-primary-500/20 rounded-full blur-3xl" />
                                <div className="absolute bottom-[-20px] right-[-20px] size-32 bg-primary-500/20 rounded-full blur-2xl" />
                                <div className="relative z-10 w-full max-w-[280px] aspect-square bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url('${MASCOT_URL}')` }} />
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-6">{t('auth.register.step1.title')}</h3>
                                <p className="text-slate-600 dark:text-slate-400 mt-2">{t('auth.register.step1.description')}</p>  
                            </div>
                            <div className="lg:w-7/12 p-8 lg:p-12 flex flex-col justify-center">
                                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t('auth.register.step1.title')}</h1>
                                <p className="text-slate-600 dark:text-slate-400 mb-8">{t('auth.register.step1.description')}</p>  

                                {displayError && (
                                    <div id="validationError" className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm">
                                        {displayError}
                                    </div>
                                )}

                                <form noValidate onSubmit={(e) => { e.preventDefault(); validateStep1() && setStep(2); }} className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">{t('auth.register.step1.fullName')}</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" strokeWidth={2} />
                                            <input
                                                id="fullName"
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                                                placeholder={t('auth.register.step1.fullNamePlaceholder')}  
                                                
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">{t('auth.register.step1.username')}</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" strokeWidth={2} />
                                            <input
                                                id="username"
                                                type="text"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                                                placeholder={t('auth.register.step1.usernamePlaceholder')}  
                                                
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">{t('auth.register.step1.parentEmail')}</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" strokeWidth={2} />
                                            <input
                                                id="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                                                placeholder={t('auth.register.step1.parentEmailPlaceholder')}  
                                                
                                            />
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{t('auth.register.step1.parentEmailNote')}</p>  
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">{t('auth.register.step1.password')}</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" strokeWidth={2} />
                                            <input
                                                id="password"
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                                                placeholder={t('auth.register.step1.passwordPlaceholder')}  
                                                
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1.5">{t('auth.register.step1.confirmPassword')}</label>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" strokeWidth={2} />
                                            <input
                                                id="confirmPassword"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                                                placeholder={t('auth.register.step1.confirmPasswordPlaceholder')}  
                                                
                                            />
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                                        <Link to="/login" className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors">
                                            {t('auth.register.step1.back')}
                                        </Link>  
                                        <button id="nextStep" type="submit" className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-primary-500/25 transition-all active:scale-95">
                                            {t('auth.register.step1.nextStep')}  
                                            <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Choose Avatar */}
                    {step === 2 && (
                        <>
                            <div className="text-center md:text-left">
                                <div className="flex items-center gap-2 text-primary-500 justify-center md:justify-start mb-2">
                                    <span className="text-sm font-bold uppercase tracking-wider">{t('auth.register.step2.progress')}</span>
                                </div>
                                <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-2">{t('auth.register.step2.heading')}</h1>
                                <p className="text-slate-600 dark:text-slate-400 text-lg max-w-2xl">
                                    {t('auth.register.step2.description')}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                                {AVATARS.map((avatar) => (
                                    <button
                                        key={avatar.id}
                                        type="button"
                                        onClick={() => setSelectedAvatar(avatar)}
                                        className={`flex flex-col items-center gap-3 p-2 rounded-xl transition-all ${
                                            selectedAvatar.id === avatar.id
                                                ? 'ring-4 ring-primary-500 shadow-lg scale-105'
                                                : 'ring-2 ring-slate-200 dark:ring-slate-700 hover:ring-primary-500/50'
                                        }`}
                                    >
                                        <div className="w-full aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                                            <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${avatar.url}')` }} />
                                            {selectedAvatar.id === avatar.id && (
                                                <div className="absolute top-2 right-2 bg-primary-500 text-white rounded-full p-1">
                                                    <Check className="w-4 h-4" strokeWidth={3} />
                                                </div>
                                            )}
                                        </div>
                                        <span className={`font-bold ${selectedAvatar.id === avatar.id ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                                            {avatar.name}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                                <div className="flex items-center gap-6">
                                    <div className="size-20 rounded-full overflow-hidden ring-4 ring-primary-500 flex-shrink-0">
                                        <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${selectedAvatar.url}')` }} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">{t('auth.register.step2.selected')}</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm">{t('auth.register.step2.ready')}</p>
                                    </div>
                                </div>
                                <div className="flex gap-4 w-full md:w-auto">
                                    <button
                                        id="backToStep1"
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <ArrowLeft className="w-5 h-5" strokeWidth={2} />
                                        {t('auth.register.step2.back')}
                                    </button>
                                    <button
                                        id="finishSignUp"
                                        type="button"
                                        onClick={handleFinishSignUp}
                                        disabled={isLoading}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 min-w-[200px] bg-primary-500 hover:bg-primary-600 text-white font-bold py-3.5 px-8 rounded-xl shadow-lg shadow-primary-500/20 transition-all disabled:opacity-50"
                                    >
                                        {isLoading ? t('auth.register.step2.signingUp') : (
                                            <>
                                                {t('auth.register.step2.finish')}
                                                <ArrowRight className="w-5 h-5" strokeWidth={2} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Step 3: Welcome */}
                    {step === 3 && (
                        <div className="w-full max-w-4xl mx-auto">
                            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[500px]">
                                <div className="flex-1 bg-sky-50 dark:bg-slate-800/50 p-8 md:p-12 flex flex-col items-center justify-center relative overflow-hidden">
                                    <div className="absolute top-10 left-10 size-16 rounded-full bg-primary-500/20 blur-xl" />
                                    <div className="absolute bottom-10 right-10 size-24 rounded-full bg-emerald-500/20 blur-xl" />
                                    <div className="relative bg-white dark:bg-slate-800 rounded-3xl shadow-lg px-8 py-6 mb-8 -rotate-2">
                                        <h1 className="text-2xl md:text-3xl font-black text-center text-slate-900 dark:text-white leading-tight">
                                            {t('auth.register.step3.welcome', { name: fullName || 'bạn' })}
                                        </h1>
                                    </div>
                                    <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-2xl overflow-hidden">
                                        <div className="w-full h-full bg-cover bg-center" style={{ backgroundImage: `url('${selectedAvatar.url}')` }} />
                                    </div>
                                </div>
                                <div className="flex-1 p-8 md:p-12 flex flex-col items-center justify-center gap-8 text-center">
                                    <div className="bg-amber-100 dark:bg-amber-900/30 border-2 border-primary-500/30 p-6 rounded-xl w-full max-w-xs flex flex-col items-center gap-3">
                                        <div className="size-16 bg-primary-500 rounded-full flex items-center justify-center shadow-lg text-white">
                                            <span className="text-3xl">🪙</span>
                                        </div>
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{t('auth.register.step3.firstGoal')}</h3>
                                        <p className="text-slate-700 dark:text-slate-300 text-sm">
                                            {t('auth.register.step3.firstGoalDesc', { coins: 50 })}
                                        </p>
                                    </div>
                                    <div className="space-y-4 w-full max-w-xs">
                                        <button
                                            id="getStarted"
                                            onClick={handleLetsGo}
                                            className="w-full h-16 bg-primary-500 hover:bg-primary-600 text-white rounded-full font-black text-xl shadow-lg shadow-primary-500/30 transition-all active:scale-95 flex items-center justify-center gap-3"
                                        >
                                            {t('auth.register.step3.getStarted')} 
                                            <ArrowRight className="w-6 h-6" strokeWidth={2.5} />
                                        </button>
                                        <Link
                                            to="/settings"
                                            className="block w-full h-12 text-slate-500 dark:text-slate-400 font-medium text-sm hover:text-primary-500 transition-colors leading-[3rem]"
                                        >
                                            {t('auth.register.step3.changeAvatar')}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
