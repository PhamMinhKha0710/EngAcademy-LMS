import { Link, useLocation, useNavigate } from 'react-router-dom'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
    Users,
    School,
    GraduationCap,
    ChevronLeft,
    ChevronRight,
    LogOut,
    GraduationCapIcon,
    Bell,
    Award,
    Trophy,
    Settings,
} from 'lucide-react'
import { useAppDispatch } from '@/app/hooks'
import { useRole } from '@/app/useRole'
import { logout } from '@/features/auth/authSlice'
import { ROLES } from '@/lib/roles'

const navItems = [
    // ADMIN only pages
    { title: 'Trường học', href: '/schools', icon: School, roles: [ROLES.ADMIN] },
    { title: 'Tất cả người dùng', href: '/users', icon: Users, roles: [ROLES.ADMIN] },
    { title: 'Thông báo', href: '/notifications', icon: Bell, roles: [ROLES.ADMIN] },
    { title: 'Xếp hạng', href: '/leaderboard', icon: Trophy, roles: [ROLES.ADMIN, ROLES.SCHOOL] },
    { title: 'Huy hiệu', href: '/badges', icon: Award, roles: [ROLES.ADMIN] },

    // SCHOOL only pages - ordered from largest to smallest scope
    { title: 'Lớp học', href: '/classrooms', icon: GraduationCap, roles: [ROLES.SCHOOL] },
    { title: 'Giáo viên', href: '/teachers', icon: GraduationCapIcon, roles: [ROLES.SCHOOL] },
    { title: 'Học sinh', href: '/students', icon: Users, roles: [ROLES.SCHOOL] },
    { title: 'Điểm', href: '/grades', icon: Award, roles: [ROLES.SCHOOL] },

    // COMMON pages
    { title: 'Cài đặt', href: '/settings', icon: Settings, roles: [ROLES.ADMIN, ROLES.SCHOOL] },
]

interface SidebarProps {
    collapsed: boolean
    onToggle: () => void
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const location = useLocation()
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { roles: userRoles } = useRole()

    const handleLogout = () => {
        dispatch(logout())
        navigate('/login')
    }

    // Filter menu items based on user roles
    const visibleItems = navItems.filter((item) =>
        item.roles.some((role) => userRoles.includes(role))
    )

    return (
        <div
            className={cn(
                'relative flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300 z-40',
                collapsed ? 'w-[80px]' : 'w-[280px]'
            )}
        >
            {/* Logo Section */}
            <div className="flex h-24 items-center gap-3 px-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary shadow-lg shadow-blue-200 shrink-0">
                    <GraduationCapIcon className="h-6 w-6 text-white" />
                </div>
                {!collapsed && (
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-foreground tracking-tight leading-tight">
                            Admin Panel
                        </span>
                        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Hệ thống quản lý</span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 px-4 py-4">
                <nav className="flex flex-col gap-2">
                    {visibleItems.map((item) => {
                        const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    'group relative flex items-center gap-3 rounded-xl px-4 py-3 text-[15px] font-semibold transition-all duration-200',
                                    isActive
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                                    collapsed && 'justify-center px-0'
                                )}
                                title={collapsed ? item.title : undefined}
                             >
                                <item.icon className={cn('h-5 w-5 shrink-0', isActive ? 'text-primary' : 'text-muted-foreground/50')} />
                                {!collapsed && <span>{item.title}</span>}
                                {isActive && !collapsed && (
                                    <div className="absolute left-0 h-6 w-1 rounded-r-full bg-primary" />
                                )}
                            </Link>
                        )
                    })}
                </nav>
            </ScrollArea>

            <div className="mt-auto p-4 border-t border-border">
                <Button
                    variant="ghost"
                    className={cn(
                        'w-full justify-start gap-3 h-12 rounded-xl text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold',
                        collapsed && 'justify-center px-0'
                    )}
                    onClick={handleLogout}
                >
                    <LogOut className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>Đăng xuất</span>}
                </Button>
            </div>

            {/* Collapse toggle - minimal style */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute -right-3 top-10 h-6 w-6 rounded-full border border-border bg-background shadow-sm ring-1 ring-border hidden md:flex"
                onClick={onToggle}
            >
                {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </Button>
        </div>
    )
}
