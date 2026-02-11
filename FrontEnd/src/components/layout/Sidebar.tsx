import { Link, useLocation } from 'react-router-dom'
import { useRole } from '../../hooks/useRole'
import {
    LayoutDashboard, BookOpen, Languages, FileText, Trophy,
    BookMarked, Award, Settings, GraduationCap, HelpCircle,
    BarChart3, Flame
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface MenuItem {
    icon: LucideIcon
    label: string
    path: string
}

const studentMenuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: BookOpen, label: 'Bài học', path: '/lessons' },
    { icon: Languages, label: 'Từ vựng', path: '/vocabulary' },
    { icon: FileText, label: 'Bài thi', path: '/exams' },
    { icon: Trophy, label: 'Xếp hạng', path: '/leaderboard' },
    { icon: BookMarked, label: 'Sổ lỗi', path: '/mistakes' },
    { icon: Award, label: 'Huy hiệu', path: '/badges' },
    { icon: Settings, label: 'Cài đặt', path: '/settings' },
]

const teacherMenuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/teacher/dashboard' },
    { icon: GraduationCap, label: 'Lớp học', path: '/teacher/classrooms' },
    { icon: BookOpen, label: 'Bài học', path: '/teacher/lessons' },
    { icon: HelpCircle, label: 'Câu hỏi', path: '/teacher/questions' },
    { icon: Languages, label: 'Từ vựng', path: '/teacher/vocabulary' },
    { icon: FileText, label: 'Bài thi', path: '/teacher/exams' },
    { icon: BarChart3, label: 'Tiến độ HS', path: '/teacher/progress' },
    { icon: Settings, label: 'Cài đặt', path: '/settings' },
]

const Sidebar = () => {
    const location = useLocation()
    const { isTeacher, isStudent } = useRole()

    const menuItems = isTeacher ? teacherMenuItems : studentMenuItems

    return (
        <aside className="fixed left-0 top-16 bottom-0 w-64 border-r overflow-y-auto transition-colors" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
            <nav className="p-4 space-y-1">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                                ${isActive
                                    ? 'bg-blue-500/20 text-blue-500 dark:text-blue-400 font-semibold'
                                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                                }`}
                            style={!isActive ? { color: 'var(--color-text-secondary)' } : undefined}
                        >
                            <Icon className="w-5 h-5 shrink-0" />
                            <span className="text-sm font-medium">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            {/* Daily Quest Widget (student only) */}
            {isStudent && (
                <div className="absolute bottom-4 left-4 right-4">
                    <div className="card p-4">
                        <div className="flex items-center space-x-2 mb-2">
                            <Flame className="w-4 h-4 text-orange-500" />
                            <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Nhiệm vụ hôm nay</span>
                        </div>
                        <div className="w-full rounded-full h-2 mb-2" style={{ background: 'var(--color-bg-tertiary)' }}>
                            <div className="bg-gradient-to-r from-orange-500 to-yellow-500 h-2 rounded-full transition-all" style={{ width: '60%' }} />
                        </div>
                        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>3/5 nhiệm vụ hoàn thành</p>
                    </div>
                </div>
            )}
        </aside>
    )
}

export default Sidebar
