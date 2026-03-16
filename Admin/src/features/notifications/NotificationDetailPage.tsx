import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, ArrowLeft, Clock, Calendar, CheckCircle, MessageSquare } from 'lucide-react'
import api from '@/lib/api'
import type { ApiResponse, Notification } from '@/types/api'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

export default function NotificationDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [notification, setNotification] = useState<Notification | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchNotification = async () => {
            try {
                // Fetch user notifications and filter for this ID
                const response = await api.get<ApiResponse<Notification[]>>('/notifications/user/me')
                const found = response.data.data.find(n => n.id === Number(id))
                
                if (found) {
                    setNotification(found)
                    if (!found.isRead) {
                        await api.put(`/notifications/${id}/read`)
                    }
                }
            } catch (error) {
                console.error('Failed to fetch notification detail', error)
            } finally {
                setLoading(false)
            }
        }

        fetchNotification()
    }, [id])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="h-10 w-10 border-4 border-primary/20 border-t-primary animate-spin rounded-full" />
            </div>
        )
    }

    if (!notification) {
        return (
            <div className="max-w-4xl mx-auto p-8 text-center space-y-4">
                <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <Bell className="h-10 w-10 text-muted-foreground/40" />
                </div>
                <h2 className="text-2xl font-black text-foreground">Không tìm thấy thông báo</h2>
                <Button variant="outline" onClick={() => navigate(-1)} className="rounded-xl gap-2 font-bold">
                    <ArrowLeft className="h-4 w-4" /> Quay lại
                </Button>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-10">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate(-1)} className="rounded-xl gap-2 font-bold text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="h-4 w-4" /> Quay lại
                </Button>
                {notification.isRead && (
                    <div className="flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider border border-green-100 dark:border-green-900/30">
                        <CheckCircle className="h-4 w-4" />
                        Đã đọc
                    </div>
                )}
            </div>

            <Card className="premium-card border-none shadow-2xl shadow-slate-200/50 overflow-hidden">
                <CardHeader className="p-10 pb-6 bg-primary/5 border-b border-primary/10">
                    <div className="flex items-start gap-6">
                        <div className="p-4 bg-primary/10 text-primary rounded-2xl shadow-inner shrink-0">
                            <MessageSquare className="h-8 w-8" />
                        </div>
                        <div className="space-y-3">
                            <CardTitle className="text-3xl font-black leading-tight">{notification.title}</CardTitle>
                            <div className="flex items-center gap-6 text-sm font-bold text-muted-foreground/60">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    {format(new Date(notification.createdAt), 'dd MMMM, yyyy', { locale: vi })}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4" />
                                    {format(new Date(notification.createdAt), 'HH:mm', { locale: vi })}
                                </div>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-10 space-y-8">
                    {notification.imageUrl && (
                        <div className="rounded-3xl overflow-hidden border border-border/50 shadow-inner bg-muted/30">
                            <img src={notification.imageUrl} alt="" className="w-full h-auto object-cover max-h-[500px]" />
                        </div>
                    )}
                    
                    <div className="text-xl font-medium text-foreground leading-relaxed whitespace-pre-wrap">
                        {notification.message}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
