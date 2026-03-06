import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Bell, Send, Search, CheckCircle, Loader2, Info, Users, History, MessageSquare, Clock, Trash } from 'lucide-react'
import { AxiosError } from 'axios'
import api from '@/lib/api'
import type { ApiResponse, Notification } from '@/types/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function getErrorMessage(error: unknown, fallback: string): string {
    return error instanceof AxiosError && error.response?.data?.message
        ? String(error.response.data.message)
        : fallback
}

export default function NotificationsPage() {
    // Send notification form state
    const [sendUsername, setSendUsername] = useState('')
    const [sendTitle, setSendTitle] = useState('')
    const [sendMessage, setSendMessage] = useState('')
    const [sending, setSending] = useState(false)

    // View notifications state
    const [viewUserId, setViewUserId] = useState('')
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [loadingNotifications, setLoadingNotifications] = useState(false)
    const [hasLoaded, setHasLoaded] = useState(false)

    const handleSendNotification = async () => {
        if (!sendUsername.trim() || !sendTitle.trim() || !sendMessage.trim()) {
            toast.error('Vui lòng điền đầy đủ thông tin')
            return
        }
        setSending(true)
        try {
            await api.post(
                `/test-notifications/send/${encodeURIComponent(sendUsername)}`,
                null,
                { params: { title: sendTitle, message: sendMessage } }
            )
            toast.success('Gửi thông báo thành công!')
            setSendUsername('')
            setSendTitle('')
            setSendMessage('')
            // If viewing the same user, refresh their list
            if (viewUserId === sendUsername) fetchNotifications()
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, 'Gửi thông báo thất bại'))
        } finally {
            setSending(false)
        }
    }

    const fetchNotifications = async () => {
        if (!viewUserId.trim()) {
            toast.error('Vui lòng nhập Username/ID')
            return
        }
        setLoadingNotifications(true)
        try {
            const response = await api.get<ApiResponse<Notification[]>>(
                `/notifications/user/${viewUserId}`
            )
            setNotifications(response.data.data)
            setHasLoaded(true)
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, 'Không thể tải thông báo'))
            setNotifications([])
            setHasLoaded(true)
        } finally {
            setLoadingNotifications(false)
        }
    }

    const markAsRead = async (id: number) => {
        try {
            await api.put(`/notifications/${id}/read`)
            setNotifications((prev) =>
                prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            )
            toast.success('Đã đánh dấu đã đọc')
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, 'Thao tác thất bại'))
        }
    }

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—'
        try {
            const date = new Date(dateStr)
            return date.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            })
        } catch {
            return dateStr
        }
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black tracking-tight">Quản lý thông báo</h1>
                <p className="text-muted-foreground mt-2 font-medium">Gửi tin nhắn trực tiếp đến người dùng và theo dõi lịch sử thông báo.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Compose */}
                <div className="lg:col-span-12 xl:col-span-5 space-y-6">
                    <Card className="premium-card border-none shadow-xl shadow-slate-200/50 overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                                <Send className="h-6 w-6 text-primary" />
                            </div>
                            <CardTitle className="text-xl font-black">Soạn thông báo mới</CardTitle>
                            <p className="text-muted-foreground text-sm font-medium">Gửi tin nhắn hệ thống đến một người dùng cụ thể.</p>
                        </CardHeader>
                        <CardContent className="p-8 pt-4 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest pl-1">Người nhận (Username)</label>
                                <div className="relative group">
                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                    <Input 
                                        placeholder="Ví dụ: student01" 
                                        value={sendUsername}
                                        onChange={(e) => setSendUsername(e.target.value)}
                                        className="h-12 pl-11 rounded-xl bg-muted/30 border-border/50 focus-visible:ring-primary/20 font-bold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest pl-1">Tiêu đề thông báo</label>
                                <Input 
                                    placeholder="Ví dụ: Chúc mừng bạn đã lên hạng!" 
                                    value={sendTitle}
                                    onChange={(e) => setSendTitle(e.target.value)}
                                    className="h-12 rounded-xl bg-muted/30 border-border/50 focus-visible:ring-primary/20 font-bold"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-widest pl-1">Nội dung tin nhắn</label>
                                <textarea 
                                    placeholder="Nhập nội dung thông báo tại đây..." 
                                    value={sendMessage}
                                    onChange={(e) => setSendMessage(e.target.value)}
                                    className="flex min-h-[150px] w-full rounded-xl border border-border/50 bg-muted/30 px-4 py-3 text-sm font-medium ring-offset-background placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none transition-all"
                                />
                            </div>

                            <Button 
                                onClick={handleSendNotification} 
                                disabled={sending} 
                                className="w-full h-14 rounded-xl font-black text-lg gap-3 transition-all bg-primary"
                            >
                                {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                                {sending ? 'ĐANG GỬI...' : 'GỬI THÔNG BÁO NGAY'}
                            </Button>

                            <div className="bg-muted/50 rounded-2xl p-4 border border-border/50 flex gap-3">
                                <Info className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-xs font-bold text-muted-foreground leading-relaxed">
                                    Thông báo này sẽ xuất hiện trong trung tâm thông báo của người dùng ngay lập tức. Hãy kiểm tra kỹ nội dung trước khi gửi.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: History */}
                <div className="lg:col-span-12 xl:col-span-7 space-y-6">
                    <Card className="premium-card border-none shadow-xl dark:shadow-none overflow-hidden flex flex-col min-h-[600px]">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <CardTitle className="text-xl font-black">Lịch sử gửi gần đây</CardTitle>
                                    <p className="text-muted-foreground text-sm font-medium">Xem các thông báo đã gửi cho một người dùng.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="relative group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                        <Input 
                                            placeholder="Username..." 
                                            value={viewUserId}
                                            onChange={(e) => setViewUserId(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && fetchNotifications()}
                                            className="h-10 pl-10 w-48 rounded-xl bg-muted/30 border-border/50 focus-visible:ring-primary/20 font-bold text-xs"
                                        />
                                    </div>
                                    <Button size="sm" onClick={fetchNotifications} disabled={loadingNotifications} className="rounded-xl h-10 px-4 font-bold">
                                        {loadingNotifications ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                                        TRA CỨU
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-2 flex-1 flex flex-col">
                            {loadingNotifications ? (
                                <div className="flex flex-col items-center justify-center flex-1 gap-4">
                                    <div className="h-12 w-12 rounded-full border-4 border-blue-500/20 border-t-blue-600 animate-spin" />
                                    <p className="font-bold text-slate-400">Đang truy xuất dữ liệu...</p>
                                </div>
                            ) : !hasLoaded ? (
                                <div className="flex flex-col items-center justify-center flex-1 text-slate-300 py-12">
                                    <History className="h-20 w-20 mb-4 opacity-10" />
                                    <p className="text-lg font-black italic text-center">Nhập username người nhận<br/>để xem lịch sử thông báo</p>
                                    <div className="mt-6 flex gap-2">
                                        <Badge variant="outline" className="text-[10px] font-black uppercase text-slate-400 border-slate-200">Tra cứu nhanh</Badge>
                                        <Badge variant="outline" className="text-[10px] font-black uppercase text-slate-400 border-slate-200">Trạng thái đã đọc</Badge>
                                    </div>
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center flex-1 text-slate-300 py-12">
                                    <MessageSquare className="h-20 w-20 mb-4 opacity-10" />
                                    <p className="text-lg font-black italic">Người dùng này chưa có thông báo nào</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {notifications.map((n) => (
                                        <div key={n.id} className="group relative bg-muted/20 border border-border/40 rounded-2xl p-5 hover:border-border transition-colors duration-200">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex gap-4">
                                                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", n.isRead ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary")}>
                                                        {n.isRead ? <CheckCircle className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-black text-foreground leading-tight">{n.title}</h4>
                                                            {n.isRead ? (
                                                                <Badge variant="secondary" className="text-[9px] font-black px-1.5 py-0 bg-muted text-muted-foreground border-none uppercase">ĐÃ ĐỌC</Badge>
                                                            ) : (
                                                                <Badge className="text-[9px] font-black px-1.5 py-0 bg-primary text-white border-none uppercase">MỚI</Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm font-medium text-muted-foreground line-clamp-2">{n.message}</p>
                                                        <div className="flex items-center gap-3 pt-2">
                                                            <span className="flex items-center gap-1 text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">
                                                                <Clock className="h-3 w-3" /> {formatDate(n.createdAt)}
                                                            </span>
                                                            <div className="h-3 w-[1px] bg-border/40" />
                                                            <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">ID: #{n.id}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    {!n.isRead && (
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-8 w-8 rounded-lg text-emerald-500 hover:bg-emerald-500/10" 
                                                            onClick={() => markAsRead(n.id)}
                                                            title="Đánh dấu đã đọc"
                                                        >
                                                            <CheckCircle className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive" title="Xóa thông báo">
                                                        <Trash className="h-4 w-4" />
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
