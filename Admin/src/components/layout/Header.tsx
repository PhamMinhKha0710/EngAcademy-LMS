import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { logout } from '@/features/auth/authSlice'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Moon, Sun, Bell, Search, MessageSquare, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'
import api from '@/lib/api'
import type { ApiResponse, Notification } from '@/types/api'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

function getInitialDark(): boolean {
    if (typeof window === 'undefined') return false
    const saved = localStorage.getItem('theme')
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)
}

export default function Header() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { user } = useAppSelector((state) => state.auth)
    const [isDark, setIsDark] = useState(getInitialDark)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        if (isDark) document.documentElement.classList.add('dark')
        else document.documentElement.classList.remove('dark')
    }, [isDark])

    const fetchNotifications = async () => {
        if (!user?.id) return
        try {
            const [notifRes, unreadRes] = await Promise.all([
                api.get<ApiResponse<Notification[]>>(`/notifications/user/${user.id}`),
                api.get<ApiResponse<number>>(`/notifications/user/${user.id}/unread-count`)
            ])
            setNotifications(notifRes.data.data)
            setUnreadCount(unreadRes.data.data)
        } catch (error) {
            console.error('Failed to fetch notifications', error)
        }
    }

    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 60000) // Polling every minute
        return () => clearInterval(interval)
    }, [user?.id])

    const markAsRead = async (id: number) => {
        try {
            await api.put(`/notifications/${id}/read`)
            setNotifications(prev => 
                prev.map(n => n.id === id ? { ...n, isRead: true } : n)
            )
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error('Failed to mark notification as read', error)
        }
    }

    const toggleTheme = () => {
        setIsDark(!isDark)
        if (isDark) {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        } else {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        }
    }

    const handleLogout = () => {
        dispatch(logout())
        navigate('/login')
    }

    return (
        <header className="sticky top-0 z-30 flex h-20 items-center gap-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-8 border-b border-border/50">
            {/* Search Section */}
            <div className="relative flex-1 max-w-lg group">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <Input
                    placeholder="Tìm kiếm..."
                    className="pl-12 h-11 bg-muted/30 border-border/50 rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20 transition-all text-sm font-medium"
                />
            </div>

            <div className="flex items-center gap-3 ml-auto">
                {/* Theme toggle */}
                <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-11 w-11 text-muted-foreground hover:bg-muted rounded-xl transition-colors">
                    {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>

                {/* Notifications */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative h-11 w-11 text-muted-foreground hover:bg-muted rounded-xl transition-colors">
                            <Bell className="h-5 w-5" />
                            {unreadCount > 0 && (
                                <span className="absolute right-2.5 top-2.5 h-4 w-4 rounded-full bg-red-500 border-2 border-background text-[10px] font-bold text-white flex items-center justify-center">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-80 p-0 rounded-2xl shadow-xl border-border bg-popover overflow-hidden" align="end">
                        <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
                            <h3 className="font-bold text-sm flex items-center gap-2">
                                <Bell className="h-4 w-4 text-primary" />
                                Thông báo
                            </h3>
                            {unreadCount > 0 && (
                                <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    {unreadCount} mới
                                </span>
                            )}
                        </div>
                        <ScrollArea className="h-[400px]">
                            {notifications.length > 0 ? (
                                <div className="divide-y divide-border/50">
                                    {notifications.map((notif) => (
                                        <div 
                                            key={notif.id} 
                                            className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer group relative ${!notif.isRead ? 'bg-primary/[0.02]' : ''}`}
                                            onClick={() => !notif.isRead && markAsRead(notif.id)}
                                        >
                                            <div className="flex gap-3">
                                                <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${!notif.isRead ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                                    <MessageSquare className="h-4 w-4" />
                                                </div>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className={`text-sm leading-tight ${!notif.isRead ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'}`}>
                                                            {notif.title}
                                                        </p>
                                                        {!notif.isRead && (
                                                            <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground line-clamp-2 leading-normal">
                                                        {notif.message}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Clock className="h-3 w-3 text-muted-foreground/60" />
                                                        <span className="text-[10px] text-muted-foreground/60 font-medium">
                                                            {notif.createdAt ? formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: vi }) : 'Vừa xong'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-48 p-6 text-center">
                                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                                        <Bell className="h-6 w-6 text-muted-foreground/40" />
                                    </div>
                                    <p className="text-sm font-bold text-muted-foreground">Không có thông báo nào</p>
                                    <p className="text-xs text-muted-foreground/60 mt-1">Chúng tôi sẽ thông báo cho bạn khi có tin mới</p>
                                </div>
                            )}
                        </ScrollArea>
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="h-8 w-px bg-border mx-2" />

                {/* User menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative flex items-center gap-3 px-2 h-14 hover:bg-muted/50 rounded-2xl transition-all">
                            <div className="text-right hidden sm:flex flex-col">
                                <p className="text-sm font-bold text-foreground leading-none">{user?.fullName || user?.username || 'User'}</p>
                                <p className="text-[11px] text-muted-foreground font-semibold mt-1.5 uppercase tracking-tight">
                                    {user?.roles?.includes('ROLE_ADMIN') ? 'Quản trị hệ thống' : 
                                     user?.roles?.includes('ROLE_SCHOOL') ? `Quản lý: ${user?.schoolName || 'Trường học'}` : 
                                     user?.roles?.includes('ROLE_TEACHER') ? 'Giáo viên' : 'Học sinh'}
                                </p>
                            </div>
                            <Avatar className="h-11 w-11 border-2 border-background shadow-sm ring-1 ring-border">
                                <AvatarImage src={user?.avatarUrl} alt={user?.fullName} />
                                <AvatarFallback className="bg-primary text-white text-xs font-bold">
                                    {user?.fullName?.substring(0, 2).toUpperCase() || 'AD'}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-64 p-2 rounded-2xl shadow-xl border-border bg-popover text-popover-foreground" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal p-3">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-bold leading-none">{user?.fullName || 'Admin user'}</p>
                                <p className="text-xs leading-none text-muted-foreground mt-1">{user?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-border" />
                        <div className="p-1">
                            <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-xl h-10 font-medium cursor-pointer">
                                Hồ sơ cá nhân
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate('/settings')} className="rounded-xl h-10 font-medium cursor-pointer">
                                Cài đặt
                            </DropdownMenuItem>
                        </div>
                        <DropdownMenuSeparator className="bg-border" />
                        <div className="p-1">
                            <DropdownMenuItem onClick={handleLogout} className="rounded-xl h-10 font-semibold text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20 cursor-pointer">
                                Đăng xuất
                            </DropdownMenuItem>
                        </div>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
