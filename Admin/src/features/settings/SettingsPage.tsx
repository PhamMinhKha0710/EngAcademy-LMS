import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Shield, Building, Key, Save, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'sonner'
import type { ApiResponse, User as UserType } from '@/types/api'

export default function SettingsPage() {
    const [user, setUser] = useState<UserType | null>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [fullName, setFullName] = useState('')

    // Password state
    const [oldPassword, setOldPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [changingPassword, setChangingPassword] = useState(false)

    const fetchProfile = async () => {
        setLoading(true)
        try {
            const res = await api.get<ApiResponse<UserType>>('/users/me')
            const data = res.data.data
            setUser(data)
            setFullName(data.fullName || '')
        } catch {
            toast.error('Không thể tải thông tin cá nhân')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProfile()
    }, [])

    const handleUpdateProfile = async () => {
        setSubmitting(true)
        try {
            await api.patch(`/users/me?fullName=${encodeURIComponent(fullName)}`)
            toast.success('Cập nhật thông tin thành công')
            fetchProfile()
        } catch {
            toast.error('Cập nhật thông tin thất bại')
        } finally {
            setSubmitting(false)
        }
    }

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()

        if (newPassword !== confirmPassword) {
            toast.error('Mật khẩu xác nhận không khớp')
            return
        }

        if (newPassword.length < 6) {
            toast.error('Mật khẩu mới phải có ít nhất 6 ký tự')
            return
        }

        setChangingPassword(true)
        try {
            await api.patch('/users/me/password', {
                oldPassword,
                newPassword,
                confirmPassword
            })
            toast.success('Đổi mật khẩu thành công')
            setOldPassword('')
            setNewPassword('')
            setConfirmPassword('')
        } catch (error: any) {
            const message = error.response?.data?.message || 'Đổi mật khẩu thất bại'
            toast.error(message)
        } finally {
            setChangingPassword(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Cài đặt tài khoản</h1>
                <p className="text-muted-foreground mt-1">
                    Quản lý thông tin cá nhân và cài đặt bảo mật của bạn
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Profile Information */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <User className="h-5 w-5 text-primary" />
                            Thông tin cá nhân
                        </CardTitle>
                        <CardDescription>Cập nhật họ tên và các thông tin cơ bản</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="username">Tên đăng nhập</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input id="username" value={user?.username || ''} disabled className="pl-9 bg-muted" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input id="email" value={user?.email || ''} disabled className="pl-9 bg-muted" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Họ và tên</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="fullName"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Nhập họ tên đầy đủ"
                                    className="pl-9"
                                />
                            </div>
                        </div>
                        <Button
                            className="w-full gap-2"
                            onClick={handleUpdateProfile}
                            disabled={submitting || fullName === user?.fullName}
                        >
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Lưu thay đổi
                        </Button>
                    </CardContent>
                </Card>

                {/* Account Details & Security */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Shield className="h-5 w-5 text-primary" />
                                Quyền hạn & Đơn vị
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                                <Shield className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Vai trò hệ thống</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {user?.roles.map(role => (
                                            <Badge key={role} variant="secondary">{role}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {user?.schoolId && (
                                <div className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                                    <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div>
                                        <p className="text-sm font-medium">Trường học liên kết</p>
                                        <p className="text-sm text-muted-foreground font-semibold text-primary">
                                            {user.schoolName || 'Chu Van An High School'}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-0.5">ID: {user.schoolId}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Key className="h-5 w-5 text-primary" />
                                Đổi mật khẩu
                            </CardTitle>
                            <CardDescription>Bảo vệ tài khoản của bạn bằng mật khẩu mạnh</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handlePasswordChange} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="oldPassword">Mật khẩu cũ</Label>
                                    <Input
                                        id="oldPassword"
                                        type="password"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">Mật khẩu mới</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full gap-2"
                                    disabled={changingPassword || !oldPassword || !newPassword || !confirmPassword}
                                >
                                    {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                                    Thay đổi mật khẩu
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
