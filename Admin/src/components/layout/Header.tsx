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

export default function Header() {
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { user } = useAppSelector((state) => state.auth)
    const { isAdmin, roleBadge } = useRole()
    const [isDark, setIsDark] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem('theme')
        if (saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setIsDark(true)
            document.documentElement.classList.add('dark')
        }
    }, [])

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

    const getInitials = (name?: string) => {
        if (!name) return 'AD'
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Tìm kiếm..."
                    className="pl-9 bg-muted/50 border-none focus-visible:ring-1"
                />
            </div>

            <div className="flex items-center gap-2 ml-auto">
                {/* Theme toggle */}
                <Button variant="ghost" size="icon" onClick={toggleTheme} className="h-9 w-9">
                    {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                    <Bell className="h-4 w-4" />
                    <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
                </Button>

                {/* Role badge */}
                <Badge variant={isAdmin ? 'destructive' : 'default'} className="text-[10px] px-2 py-0.5">
                    {roleBadge}
                </Badge>

                {/* User menu */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src={user?.avatarUrl} alt={user?.fullName} />
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                                    {getInitials(user?.fullName)}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.fullName || 'Admin'}</p>
                                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate('/profile')}>
                            Hồ sơ cá nhân
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate('/settings')}>
                            Cài đặt
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                            Đăng xuất
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    )
}
