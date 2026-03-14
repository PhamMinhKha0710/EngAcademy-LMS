import { useState, useEffect } from 'react'
import { useAuthStore, User } from '../store/authStore'
import { userApi } from '../services/api/userApi'
import { User as UserIcon, Mail, Shield, Key, Coins, Flame, Save, Loader2, Camera } from 'lucide-react'

export default function Profile() {
    const { user, setUser } = useAuthStore()
    const [fullName, setFullName] = useState('')
    const [avatarUrl, setAvatarUrl] = useState('')

    // Đổi mật khẩu
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const [isUpdating, setIsUpdating] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    useEffect(() => {
        if (user) {
            setFullName(user.fullName || '')
            setAvatarUrl(user.avatarUrl || '')
        }
    }, [user])

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsUpdating(true)
        setMessage({ type: '', text: '' })
        try {
            const updatedUser = await userApi.updateProfile(fullName, avatarUrl)
            setUser(updatedUser as User)
            setMessage({ type: 'success', text: 'Cập nhật hồ sơ thành công!' })
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.' })
        } finally {
            setIsUpdating(false)
        }
    }

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Mật khẩu xác nhận không khớp.' })
            return
        }
        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' })
            return
        }

        setIsUpdating(true)
        setMessage({ type: '', text: '' })
        try {
            await userApi.changePassword(currentPassword, newPassword, confirmPassword)
            setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' })
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (err: any) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu.' })
        } finally {
            setIsUpdating(false)
        }
    }

    if (!user) return null

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold mb-8" style={{ color: 'var(--color-text)' }}>Hồ sơ cá nhân</h1>

            {message.text && (
                <div className={`mb-6 p-4 rounded-xl border ${message.type === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                    : 'bg-red-500/10 border-red-500/30 text-red-500'
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cột trái: Thông tin tổng quan */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="card p-6 flex flex-col items-center text-center">
                        <div className="relative mb-4">
                            <img
                                src={user.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.username}
                                alt={user.username}
                                className="w-32 h-32 rounded-full border-4 border-blue-500/20 object-cover"
                            />
                            <button className="absolute bottom-1 right-1 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors shadow-lg">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>
                        <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>{user.fullName}</h2>
                        <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>@{user.username}</p>

                        <div className="flex items-center gap-4 w-full pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
                            <div className="flex-1">
                                <p className="text-xs uppercase font-bold tracking-wider mb-1" style={{ color: 'var(--color-text-secondary)' }}>Số xu</p>
                                <div className="flex items-center justify-center gap-1">
                                    <Coins className="w-4 h-4 text-yellow-500" />
                                    <span className="font-bold" style={{ color: 'var(--color-text)' }}>{user.coins || 0}</span>
                                </div>
                            </div>
                            <div className="w-px h-8 bg-border" style={{ backgroundColor: 'var(--color-border)' }} />
                            <div className="flex-1">
                                <p className="text-xs uppercase font-bold tracking-wider mb-1" style={{ color: 'var(--color-text-secondary)' }}>Chuỗi ngày</p>
                                <div className="flex items-center justify-center gap-1">
                                    <Flame className="w-4 h-4 text-orange-500" />
                                    <span className="font-bold" style={{ color: 'var(--color-text)' }}>{user.streakDays || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="card p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-blue-500" />
                            <div className="text-left">
                                <p className="text-xs uppercase font-bold" style={{ color: 'var(--color-text-secondary)' }}>Vai trò</p>
                                <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                                    {user.roles.map(r => r.replace('ROLE_', '')).join(', ')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-blue-500" />
                            <div className="text-left">
                                <p className="text-xs uppercase font-bold" style={{ color: 'var(--color-text-secondary)' }}>Email</p>
                                <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{user.email}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cột phải: Form chỉnh sửa */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Phần chỉnh sửa Profile */}
                    <div className="card p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <UserIcon className="w-5 h-5 text-blue-500" />
                            <h3 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Thông tin cá nhân</h3>
                        </div>
                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                                        Họ và tên
                                    </label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="input-field"
                                        placeholder="Tên của bạn"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                                        URL Ảnh đại diện
                                    </label>
                                    <input
                                        type="text"
                                        value={avatarUrl}
                                        onChange={(e) => setAvatarUrl(e.target.value)}
                                        className="input-field"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={isUpdating}
                                className="btn-primary inline-flex items-center gap-2"
                            >
                                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Lưu thay đổi
                            </button>
                        </form>
                    </div>

                    {/* Phần đổi mật khẩu */}
                    <div className="card p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <Key className="w-5 h-5 text-blue-500" />
                            <h3 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Đổi mật khẩu</h3>

                        </div>
                        <form onSubmit={handleChangePassword} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                                    Mật khẩu hiện tại
                                </label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="input-field"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                                        Mật khẩu mới
                                    </label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="input-field"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                                        Xác nhận mật khẩu mới
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="input-field"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                className="btn-primary inline-flex items-center gap-2"
                            >
                                <Key className="w-4 h-4" />
                                Đổi mật khẩu
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
