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
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Cài đặt tài khoản</h1>
                    <p className="text-muted-foreground mt-2 font-medium">Quản lý thông tin cá nhân và cấu hình bảo mật.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Profile Information */}
                <Card className="premium-card border-none shadow-xl dark:shadow-none overflow-hidden h-fit">
                    <CardHeader className="p-8 pb-4">
                        <CardTitle className="text-xl font-black flex items-center gap-2">
                            <User className="h-6 w-6 text-primary" />
                            Thông tin cá nhân
                        </CardTitle>
                        <CardDescription className="text-muted-foreground font-medium">Cập nhật họ tên và các thông tin cơ bản</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 pt-0 space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Tên đăng nhập</Label>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                <Input id="username" value={user?.username || ''} disabled className="h-11 pl-10 bg-muted/30 border-border/50 rounded-xl font-bold text-muted-foreground/60 cursor-not-allowed" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Địa chỉ Email</Label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                <Input id="email" value={user?.email || ''} disabled className="h-11 pl-10 bg-muted/30 border-border/50 rounded-xl font-bold text-muted-foreground/60 cursor-not-allowed" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Họ và tên hiển thị</Label>
                            <div className="relative group">
                                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                <Input
                                    id="fullName"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Nhập họ tên đầy đủ"
                                    className="h-11 pl-10 bg-muted/30 border-border/50 rounded-xl focus-visible:ring-primary/20 font-bold"
                                />
                            </div>
                        </div>
                        <Button
                            className="w-full h-11 rounded-xl font-black bg-primary shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99] gap-2"
                            onClick={handleUpdateProfile}
                            disabled={submitting || fullName === user?.fullName}
                        >
                            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            LƯU THÔNG TIN
                        </Button>
                    </CardContent>
                </Card>

                {/* Account Details & Security */}
                <div className="space-y-6">
                    <Card className="premium-card border-none shadow-xl dark:shadow-none overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-black flex items-center gap-2">
                                <Shield className="h-6 w-6 text-primary" />
                                Quyền hạn hệ thống
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-4">
                            <div className="flex items-start gap-4 p-5 rounded-2xl border border-border/40 bg-muted/20">
                                <Shield className="h-5 w-5 text-primary mt-1" />
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 mb-2">Vai trò hiện tại</p>
                                    <div className="flex flex-wrap gap-2">
                                        {user?.roles.map(role => (
                                            <Badge key={role} className="bg-primary/10 text-primary border-none font-bold uppercase tracking-wider text-[10px] h-6">{role}</Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {user?.schoolId && (
                                <div className="flex items-start gap-4 p-5 rounded-2xl border border-border/40 bg-muted/20">
                                    <Building className="h-5 w-5 text-primary mt-1" />
                                    <div>
                                        <p className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Cơ sở giáo dục</p>
                                        <p className="font-black text-foreground">
                                            {user.schoolName || 'Chu Van An High School'}
                                        </p>
                                        <p className="text-[10px] font-bold text-muted-foreground/40 mt-1 uppercase tracking-tighter">Mã định danh: {user.schoolId}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="premium-card border-none shadow-xl dark:shadow-none overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-black flex items-center gap-2">
                                <Key className="h-6 w-6 text-primary" />
                                Bảo mật tài khoản
                            </CardTitle>
                            <CardDescription className="text-muted-foreground font-medium">Cập nhật mật khẩu định kỳ để bảo vệ tài khoản</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-0">
                            <form onSubmit={handlePasswordChange} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="oldPassword" className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Mật khẩu hiện tại</Label>
                                    <Input
                                        id="oldPassword"
                                        type="password"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="h-11 bg-muted/30 border-border/50 rounded-xl focus-visible:ring-primary/20 font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword" className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Mật khẩu mới</Label>
                                    <Input
                                        id="newPassword"
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="h-11 bg-muted/30 border-border/50 rounded-xl focus-visible:ring-primary/20 font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword" className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Xác nhận mật khẩu mới</Label>
                                    <Input
                                        id="confirmPassword"
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="h-11 bg-muted/30 border-border/50 rounded-xl focus-visible:ring-primary/20 font-bold"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-11 rounded-xl font-black bg-primary shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99] gap-2"
                                    disabled={changingPassword || !oldPassword || !newPassword || !confirmPassword}
                                >
                                    {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                                    ĐỔI MẬT KHẨU
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
