import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { User, Shield, Building, Key, Save, Loader2, History, Monitor, Globe, Clock, Activity } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'sonner'
import type { ApiResponse, User as UserType } from '@/types/api'
import { cn } from '@/lib/utils'

interface AuditLogResponse {
    id: number
    action: string
    details: string
    ipAddress: string
    userAgent: string
    createdAt: string
}

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

    // Audit logs state
    const [auditLogs, setAuditLogs] = useState<AuditLogResponse[]>([])
    const [loadingLogs, setLoadingLogs] = useState(false)

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

    const fetchLogs = async () => {
        setLoadingLogs(true)
        try {
            const res = await api.get<ApiResponse<AuditLogResponse[]>>('/users/me/audit-logs')
            setAuditLogs(res.data.data)
        } catch {
            console.error('Failed to fetch audit logs')
        } finally {
            setLoadingLogs(false)
        }
    }

    useEffect(() => {
        fetchProfile()
        fetchLogs()
    }, [])

    const handleUpdateProfile = async () => {
        setSubmitting(true)
        try {
            await api.patch(`/users/me?fullName=${encodeURIComponent(fullName)}`)
            toast.success('Cập nhật thông tin thành công')
            fetchProfile()
            fetchLogs() // Refresh logs to see the update action
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
            fetchLogs() // Refresh logs
        } catch (error: any) {
            const message = error.response?.data?.message || 'Đổi mật khẩu thất bại'
            toast.error(message)
        } finally {
            setChangingPassword(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <div className="h-10 w-10 border-4 border-primary/20 border-t-primary animate-spin rounded-full" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Đang đồng bộ cấu hình...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black tracking-tight uppercase">Thiết lập hệ thống</h1>
                <p className="text-muted-foreground font-medium">Quản lý hồ sơ cá nhân và theo dõi bảo mật tài khoản.</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
                {/* Left Column: Profile & Security Form */}
                <div className="lg:col-span-7 space-y-8">
                    {/* Profile Card */}
                    <Card className="premium-card border-none shadow-xl dark:shadow-none overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-black flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                                Thông tin cơ bản
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Tên đăng nhập</Label>
                                    <Input value={user?.username || ''} disabled className="h-12 bg-muted/30 border-border/50 rounded-xl font-bold text-muted-foreground/40 cursor-not-allowed" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Địa chỉ Email</Label>
                                    <Input value={user?.email || ''} disabled className="h-12 bg-muted/30 border-border/50 rounded-xl font-bold text-muted-foreground/40 cursor-not-allowed" />
                                </div>
                            </div>
                            <div className="space-y-2 text-xs">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Họ và tên hiển thị</Label>
                                <Input
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Nhập họ tên đầy đủ"
                                    className="h-12 bg-muted/20 border-border/50 rounded-xl focus-visible:ring-primary/20 font-bold"
                                />
                            </div>
                            <Button
                                className="w-full h-12 rounded-xl font-black bg-primary shadow-lg shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99] gap-2"
                                onClick={handleUpdateProfile}
                                disabled={submitting || fullName === user?.fullName}
                            >
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                CẬP NHẬT HỒ SƠ
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Change Password Card */}
                    <Card className="premium-card border-none shadow-xl dark:shadow-none overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-black flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                    <Key className="h-5 w-5 text-amber-600" />
                                </div>
                                Bảo mật & Mật khẩu
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0">
                            <form onSubmit={handlePasswordChange} className="space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Mật khẩu hiện tại</Label>
                                    <Input
                                        type="password"
                                        value={oldPassword}
                                        onChange={(e) => setOldPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                        className="h-12 bg-muted/20 border-border/50 rounded-xl focus-visible:ring-primary/20 font-bold"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Mật khẩu mới</Label>
                                        <Input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            className="h-12 bg-muted/20 border-border/50 rounded-xl focus-visible:ring-primary/20 font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Xác nhận mật khẩu</Label>
                                        <Input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                            required
                                            className="h-12 bg-muted/20 border-border/50 rounded-xl focus-visible:ring-primary/20 font-bold"
                                        />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full h-12 rounded-xl font-black bg-slate-900 shadow-xl shadow-slate-200 dark:shadow-none transition-all hover:bg-slate-800 gap-2"
                                    disabled={changingPassword || !oldPassword || !newPassword || !confirmPassword}
                                >
                                    {changingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                                    THAY ĐỔI MẬT KHẨU
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Roles & Audit Logs */}
                <div className="lg:col-span-5 space-y-8">
                    {/* Permissions Card */}
                    <Card className="premium-card border-none shadow-xl dark:shadow-none overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="text-xl font-black flex items-center gap-3 text-primary">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Shield className="h-5 w-5 text-primary" />
                                </div>
                                Phân quyền
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 space-y-5">
                            <div className="flex flex-wrap gap-2">
                                {user?.roles.map(role => (
                                    <Badge key={role} className="bg-primary/5 text-primary border-primary/10 font-bold uppercase tracking-widest text-[9px] h-7 px-3">{role}</Badge>
                                ))}
                            </div>
                            {user?.schoolId && (
                                <div className="flex items-center gap-4 p-4 rounded-2xl border border-border/30 bg-muted/10">
                                    <Building className="h-5 w-5 text-muted-foreground/40" />
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">Cơ quan quản lý</p>
                                        <p className="font-bold text-foreground">{user.schoolName || 'Chu Van An High School'}</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Audit Logs Card */}
                    <Card className="premium-card border-none shadow-xl dark:shadow-none overflow-hidden flex-1 flex flex-col max-h-[600px]">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl font-black flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                                        <History className="h-5 w-5 text-violet-600" />
                                    </div>
                                    Hoạt động gần đây
                                </CardTitle>
                                <Button variant="ghost" size="icon" onClick={fetchLogs} disabled={loadingLogs} className="rounded-xl h-9 w-9 text-muted-foreground/40 hover:text-primary transition-all">
                                    <Activity className={cn("h-4 w-4", loadingLogs && "animate-spin")} />
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 overflow-y-auto flex-1 custom-scrollbar">
                            <div className="space-y-4">
                                {auditLogs.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground/30 font-bold text-xs uppercase tracking-widest">Chưa có nhật ký hoạt động</div>
                                ) : (
                                    auditLogs.map((log) => (
                                        <div key={log.id} className="relative pl-6 pb-6 border-l-2 border-muted last:pb-0">
                                            <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-muted border-4 border-white shadow-sm" />
                                            <div className="bg-muted/20 p-4 rounded-2xl border border-border/30 hover:border-primary/20 transition-all group">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className={cn(
                                                        "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                                                        log.action.includes('LOGIN') ? 'bg-emerald-500/10 text-emerald-600' : 'bg-primary/10 text-primary'
                                                    )}>
                                                        {log.action}
                                                    </span>
                                                    <span className="text-[10px] font-black text-muted-foreground/20 flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        {new Date(log.createdAt).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="text-xs font-bold text-foreground leading-relaxed mb-2">{log.details}</p>
                                                <div className="flex flex-col gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                                    <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-tighter text-muted-foreground">
                                                        <Globe className="h-2.5 w-2.5" /> {log.ipAddress}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-tighter text-muted-foreground truncate max-w-[200px]">
                                                        <Monitor className="h-2.5 w-2.5" /> {log.userAgent}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
