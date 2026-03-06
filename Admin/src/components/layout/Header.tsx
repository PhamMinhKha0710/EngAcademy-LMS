import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { useRole } from '@/app/useRole'
import { logout } from '@/features/auth/authSlice'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Moon, Sun, Bell, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState, useEffect } from 'react'

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

    useEffect(() => {
        if (isDark) document.documentElement.classList.add('dark')
        else document.documentElement.classList.remove('dark')
    }, [isDark])

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
                <Button variant="ghost" size="icon" className="relative h-11 w-11 text-muted-foreground hover:bg-muted rounded-xl transition-colors">
                    <Bell className="h-5 w-5" />
                    <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-red-500 border-2 border-background" />
                </Button>

                <div className="h-8 w-px bg-border mx-2" />

                {/* User menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative flex items-center gap-3 px-2 h-14 hover:bg-muted/50 rounded-2xl transition-all">
                            <div className="text-right hidden sm:flex flex-col">
                                <p className="text-sm font-bold text-foreground leading-none">{user?.fullName || 'Admin user'}</p>
                                <p className="text-[11px] text-muted-foreground font-semibold mt-1.5 uppercase tracking-tight">Quản trị viên</p>
                            </div>
                            <Avatar className="h-11 w-11 border-2 border-background shadow-sm ring-1 ring-border">
                                <AvatarImage src={user?.avatarUrl} alt={user?.fullName} />
                                <AvatarFallback className="bg-primary text-white text-xs font-bold">
                                    AD
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
