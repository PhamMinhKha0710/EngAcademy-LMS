import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Mail, ArrowLeft, KeyRound, ShieldCheck, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { authApi } from '../../services/api/authApi'  

type Step = 'email' | 'newpw' | 'otp' | 'success'

export default function ForgotPassword() {
    const { t } = useTranslation()
    const navigate = useNavigate()
    const [step, setStep] = useState<Step>('email')

    const [email, setEmail] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [otp, setOtp] = useState(['', '', '', '', '', ''])

    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const otpRefs = useRef<(HTMLInputElement | null)[]>([])

    // ─── Step Indicator ────────────────────────────────────────────────────────
    const steps = [
        { key: 'email', label: t('auth.forgotPassword.steps.email') },
        { key: 'newpw', label: t('auth.forgotPassword.steps.newPassword') },
        { key: 'otp',   label: t('auth.forgotPassword.steps.otp') },
        { key: 'success', label: t('auth.forgotPassword.steps.done') },
    ]
    const currentIdx = steps.findIndex(s => s.key === step)

    const StepIndicator = () => (
        <div className="flex items-center justify-center gap-1 mb-8">
            {steps.map((s, i) => {
                const done = i < currentIdx
                const active = i === currentIdx
                return (
                    <div key={s.key} className="flex items-center gap-1">
                        <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-all ${done ? 'bg-emerald-500 text-white' :
                                active ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' :
                                    'bg-slate-200 dark:bg-slate-700 text-slate-400'
                            }`}>
                            {done ? '✓' : i + 1}
                        </div>
                        <span className={`text-xs font-medium hidden sm:block ${active ? 'text-blue-500' : done ? 'text-emerald-500' : 'text-slate-400'
                            }`}>{s.label}</span>
                        {i < 3 && <div className={`w-5 h-0.5 mx-0.5 transition-all ${done ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700'}`} />}
                    </div>
                )
            })}
        </div>
    )

    const ErrorBox = () => error ? (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
            {error}
        </div>
    ) : null

    // ─── Step 1: Nhập Email ────────────────────────────────────────────────────
    const handleEmailNext = (e: React.FormEvent) => {
        e.preventDefault()
        if (!email.trim()) return
        setError(null)
        setStep('newpw')
    }

    // ─── Step 2: Nhập mật khẩu mới + Gửi OTP ─────────────────────────────────
    // const handleSendOtp = async (e: React.FormEvent) => {
    //     e.preventDefault()
    //     if (newPassword.length < 6) {
    //         setError('Mật khẩu mới phải có ít nhất 6 ký tự')
    //         return
    //     }
    //     if (newPassword !== confirmPassword) {
    //         setError('Mật khẩu xác nhận không khớp')
    //         return
    //     }
    //     setError(null)
    //     setIsLoading(true)
    //     try {
    //         await authApi.forgotPassword(email)
    //         setStep('otp')
    //     } catch (err: any) {
    //         setError(err?.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.')
    //     } finally {
    //         setIsLoading(false)
    //     }
    // }

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword.length < 6) {
            setError(t('auth.forgotPassword.error.passwordLength'))
            return
        }

        if (newPassword !== confirmPassword) {
            setError(t('auth.forgotPassword.error.confirmMismatch'))
            return
        }

        // kiểm tra có số và ký tự đặc biệt
        const passwordRegex = /^(?=.*[0-9])(?=.*[!@#$%^&*])/;

        if (!passwordRegex.test(newPassword)) {
            setError("Mật khẩu phải chứa ít nhất 1 số và 1 ký tự đặc biệt");
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            await authApi.forgotPassword(email);
            setStep("otp");
        } catch (err: any) {
            setError(err?.response?.data?.message || t('auth.forgotPassword.error.generic'))
        } finally {
            setIsLoading(false);
        }
    };

    // ─── OTP Input Handlers ────────────────────────────────────────────────────
    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return
        const next = [...otp]
        next[index] = value.slice(-1)
        setOtp(next)
        if (value && index < 5) otpRefs.current[index + 1]?.focus()
    }
    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus()
    }
    const handleOtpPaste = (e: React.ClipboardEvent) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
        if (pasted.length > 0) {
            const next = [...otp]
            pasted.split('').forEach((ch, i) => { if (i < 6) next[i] = ch })
            setOtp(next)
            otpRefs.current[Math.min(pasted.length, 5)]?.focus()
        }
        e.preventDefault()
    }

    // ─── Step 3: Xác nhận OTP ─────────────────────────────────────────────────
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault()
        const otpValue = otp.join('')
        if (otpValue.length !== 6) {
            setError(t('auth.forgotPassword.error.otpIncomplete'))
            return
        }
        setError(null)
        setIsLoading(true)
        try {
            await authApi.resetPassword(otpValue, newPassword, confirmPassword)
            setStep('success')
        } catch (err: any) {
            setError(err?.response?.data?.message || t('auth.forgotPassword.error.otpInvalid'))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                <div className="card p-8">

                    {/* ══════════════════════════════════════════════════════════
                        STEP 1: Nhập Email
                    ══════════════════════════════════════════════════════════ */}
                    {step === 'email' && (
                        <>
                            <div className="flex items-center justify-center mb-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                                    <Mail className="w-7 h-7 text-white" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-center mb-2" style={{ color: 'var(--color-text)' }}>
                                {t('auth.forgotPassword.title')}
                            </h2>  
                            <p className="text-center mb-6 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                {t('auth.forgotPassword.instructions')}
                            </p>  

                            <StepIndicator />
                            <ErrorBox />

                            <form onSubmit={handleEmailNext} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                                        {t('auth.forgotPassword.emailLabel')}
                                    </label>  
                                    <div className="relative">
                                        {/* <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /> */}
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            className="input-field !pl-10"
                                            placeholder={t('auth.forgotPassword.emailPlaceholder')}  
                                            required autoFocus
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                                    {t('auth.forgotPassword.next')}  
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium hover:gap-3 transition-all" style={{ color: 'var(--color-text-secondary)' }}>
                                    <ArrowLeft className="w-4 h-4" /> {t('auth.forgotPassword.backToLogin')}  
                                </Link>
                            </div>
                        </>
                    )}

                    {/* ══════════════════════════════════════════════════════════
                        STEP 2: Nhập mật khẩu mới → Gửi OTP
                    ══════════════════════════════════════════════════════════ */}
                    {step === 'newpw' && (
                        <>
                            <div className="flex items-center justify-center mb-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
                                    <KeyRound className="w-7 h-7 text-white" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-center mb-2" style={{ color: 'var(--color-text)' }}>
                                {t('auth.forgotPassword.newPasswordTitle')}
                            </h2>  
                            <p className="text-center mb-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                {t('auth.forgotPassword.newPasswordInstructions')}
                            </p>  
                            <p className="text-center mb-6 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                                {email}
                            </p>

                            <StepIndicator />
                            <ErrorBox />

                            <form onSubmit={handleSendOtp} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                                        {t('auth.forgotPassword.passwordLabel')}
                                    </label>  
                                    <div className="relative">
                                        <input
                                            type={showNew ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            className="input-field pr-10"
                                            placeholder={t('auth.forgotPassword.passwordPlaceholder')}  
                                            required autoFocus
                                        />
                                        <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                                        {t('auth.forgotPassword.confirmPasswordLabel')}
                                    </label>  
                                    <div className="relative">
                                        <input
                                            type={showConfirm ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            className={`input-field pr-10 ${
                                                confirmPassword && confirmPassword !== newPassword ? 'border-red-400 focus:border-red-400' :
                                                confirmPassword && confirmPassword === newPassword ? 'border-emerald-400 focus:border-emerald-400' : ''
                                            }`}
                                            placeholder={t('auth.forgotPassword.confirmPasswordPlaceholder')}  
                                            required
                                        />
                                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {confirmPassword && confirmPassword !== newPassword && (
                                        <p className="text-xs text-red-500 mt-1">{t('auth.forgotPassword.passwordMismatch')}  </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                    {isLoading ? t('auth.forgotPassword.sendingOtp') : t('auth.forgotPassword.changePasswordSendOtp')}  
                                </button>
                            </form>

                            <div className="mt-5 text-center">
                                <button onClick={() => { setStep('email'); setError(null) }} className="text-sm font-medium inline-flex items-center gap-1.5 hover:gap-2.5 transition-all" style={{ color: 'var(--color-text-secondary)' }}>
                                    <ArrowLeft className="w-3.5 h-3.5" /> {t('auth.forgotPassword.stepBack')}
                                </button>  
                            </div>
                        </>
                    )}

                    {/* ══════════════════════════════════════════════════════════
                        STEP 3: Nhập mã OTP
                    ══════════════════════════════════════════════════════════ */}
                    {step === 'otp' && (
                        <>
                            <div className="flex items-center justify-center mb-6">
                                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                                    <ShieldCheck className="w-7 h-7 text-white" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold text-center mb-2" style={{ color: 'var(--color-text)' }}>
                                {t('auth.forgotPassword.enterOtpTitle')}
                            </h2>  
                            <p className="text-center mb-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                {t('auth.forgotPassword.otpSentTo')}
                            </p>  
                            <p className="text-center mb-6 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                                {email}
                            </p>

                            <StepIndicator />
                            <ErrorBox />

                            <form onSubmit={handleVerifyOtp} className="space-y-6">
                                {/* OTP 6 ô */}
                                <div>
                                    <label className="block text-sm font-medium text-center mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                                        {t('auth.forgotPassword.otpLabel')}
                                    </label>  
                                    <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                                        {otp.map((digit, i) => (
                                            <input
                                                key={i}
                                                ref={el => { otpRefs.current[i] = el }}
                                                type="text"
                                                inputMode="numeric"
                                                maxLength={1}
                                                value={digit}
                                                onChange={e => handleOtpChange(i, e.target.value)}
                                                onKeyDown={e => handleOtpKeyDown(i, e)}
                                                className={`text-center text-xl font-bold rounded-xl border-2 outline-none transition-all
                                                    ${digit
                                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                                        : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                                                    }
                                                    focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20`}
                                                style={{ width: '44px', height: '52px' }}
                                                autoFocus={i === 0}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-center mt-2 text-orange-500 font-medium">
                                        {t('auth.forgotPassword.otpValidDuration', { minutes: 10 })}
                                    </p>  
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading || otp.join('').length !== 6}
                                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
                                >
                                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                    {isLoading ? t('auth.forgotPassword.verifying') : t('auth.forgotPassword.verifyOtp')}  
                                </button>
                            </form>

                            <div className="mt-5 text-center space-y-2">
                                <button onClick={() => { setStep('newpw'); setOtp(['', '', '', '', '', '']); setError(null) }} className="text-sm font-medium inline-flex items-center gap-1.5 hover:gap-2.5 transition-all" style={{ color: 'var(--color-text-secondary)' }}>
                                    <ArrowLeft className="w-3.5 h-3.5" /> {t('auth.forgotPassword.stepBack')}
                                </button>
                                <p className="block text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                    {t('auth.forgotPassword.didntReceive')}{' '}
                                    <button
                                        type="button"
                                        onClick={() => { setOtp(['', '', '', '', '', '']); setError(null); authApi.forgotPassword(email) }}
                                        className="text-blue-500 font-semibold hover:underline"
                                    >
                                        {t('auth.forgotPassword.resend')}
                                    </button>  
                                </p>
                            </div>
                        </>
                    )}

                    {/* ══════════════════════════════════════════════════════════
                        STEP 4: Thành công
                    ══════════════════════════════════════════════════════════ */}
                    {step === 'success' && (
                        <div className="text-center">
                            <div className="flex items-center justify-center mb-6">
                                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold mb-3" style={{ color: 'var(--color-text)' }}>
                                {t('auth.forgotPassword.successTitle')} 🎉
                            </h2>  
                            <p className="mb-8 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                {t('auth.forgotPassword.successDesc')}
                            </p>  
                            <StepIndicator />
                            <button onClick={() => navigate('/login')} className="btn-primary w-full shadow-lg shadow-emerald-500/20">
                                {t('auth.forgotPassword.loginNow')}
                            </button>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
