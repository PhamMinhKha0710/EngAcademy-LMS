import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useThemeStore } from '../store/themeStore'
import api from '../services/api/axios'
import ThemeToggle from '../components/ui/ThemeToggle'
import Badge from '../components/ui/Badge'
import {
    User,
    Palette,
    Shield,
    Loader2,
    CheckCircle,
    Coins,
    Flame,
    Save,
} from 'lucide-react'

type Tab = 'profile' | 'theme'

export default function SettingsPage() {
    const { user, fetchCurrentUser } = useAuthStore()
    const { isDark } = useThemeStore()

    const [activeTab, setActiveTab] = useState<Tab>('profile')

    // Profile form
    const [fullName, setFullName] = useState(user?.fullName || '')
    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '')
    const [saving, setSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)

    const handleProfileSave = async () => {
        setSaving(true)
        setSaveSuccess(false)
        setSaveError(null)
        try {
            await api.patch('/users/me', {
                fullName: fullName.trim(),
                avatarUrl: avatarUrl.trim() || undefined,
            })
            await fetchCurrentUser()
            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 3000)
        } catch {
            setSaveError('Cập nhật thất bại. Vui lòng thử lại.')
        } finally {
            setSaving(false)
        }
    }

    const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
        { key: 'profile', label: 'Hồ sơ', icon: <User className="w-4 h-4" /> },
        { key: 'theme', label: 'Giao diện', icon: <Palette className="w-4 h-4" /> },
    ]

    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                    Cài đặt
                </h1>
                <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Quản lý hồ sơ và tùy chỉnh giao diện
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar tabs */}
                <div className="lg:w-56 shrink-0">
                    <nav className="flex lg:flex-col gap-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                                    activeTab === tab.key
                                        ? 'bg-blue-600/15 text-blue-400'
                                        : 'hover:bg-slate-700/30'
                                }`}
                                style={{
                                    color: activeTab === tab.key ? undefined : 'var(--color-text-secondary)',
                                }}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className="space-y-6">
                            {/* Profile form card */}
                            <div className="card p-6">
                                <h2 className="text-lg font-semibold mb-5" style={{ color: 'var(--color-text)' }}>
                                    Thông tin hồ sơ
                                </h2>

                                {/* Avatar preview */}
                                <div className="flex items-center gap-4 mb-6">
                                    <div
                                        className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden"
                                        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                                    >
                                        {avatarUrl ? (
                                            <img
                                                src={avatarUrl}
                                                alt="Avatar"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    ;(e.target as HTMLImageElement).style.display = 'none'
                                                }}
                                            />
                                        ) : (
                                            <User className="w-8 h-8 text-slate-400" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium" style={{ color: 'var(--color-text)' }}>
                                            {user?.fullName || user?.username}
                                        </p>
                                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                            @{user?.username}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                                            Họ và tên
                                        </label>
                                        <input
                                            type="text"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
                                            style={{
                                                backgroundColor: 'var(--color-bg-secondary)',
                                                borderColor: 'var(--color-bg-secondary)',
                                                color: 'var(--color-text)',
                                            }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                                            URL ảnh đại diện
                                        </label>
                                        <input
                                            type="url"
                                            value={avatarUrl}
                                            onChange={(e) => setAvatarUrl(e.target.value)}
                                            placeholder="https://..."
                                            className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
                                            style={{
                                                backgroundColor: 'var(--color-bg-secondary)',
                                                borderColor: 'var(--color-bg-secondary)',
                                                color: 'var(--color-text)',
                                            }}
                                        />
                                    </div>

                                    {saveError && (
                                        <p className="text-sm text-red-400">{saveError}</p>
                                    )}
                                    {saveSuccess && (
                                        <p className="text-sm text-emerald-400 flex items-center gap-1.5">
                                            <CheckCircle className="w-4 h-4" />
                                            Cập nhật thành công!
                                        </p>
                                    )}

                                    <button
                                        onClick={handleProfileSave}
                                        disabled={saving || !fullName.trim()}
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        {saving ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4" />
                                        )}
                                        Lưu thay đổi
                                    </button>
                                </div>
                            </div>

                            {/* Account info card */}
                            <div className="card p-6">
                                <h2 className="text-lg font-semibold mb-5 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                                    <Shield className="w-5 h-5" />
                                    Thông tin tài khoản
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                            Tên đăng nhập
                                        </span>
                                        <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                                            {user?.username}
                                        </span>
                                    </div>
                                    <div
                                        className="border-t"
                                        style={{ borderColor: 'var(--color-bg-secondary)' }}
                                    />
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                            Email
                                        </span>
                                        <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                                            {user?.email}
                                        </span>
                                    </div>
                                    <div
                                        className="border-t"
                                        style={{ borderColor: 'var(--color-bg-secondary)' }}
                                    />
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                            Vai trò
                                        </span>
                                        <div className="flex gap-1.5">
                                            {user?.roles?.map((role) => (
                                                <Badge
                                                    key={role}
                                                    variant={role === 'ROLE_ADMIN' ? 'danger' : role === 'ROLE_TEACHER' ? 'info' : 'success'}
                                                >
                                                    {role.replace('ROLE_', '')}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                    <div
                                        className="border-t"
                                        style={{ borderColor: 'var(--color-bg-secondary)' }}
                                    />
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-sm flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                                            <Coins className="w-4 h-4 text-yellow-400" />
                                            Xu
                                        </span>
                                        <span className="text-sm font-semibold text-yellow-400">
                                            {user?.coins ?? 0}
                                        </span>
                                    </div>
                                    <div
                                        className="border-t"
                                        style={{ borderColor: 'var(--color-bg-secondary)' }}
                                    />
                                    <div className="flex items-center justify-between py-2">
                                        <span className="text-sm flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                                            <Flame className="w-4 h-4 text-orange-400" />
                                            Chuỗi ngày
                                        </span>
                                        <span className="text-sm font-semibold text-orange-400">
                                            {user?.streakDays ?? 0} ngày
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Theme Tab */}
                    {activeTab === 'theme' && (
                        <div className="card p-6">
                            <h2 className="text-lg font-semibold mb-5" style={{ color: 'var(--color-text)' }}>
                                Giao diện
                            </h2>

                            <div className="space-y-6">
                                {/* Theme toggle */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium" style={{ color: 'var(--color-text)' }}>
                                            Chế độ tối
                                        </p>
                                        <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                                            {isDark ? 'Đang sử dụng giao diện tối' : 'Đang sử dụng giao diện sáng'}
                                        </p>
                                    </div>
                                    <ThemeToggle />
                                </div>

                                {/* Current theme info */}
                                <div
                                    className="border-t pt-6"
                                    style={{ borderColor: 'var(--color-bg-secondary)' }}
                                >
                                    <p className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                                        Xem trước màu sắc
                                    </p>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                        {[
                                            { label: 'Nền', var: '--color-bg' },
                                            { label: 'Nền phụ', var: '--color-bg-secondary' },
                                            { label: 'Chữ', var: '--color-text' },
                                            { label: 'Chữ phụ', var: '--color-text-secondary' },
                                        ].map((c) => (
                                            <div
                                                key={c.var}
                                                className="rounded-xl border p-3 text-center"
                                                style={{ borderColor: 'var(--color-bg-secondary)' }}
                                            >
                                                <div
                                                    className="w-8 h-8 rounded-lg mx-auto mb-2 border"
                                                    style={{
                                                        backgroundColor: `var(${c.var})`,
                                                        borderColor: 'var(--color-bg-secondary)',
                                                    }}
                                                />
                                                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                                    {c.label}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
