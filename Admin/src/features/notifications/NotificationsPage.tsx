import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Bell, Send, Search, CheckCircle, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import type { ApiResponse, Notification } from '@/types/api'
import { toast } from 'sonner'

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
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Gửi thông báo thất bại'
            toast.error(msg)
        } finally {
            setSending(false)
        }
    }

    const fetchNotifications = async () => {
        if (!viewUserId.trim()) {
            toast.error('Vui lòng nhập User ID')
            return
        }
        setLoadingNotifications(true)
        try {
            const response = await api.get<ApiResponse<Notification[]>>(
                `/notifications/user/${viewUserId}`
            )
            setNotifications(response.data.data)
            setHasLoaded(true)
            if (response.data.data.length === 0) {
                toast.info('Không có thông báo nào')
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Không thể tải thông báo'
            toast.error(msg)
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
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Thao tác thất bại'
            toast.error(msg)
        }
    }

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—'
        try {
            return new Date(dateStr).toLocaleString('vi-VN', {
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
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Quản lý thông báo</h1>
                <p className="text-muted-foreground mt-1">Gửi và quản lý thông báo cho người dùng</p>
            </div>

            {/* Send Notification Form */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                        <Send className="h-5 w-5 text-primary" />
                        Gửi thông báo
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Username</label>
                            <Input
                                placeholder="Nhập username người nhận"
                                value={sendUsername}
                                onChange={(e) => setSendUsername(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tiêu đề</label>
                            <Input
                                placeholder="Nhập tiêu đề thông báo"
                                value={sendTitle}
                                onChange={(e) => setSendTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium">Nội dung</label>
                            <Input
                                placeholder="Nhập nội dung thông báo"
                                value={sendMessage}
                                onChange={(e) => setSendMessage(e.target.value)}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <Button onClick={handleSendNotification} disabled={sending} className="gap-2">
                                {sending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                                {sending ? 'Đang gửi...' : 'Gửi thông báo'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* View Notifications */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-primary" />
                            Danh sách thông báo
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Nhập User ID"
                                value={viewUserId}
                                onChange={(e) => setViewUserId(e.target.value)}
                                className="pl-9"
                                onKeyDown={(e) => e.key === 'Enter' && fetchNotifications()}
                            />
                        </div>
                        <Button onClick={fetchNotifications} disabled={loadingNotifications} className="gap-2">
                            {loadingNotifications ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Search className="h-4 w-4" />
                            )}
                            Tải thông báo
                        </Button>
                    </div>

                    {loadingNotifications ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        </div>
                    ) : !hasLoaded ? (
                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                            <Bell className="h-10 w-10 mb-2 opacity-50" />
                            <p>Nhập User ID và nhấn "Tải thông báo" để xem</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                            <Bell className="h-10 w-10 mb-2 opacity-50" />
                            <p>Không có thông báo nào</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">ID</TableHead>
                                    <TableHead>Tiêu đề</TableHead>
                                    <TableHead>Nội dung</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead>Thời gian</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {notifications.map((notification) => (
                                    <TableRow key={notification.id}>
                                        <TableCell className="font-medium">{notification.id}</TableCell>
                                        <TableCell className="font-medium max-w-[200px] truncate">
                                            {notification.title}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground max-w-[300px] truncate">
                                            {notification.message}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={notification.isRead ? 'secondary' : 'default'}>
                                                {notification.isRead ? 'Đã đọc' : 'Chưa đọc'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground whitespace-nowrap">
                                            {formatDate(notification.createdAt)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {!notification.isRead && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="gap-1 text-green-600 hover:text-green-700"
                                                    onClick={() => markAsRead(notification.id)}
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                    Đánh dấu đã đọc
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
