import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useThemeStore } from '../store/themeStore'
import { useAuthStore } from '../store/authStore'
import { useRole } from '../hooks/useRole'
import { userApi, type UserSettings } from '../services/api/userApi'
import { AVATARS } from '../constants/avatars'
import ThemeToggle from '../components/ui/ThemeToggle'
import {
    Save, Camera, Volume2, Bell, Moon, Timer,
    Check, Loader2, Palette, Lock, Eye, EyeOff, ShieldCheck
} from 'lucide-react'
import type { User } from '../store/authStore'

export default function SettingsPage() {
    const { t } = useTranslation()
    const { isDark } = useThemeStore()
    const { user, setUser } = useAuthStore()
    const { isStudent } = useRole()

    const [fullName, setFullName] = useState('')
    const [selectedAvatarUrl, setSelectedAvatarUrl] = useState('')
    const [soundEffects, setSoundEffects] = useState(true)
    const [dailyReminders, setDailyReminders] = useState(true)
    const [isUpdating, setIsUpdating] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const [learningStats, setLearningStats] = useState<UserSettings | null>(null)

    // ─── Đổi mật khẩu state ───────────────────────────────────────────────────
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showOld, setShowOld] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [isChangingPwd, setIsChangingPwd] = useState(false)
    const [pwdMessage, setPwdMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    const userLevel = user?.coins != null ? Math.floor(user.coins / 500) + 1 : 1
    const totalPoints = user?.coins ?? 0

    const timeLearningTotal = learningStats ? +(learningStats.totalStudyMinutes / 60).toFixed(1) : 0
    const timeLearningThisWeek = learningStats ? +(learningStats.weeklyStudyMinutes / 60).toFixed(1) : 0
    const timeLearningProgress = learningStats && learningStats.weeklyGoalMinutes > 0
        ? Math.min(100, Math.round((learningStats.weeklyStudyMinutes / learningStats.weeklyGoalMinutes) * 100))
        : 0

    useEffect(() => {
        if (!user) return

        setFullName(user.fullName || '')
        setSelectedAvatarUrl(user.avatarUrl || AVATARS[0].url)

        // Load settings + learning stats
        userApi.getSettings()
            .then((settings) => {
                setLearningStats(settings)
                if (settings.soundEffectsEnabled != null) {
                    setSoundEffects(settings.soundEffectsEnabled)
                }
                if (settings.dailyRemindersEnabled != null) {
                    setDailyReminders(settings.dailyRemindersEnabled)
                }
            })
            .catch(() => {
                // giữ UI mặc định, không chặn trang
            })
    }, [user])

    const handleSaveChanges = async () => {
        if (!user) return
        setIsUpdating(true)
        setMessage(null)
        try {
            const [updatedUser, updatedSettings] = await Promise.all([
                userApi.updateProfile(fullName, selectedAvatarUrl),
                userApi.updateSettings({
                    soundEffectsEnabled: soundEffects,
                    dailyRemindersEnabled: dailyReminders,
                }),
            ])
            setUser(updatedUser as User)
            setLearningStats(updatedSettings)
            setMessage({ type: 'success', text: t('settings.saved') })
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.message || t('settings.saveError') })
        } finally {
            setIsUpdating(false)
        }
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            setPwdMessage({ type: 'error', text: t('settings.passwordsNotMatch') })
            return
        }
        setIsChangingPwd(true)
        setPwdMessage(null)
        try {
            await userApi.changePassword(oldPassword, newPassword, confirmPassword)
            setPwdMessage({ type: 'success', text: t('settings.changePasswordSuccess') })
            setOldPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (err: any) {
            setPwdMessage({ type: 'error', text: err.response?.data?.message || t('settings.oldPasswordError') })
        } finally {
            setIsChangingPwd(false)
        }
    }

    // Màn hình gốc cho Teacher/Admin - chỉ cài đặt giao diện
    if (!isStudent) {
        return (
            <div className="p-6 lg:p-8 space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('settings.title')}</h1>
                    <p className="mt-1 text-slate-600 dark:text-slate-400">{t('settings.subtitle')}</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6">
                    <div className="lg:w-56 shrink-0">
                        <nav className="flex lg:flex-col gap-1">
                            <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium bg-primary-500/10 text-primary-500">
                                <Palette className="w-4 h-4" />
                                {t('settings.interface')}
                            </div>
                        </nav>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h2 className="text-lg font-semibold mb-5 text-slate-900 dark:text-white">{t('settings.interface')}</h2>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-slate-900 dark:text-white">{t('settings.darkMode')}</p>
                                    <p className="text-sm mt-0.5 text-slate-500 dark:text-slate-400">
                                        {t(isDark ? 'settings.darkModeOn' : 'settings.darkModeOff')}
                                    </p>
                                </div>
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Màn hình "My Profile & Settings" cho Student - thiết kế stitch student_profile_settings
    if (!user) return null

    return (
        <div className="w-full px-6 py-8">
            <div className="mx-auto max-w-5xl space-y-8">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-2">
                            {t('settings.profileSettings')}
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400">
                            {t('settings.customizeExperience')}
                        </p>
                    </div>
                    <button
                        onClick={handleSaveChanges}
                        disabled={isUpdating}
                        className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-bold text-base transition-all shadow-lg shadow-primary-500/30 flex items-center gap-2 disabled:opacity-50"
                    >
                        {isUpdating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        {t('settings.saveChanges')}
                    </button>
                </div>

                {message && (
                    <div className={`p-4 rounded-xl border ${
                        message.type === 'success'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                            : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
                    }`}>
                        {message.text}
                    </div>
                )}

                {/* Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Avatar & Main Profile */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Profile Card */}
                        <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8">
                            <div className="relative group">
                                <div
                                    className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden ring-8 ring-slate-100 dark:ring-slate-900 shadow-xl bg-slate-100 dark:bg-slate-700"
                                    style={{ backgroundImage: selectedAvatarUrl ? `url('${selectedAvatarUrl}')` : undefined, backgroundSize: 'cover', backgroundPosition: 'center' }}
                                >
                                    {selectedAvatarUrl && (
                                        <img src={selectedAvatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    )}
                                </div>
                                <button
                                    type="button"
                                    className="absolute bottom-2 right-2 bg-primary-500 text-white p-2 rounded-full hover:scale-110 transition-transform shadow-lg"
                                    title={t('settings.changeAvatar')}
                                >
                                    <Camera className="w-5 h-5" strokeWidth={2} />
                                </button>
                            </div>
                            <div className="flex-1 w-full text-center md:text-left space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">{t('settings.displayName')}</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-lg font-bold text-slate-900 dark:text-white focus:border-primary-500 focus:ring-primary-500/20 focus:outline-none transition-colors"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                                            ✏️
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                                        <p className="text-blue-600 dark:text-blue-400 text-sm font-bold mb-1">{t('settings.currentLevel')}</p>
                                        <p className="text-2xl font-black text-slate-900 dark:text-white">{t('dashboard.level')} {userLevel}</p>
                                    </div>
                                    <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-100 dark:border-amber-800/30">
                                        <p className="text-amber-600 dark:text-amber-400 text-sm font-bold mb-1">{t('settings.totalPoints')}</p>
                                        <p className="text-2xl font-black text-slate-900 dark:text-white">{totalPoints.toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Avatar Selection */}
                        <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-3xl">😊</span>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{t('settings.selectAvatar')}</h3>
                            </div>
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                {AVATARS.map((avatar) => (
                                    <button
                                        key={avatar.id}
                                        type="button"
                                        onClick={() => setSelectedAvatarUrl(avatar.url)}
                                        className={`relative aspect-square rounded-xl overflow-hidden transition-all ${
                                            selectedAvatarUrl === avatar.url
                                                ? 'ring-4 ring-primary-500 ring-offset-2 ring-offset-white dark:ring-offset-slate-900'
                                                : 'hover:ring-4 hover:ring-primary-500/50 hover:ring-offset-2 grayscale hover:grayscale-0'
                                        }`}
                                    >
                                        <img
                                            src={avatar.url}
                                            alt={avatar.name}
                                            className="w-full h-full object-cover"
                                        />
                                        {selectedAvatarUrl === avatar.url && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-primary-500/20">
                                                <Check className="w-8 h-8 text-white drop-shadow-md" strokeWidth={3} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Change Password Card */}
                        <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-red-500/10 rounded-xl text-red-500">
                                    <Lock className="w-6 h-6" strokeWidth={2} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{t('settings.changePassword')}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{t('settings.protectAccount')}</p>
                                </div>
                            </div>

                            {pwdMessage && (
                                <div className={`mb-4 p-3 rounded-xl border text-sm ${
                                    pwdMessage.type === 'success'
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                                        : 'bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400'
                                }`}>
                                    {pwdMessage.text}
                                </div>
                            )}

                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">{t('settings.currentPassword')}</label>
                                    <div className="relative">
                                        <input
                                            type={showOld ? 'text' : 'password'}
                                            value={oldPassword}
                                            onChange={e => setOldPassword(e.target.value)}
                                            required
                                            className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-primary-500 focus:ring-primary-500/20 focus:outline-none transition-colors pr-10"
                                            placeholder={t('settings.currentPassword')}
                                        />
                                        <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">{t('settings.newPassword')}</label>
                                    <div className="relative">
                                        <input
                                            type={showNew ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={e => setNewPassword(e.target.value)}
                                            required
                                            minLength={6}
                                            className="w-full bg-slate-50 dark:bg-slate-900/50 border-2 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:border-primary-500 focus:ring-primary-500/20 focus:outline-none transition-colors pr-10"
                                            placeholder={t('settings.atLeastChars')}
                                        />
                                        <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-500 dark:text-slate-400 mb-1">{t('settings.confirmNewPassword')}</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirm ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={e => setConfirmPassword(e.target.value)}
                                            required
                                            className={`w-full bg-slate-50 dark:bg-slate-900/50 border-2 rounded-xl px-4 py-3 text-slate-900 dark:text-white focus:outline-none transition-colors pr-10 ${
                                                confirmPassword && confirmPassword !== newPassword
                                                    ? 'border-red-400 focus:border-red-400'
                                                    : confirmPassword && confirmPassword === newPassword
                                                    ? 'border-emerald-400 focus:border-emerald-400'
                                                    : 'border-slate-200 dark:border-slate-700 focus:border-primary-500'
                                            }`}
                                            placeholder={t('settings.confirmNewPassword')}
                                        />
                                        <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {confirmPassword && confirmPassword !== newPassword && (
                                        <p className="text-xs text-red-500 mt-1">{t('settings.passwordsNotMatch')}</p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isChangingPwd || !oldPassword || !newPassword || !confirmPassword}
                                    className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-6 py-3 rounded-xl font-bold text-base transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                                >
                                    {isChangingPwd ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                                    {isChangingPwd ? t('common.loading') : t('settings.confirmPasswordChange')}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Preferences & Time Learning */}
                    <div className="space-y-8">
                        {/* Preferences */}
                        <div className="bg-white dark:bg-slate-800/50 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-primary-500/10 rounded-xl text-primary-500">
                                    <Palette className="w-6 h-6" strokeWidth={2} />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{t('settings.preferences')}</h3>
                            </div>
                            <div className="space-y-6">
                                <div className="flex items-center justify-between cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                                            <Volume2 className="w-5 h-5" strokeWidth={2} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-lg text-slate-900 dark:text-white">{t('settings.soundEffects')}</span>
                                            <span className="text-sm text-slate-500 dark:text-slate-400">{t('settings.playSoundCorrect')}</span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setSoundEffects(!soundEffects)}
                                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                                            soundEffects ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'
                                        }`}
                                    >
                                        <span className={`inline-block size-6 transform rounded-full bg-white shadow-md transition-transform ${
                                            soundEffects ? 'translate-x-7' : 'translate-x-1'
                                        }`} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
                                            <Bell className="w-5 h-5" strokeWidth={2} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-lg text-slate-900 dark:text-white">{t('settings.dailyReminders')}</span>
                                            <span className="text-sm text-slate-500 dark:text-slate-400">{t('settings.receiveNotifications')}</span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setDailyReminders(!dailyReminders)}
                                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                                            dailyReminders ? 'bg-primary-500' : 'bg-slate-200 dark:bg-slate-700'
                                        }`}
                                    >
                                        <span className={`inline-block size-6 transform rounded-full bg-white shadow-md transition-transform ${
                                            dailyReminders ? 'translate-x-7' : 'translate-x-1'
                                        }`} />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between cursor-pointer group">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                                            <Moon className="w-5 h-5" strokeWidth={2} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold text-lg text-slate-900 dark:text-white">{t('settings.darkMode')}</span>
                                            <span className="text-sm text-slate-500 dark:text-slate-400">{t('settings.easierOnEyes')}</span>
                                        </div>
                                    </div>
                                    <ThemeToggle />
                                </div>
                            </div>
                        </div>

                        {/* Time Learning */}
                        <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl p-8 text-white shadow-lg">
                            <div className="flex items-center gap-3 mb-6">
                                <Timer className="w-8 h-8" strokeWidth={2} />
                                <h3 className="text-2xl font-bold">{t('settings.learningTime')}</h3>
                            </div>
                            <div className="flex flex-col items-center justify-center py-4">
                                <div className="relative size-40">
                                    <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                                        <path
                                            className="text-white/20"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeDasharray="100, 100"
                                            strokeWidth="3"
                                        />
                                        <path
                                            className="text-white drop-shadow-md"
                                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeDasharray={`${timeLearningProgress}, 100`}
                                            strokeWidth="3"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-black">{timeLearningTotal}</span>
                                        <span className="text-sm font-medium opacity-90">{t('dashboard.hours')}</span>
                                    </div>
                                </div>
                                <p className="mt-4 text-center text-white/90 font-medium">
                                    {t('settings.greatJob', { name: user.fullName?.split(' ')[0] || t('common.you'), hours: timeLearningThisWeek })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
