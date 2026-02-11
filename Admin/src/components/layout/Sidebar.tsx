import { Link, useLocation, useNavigate } from 'react-router-dom'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
    LayoutDashboard,
    Users,
    School,
    BookOpen,
    FileText,
    HelpCircle,
    Languages,
    GraduationCap,
    ChevronLeft,
    ChevronRight,
    LogOut,
    GraduationCapIcon,
    Bell,
    Award,
    Trophy,
} from 'lucide-react'
import { useAppDispatch } from '@/app/hooks'
import { useRole } from '@/app/useRole'
import { logout } from '@/features/auth/authSlice'
import { ROLES } from '@/lib/roles'

const navItems = [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: [ROLES.ADMIN, ROLES.SCHOOL] },
    { title: 'Trường học', href: '/schools', icon: School, roles: [ROLES.ADMIN, ROLES.SCHOOL] },
    { title: 'Lớp học', href: '/classrooms', icon: GraduationCap, roles: [ROLES.ADMIN, ROLES.SCHOOL] },
    { title: 'Người dùng', href: '/users', icon: Users, roles: [ROLES.ADMIN] },
    { title: 'Bài học', href: '/lessons', icon: BookOpen, roles: [ROLES.ADMIN] },
    { title: 'Bài thi', href: '/exams', icon: FileText, roles: [ROLES.ADMIN] },
    { title: 'Câu hỏi', href: '/questions', icon: HelpCircle, roles: [ROLES.ADMIN] },
    { title: 'Từ vựng', href: '/vocabulary', icon: Languages, roles: [ROLES.ADMIN] },
    { title: 'Huy hiệu', href: '/badges', icon: Award, roles: [ROLES.ADMIN] },
    { title: 'Bảng xếp hạng', href: '/leaderboard', icon: Trophy, roles: [ROLES.ADMIN] },
    { title: 'Thông báo', href: '/notifications', icon: Bell, roles: [ROLES.ADMIN] },
]

interface SidebarProps {
    collapsed: boolean
    onToggle: () => void
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const location = useLocation()
    const dispatch = useAppDispatch()
    const navigate = useNavigate()
    const { roles: userRoles, roleBadge } = useRole()

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
                'relative flex flex-col border-r bg-sidebar text-sidebar-foreground transition-all duration-300',
                collapsed ? 'w-[68px]' : 'w-[260px]'
            )}
        >
            {/* Logo */}
            <div className="flex h-16 items-center gap-2 border-b px-4">
                <GraduationCapIcon className="h-8 w-8 text-primary shrink-0" />
                {!collapsed && (
                    <div className="flex flex-col">
                        <span className="text-lg font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent leading-tight">
                            Admin Panel
                        </span>
                        <span className="text-[10px] text-muted-foreground">{roleBadge}</span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <ScrollArea className="flex-1 py-4">
                <nav className="flex flex-col gap-1 px-2">
                    {visibleItems.map((item) => {
                        const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                                    isActive && 'bg-sidebar-accent text-sidebar-primary',
                                    collapsed && 'justify-center px-2'
                                )}
                                title={collapsed ? item.title : undefined}
                            >
                                <item.icon className={cn('h-5 w-5 shrink-0', isActive && 'text-sidebar-primary')} />
                                {!collapsed && <span>{item.title}</span>}
                            </Link>
                        )
                    })}
                </nav>
            </ScrollArea>

            <Separator />

            {/* Logout */}
            <div className="p-2">
                <Button
                    variant="ghost"
                    className={cn('w-full justify-start gap-3 text-muted-foreground hover:text-destructive', collapsed && 'justify-center px-2')}
                    onClick={handleLogout}
                >
                    <LogOut className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>Đăng xuất</span>}
                </Button>
            </div>

            {/* Collapse toggle */}
            <Button
                variant="outline"
                size="icon"
                className="absolute -right-3 top-20 z-10 h-6 w-6 rounded-full border bg-background shadow-md"
                onClick={onToggle}
            >
                {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
            </Button>
        </div>
    )
}
