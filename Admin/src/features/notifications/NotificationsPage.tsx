import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bell, Send, Search, Loader2, History, MessageSquare, Trash, CheckCircle, Clock, Globe } from 'lucide-react'
import { UserSelect } from '@/components/common/UserSelect'
import { AxiosError } from 'axios'
import api from '@/lib/api'
import type { ApiResponse, Notification, School as SchoolType, ClassRoom } from '@/types/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function getErrorMessage(error: unknown, fallback: string): string {
    return error instanceof AxiosError && error.response?.data?.message
        ? String(error.response.data.message)
        : fallback
}

export default function NotificationsPage() {
    // Mode toggle
    const [mode, setMode] = useState<'direct' | 'broadcast'>('direct')
    
    // Broadcast state
    // Broadcast state
    const [broadcastScope, setBroadcastScope] = useState<'ALL' | 'ROLE' | 'SCHOOL' | 'CLASS' | 'SYSTEM'>('ALL')
    const [targetRole, setTargetRole] = useState('')
    const [targetSchoolId, setTargetSchoolId] = useState<number | null>(null)
    const [targetClassId, setTargetClassId] = useState<number | null>(null)
    
    // Dropdown data
    const [schools, setSchools] = useState<SchoolType[]>([])
    const [classes, setClasses] = useState<ClassRoom[]>([])

    // Form state
    const [sendUserId, setSendUserId] = useState('')
    const [sendTitle, setSendTitle] = useState('')
    const [sendMessage, setSendMessage] = useState('')
    const [sendImageUrl, setSendImageUrl] = useState('')
    const [sending, setSending] = useState(false)

    // View notifications state
    const [viewUserId, setViewUserId] = useState('')
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loadingNotifications, setLoadingNotifications] = useState(false)
    const [hasLoaded, setHasLoaded] = useState(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [sRes, cRes] = await Promise.all([
                    api.get<ApiResponse<SchoolType[]>>('/schools'),
                    api.get<ApiResponse<any>>('/classes')
                ])
                setSchools(sRes.data.data)
                
                // Handle classes which might be paged or list
                const cData = cRes.data.data
                if (Array.isArray(cData)) setClasses(cData)
                else if (cData.content) setClasses(cData.content)
            } catch (err) {
                console.error('Failed to fetch dropdown data', err)
            }
        }
        fetchData()
    }, [])

    const resetForm = () => {
        setSendUserId('')
        setSendTitle('')
        setSendMessage('')
        setSendImageUrl('')
        setTargetRole('')
        setTargetSchoolId(null)
        setTargetClassId(null)
        setBroadcastScope('ALL')
    }

    const handleSendNotification = async () => {
        if (mode === 'broadcast') {
            handleBroadcast()
            return
        }

        if (!sendUserId.trim() || !sendTitle.trim() || !sendMessage.trim()) {
            toast.error('Vui lòng điền đầy đủ thông tin')
            return
        }
        setSending(true)
        try {
            await api.post(`/notifications/send/${sendUserId}`, null, {
                params: { 
                    title: sendTitle, 
                    message: sendMessage,
                    imageUrl: sendImageUrl.trim() || undefined
                }
            })
            toast.success('Gửi thông báo thành công!')
            resetForm()
            if (viewUserId === sendUserId) fetchNotifications()
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, 'Gửi thông báo thất bại'))
        } finally {
            setSending(false)
        }
    }

    const handleBroadcast = async () => {
        if (!sendTitle.trim() || !sendMessage.trim()) {
            toast.error('Vui lòng điền đủ tiêu đề và nội dung')
            return
        }

        if (broadcastScope === 'ROLE' && !targetRole) {
            toast.error('Vui lòng chọn vai trò mục tiêu')
            return
        }
        if (broadcastScope === 'SCHOOL' && !targetSchoolId) {
            toast.error('Vui lòng chọn trường mục tiêu')
            return
        }
        if (broadcastScope === 'CLASS' && !targetClassId) {
            toast.error('Vui lòng chọn lớp mục tiêu')
            return
        }

        setSending(true)
        try {
            await api.post('/notifications/broadcast', {
                scope: broadcastScope,
                targetRole: broadcastScope === 'ROLE' ? targetRole : null,
                schoolId: broadcastScope === 'SCHOOL' ? targetSchoolId : null,
                classId: broadcastScope === 'CLASS' ? targetClassId : null,
                title: sendTitle,
                message: sendMessage,
                imageUrl: sendImageUrl.trim() || null
            })
            toast.success('Gửi thông báo cụm thành công!')
            resetForm()
        } catch (error: unknown) {
             toast.error(getErrorMessage(error, 'Gửi thông báo cụm thất bại'))
        } finally {
            setSending(false)
        }
    }

    const fetchNotifications = async (userIdOverride?: string) => {
        const targetId = userIdOverride || viewUserId
        if (!targetId.trim()) {
            toast.error('Vui lòng chọn người dùng')
            return
        }
        setHasLoaded(true)
        setLoadingNotifications(true)
        try {
            const response = await api.get<ApiResponse<Notification[]>>(`/notifications/user/${targetId}`)
            setNotifications(response.data.data)
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, 'Không thể tải thông báo'))
            setNotifications([])
        } finally {
            setLoadingNotifications(false)
        }
    }

    const deleteNotification = async (id: number) => {
        try {
            await api.delete(`/notifications/${id}`)
            setNotifications((prev) => prev.filter((n) => n.id !== id))
            toast.success('Đã xóa thông báo')
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, 'Xóa thất bại'))
        }
    }

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—'
        try {
            const date = new Date(dateStr)
            return date.toLocaleString('vi-VN', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            })
        } catch { return dateStr }
    }

    const inputClasses = "h-12 rounded-xl bg-muted/20 border-border/50 focus-visible:ring-primary/20 font-bold"
    const selectClasses = "flex h-11 w-full rounded-xl border border-border/50 bg-muted/20 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black tracking-tight">Quản lý thông báo</h1>
                <p className="text-muted-foreground mt-2 font-medium">Hệ thống truyền thông trung tâm - Gửi tin nhắn cá nhân hoặc phát sóng diện rộng.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Compose */}
                <div className="lg:col-span-12 xl:col-span-5 space-y-6">
                    <Card className="premium-card border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                        <CardHeader className="p-8 pb-0">
                            <div className="flex bg-muted/30 p-1 rounded-2xl border border-border/50 mb-6">
                                <button 
                                    onClick={() => { setMode('direct'); resetForm() }}
                                    className={cn("flex-1 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all gap-2 flex items-center justify-center", mode === 'direct' ? "bg-white text-primary shadow-sm" : "text-muted-foreground/40 hover:text-foreground")}
                                >
                                    <Send className="h-4 w-4" /> Trực tiếp
                                </button>
                                <button 
                                    onClick={() => { setMode('broadcast'); resetForm() }}
                                    className={cn("flex-1 px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all gap-2 flex items-center justify-center", mode === 'broadcast' ? "bg-white text-primary shadow-sm" : "text-muted-foreground/40 hover:text-foreground")}
                                >
                                    <Globe className="h-4 w-4" /> Phát sóng
                                </button>
                            </div>
                            <CardTitle className="text-xl font-black">{mode === 'direct' ? 'Gửi tin nhắn trực tiếp' : 'Phát sóng thông báo'}</CardTitle>
                            <p className="text-muted-foreground text-sm font-medium">
                                {mode === 'direct' 
                                    ? 'Gửi thông báo riêng đến một người dùng cụ thể trên ứng dụng.' 
                                    : 'Gửi thông báo hàng loạt đến một nhóm người dùng mục tiêu.'}
                            </p>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            {mode === 'direct' ? (
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Người nhận (Cá nhân)</label>
                                    <UserSelect value={sendUserId} onSelect={setSendUserId} placeholder="Chọn người nhận..." />
                                </div>
                            ) : (
                                <div className="space-y-5 bg-primary/5 p-5 rounded-2xl border border-primary/10">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-primary/60 uppercase tracking-widest pl-1">Phạm vi phát sóng</label>
                                        <select 
                                            className={selectClasses}
                                            value={broadcastScope}
                                            onChange={(e) => setBroadcastScope(e.target.value as any)}
                                        >
                                            <option value="ALL">Toàn bộ hệ thống</option>
                                            <option value="SYSTEM">Cụm hệ thống (Tất cả trường)</option>
                                            <option value="ROLE">Theo vai trò người dùng</option>
                                            <option value="SCHOOL">Cụm trường học (GV & HS của trường)</option>
                                            <option value="CLASS">Cụm lớp học (GV & HS của lớp)</option>
                                        </select>
                                    </div>
                                    
                                    {broadcastScope === 'ROLE' && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                            <label className="text-[10px] font-black text-primary/60 uppercase tracking-widest pl-1">Chọn vai trò</label>
                                            <select className={selectClasses} value={targetRole} onChange={(e) => setTargetRole(e.target.value)}>
                                                <option value="">-- Chọn vai trò --</option>
                                                <option value="ROLE_ADMIN">Quản trị viên</option>
                                                <option value="ROLE_SCHOOL">Trường học</option>
                                                <option value="ROLE_TEACHER">Giáo viên</option>
                                                <option value="ROLE_STUDENT">Học sinh</option>
                                            </select>
                                        </div>
                                    )}

                                    {broadcastScope === 'SCHOOL' && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-1 text-xs">
                                            <label className="text-[10px] font-black text-primary/60 uppercase tracking-widest pl-1">Chọn trường học</label>
                                            <select className={selectClasses} value={targetSchoolId || ''} onChange={(e) => setTargetSchoolId(Number(e.target.value))}>
                                                <option value="">-- Chọn trường học --</option>
                                                {schools.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                        </div>
                                    )}

                                    {broadcastScope === 'CLASS' && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                            <label className="text-[10px] font-black text-primary/60 uppercase tracking-widest pl-1">Chọn lớp học</label>
                                            <select className={selectClasses} value={targetClassId || ''} onChange={(e) => setTargetClassId(Number(e.target.value))}>
                                                <option value="">-- Chọn lớp học --</option>
                                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Tiêu đề thông báo</label>
                                <Input placeholder="Tiêu đề..." value={sendTitle} onChange={(e) => setSendTitle(e.target.value)} className={inputClasses} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">URL Hình ảnh (Nếu có)</label>
                                <Input placeholder="https://..." value={sendImageUrl} onChange={(e) => setSendImageUrl(e.target.value)} className={inputClasses} />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest pl-1">Nội dung thông điệp</label>
                                <textarea 
                                    placeholder="Nhập nội dung..." 
                                    value={sendMessage}
                                    onChange={(e) => setSendMessage(e.target.value)}
                                    className="flex min-h-[120px] w-full rounded-xl border border-border/50 bg-muted/20 px-4 py-3 text-sm font-bold resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                />
                            </div>

                            <Button onClick={handleSendNotification} disabled={sending} className="w-full h-14 rounded-2xl font-black text-lg gap-3 transition-all bg-primary shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99]">
                                {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                {sending ? 'ĐANG GỬI...' : 'GỬI THÔNG BÁO'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: History */}
                <div className="lg:col-span-12 xl:col-span-7 space-y-6">
                    <Card className="premium-card border-none shadow-xl dark:shadow-none overflow-hidden flex flex-col min-h-[600px]">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <CardTitle className="text-xl font-black">Tra cứu lịch sử</CardTitle>
                                    <p className="text-muted-foreground text-sm font-medium">Kiểm tra các thông báo mà người dùng nhận được.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <UserSelect 
                                        value={viewUserId}
                                        onSelect={(val) => { 
                                            setViewUserId(val); 
                                            fetchNotifications(val); 
                                        }}
                                        placeholder="Tìm người dùng..."
                                        className="w-48 h-10 text-xs shadow-none border-border/50"
                                    />
                                    <Button size="sm" onClick={() => fetchNotifications()} disabled={loadingNotifications} className="rounded-xl h-10 px-4 font-bold bg-primary/5 text-primary hover:bg-primary hover:text-white border border-primary/10 transition-all">
                                        <Bell className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-2 flex-1 flex flex-col">
                            {loadingNotifications ? (
                                <div className="flex flex-col items-center justify-center flex-1 gap-4">
                                    <div className="h-10 w-10 border-4 border-primary/20 border-t-primary animate-spin rounded-full" />
                                    <p className="font-bold text-muted-foreground/40 uppercase text-[10px] tracking-widest leading-loose">Truy xuất dữ liệu...</p>
                                </div>
                            ) : !hasLoaded ? (
                                <div className="flex flex-col items-center justify-center flex-1 py-12 text-muted-foreground/20">
                                    <History className="h-20 w-20 mb-4" />
                                    <p className="text-lg font-black italic text-center">Bắt đầu tra cứu<br/>bằng cách chọn người dùng</p>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center flex-1 py-12 text-muted-foreground/20">
                                    <MessageSquare className="h-20 w-20 mb-4" />
                                    <p className="text-lg font-black italic">Không có dữ liệu thông báo</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {notifications.map((n) => (
                                        <div key={n.id} className="relative bg-muted/20 border border-border/30 rounded-2xl p-5 hover:bg-muted/30 transition-all duration-200">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex gap-4">
                                                    <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm", n.isRead ? "bg-muted text-muted-foreground/40" : "bg-primary text-white")}>
                                                        <Bell className="h-6 w-6" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-black text-foreground">{n.title}</h4>
                                                        </div>
                                                        <p className="text-sm font-medium text-muted-foreground leading-snug">{n.message}</p>
                                                        {n.imageUrl && (
                                                            <div className="mt-3 rounded-xl overflow-hidden border border-border/50 max-w-[200px] bg-muted/50">
                                                                <img src={n.imageUrl} alt="" className="w-full h-auto object-cover max-h-[120px]" />
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-4 pt-3">
                                                            <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
                                                                <Clock className="h-3 w-3" /> {formatDate(n.createdAt)}
                                                            </div>
                                                            <div className="text-[10px] font-black text-muted-foreground/20 uppercase tracking-widest">ID: #{n.id}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all font-bold" onClick={() => deleteNotification(n.id)}>
                                                        <Trash className="h-4.5 w-4.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
