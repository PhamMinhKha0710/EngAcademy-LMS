import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useRole } from '../../hooks/useRole'
import { useAuthStore } from '../../store/authStore'
import { questApi } from '../../services/api/questApi'
import {
    LayoutDashboard, BookOpen, Languages, FileText, Trophy,
    BookMarked, Award, Settings, GraduationCap, HelpCircle,
    BarChart3, Flame, School
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
]

const teacherMenuItems: MenuItem[] = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/teacher/dashboard' },
    { icon: GraduationCap, label: 'Quản lý lớp', path: '/teacher/management' },
    { icon: BookOpen, label: 'Bài học', path: '/teacher/lessons' },
    { icon: HelpCircle, label: 'Câu hỏi', path: '/teacher/questions' },
    { icon: Languages, label: 'Từ vựng', path: '/teacher/vocabulary' },
    { icon: FileText, label: 'Bài thi', path: '/teacher/exams' },
    { icon: BarChart3, label: 'Tiến độ HS', path: '/teacher/progress' },
]

const Sidebar = () => {
    const location = useLocation()
    const { isTeacher, isStudent } = useRole()
    const user = useAuthStore((s) => s.user)
    const [questProgress, setQuestProgress] = useState({ completed: 0, total: 0 })

    useEffect(() => {
        if (isStudent) {
            questApi.getToday()
                .then((q) => {
                    const total = q?.tasks?.length ?? 0
                    const completed = q?.tasks?.filter((t) => t.completed).length ?? 0
                    setQuestProgress({ completed, total })
                })
                .catch(() => {})
        }
    }, [isStudent])

    const questPercent = questProgress.total > 0 ? (questProgress.completed / questProgress.total) * 100 : 0
    const userLevel = user?.coins != null ? Math.floor(user.coins / 500) + 1 : 1

    return (
        <aside className="fixed left-0 top-16 bottom-0 w-64 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-hidden z-20">
            {/* Logo */}
            <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-100 dark:border-slate-800 shrink-0">
                <div className="flex items-center justify-center size-10 rounded-xl bg-primary-500/10 text-primary-500">
                    <School className="w-6 h-6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </div>
                <div className="flex flex-col">
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-none">EnglishLearn</h1>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                        {isStudent ? 'Student Portal' : 'Teacher Portal'}
                    </span>
                </div>
            </div>

            {/* User Profile - Student only */}
            {isStudent && user && (
                <div className="px-4 py-4 shrink-0">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-500/5 border border-primary-500/10">
                        <div className="relative size-12 rounded-full overflow-hidden border-2 border-primary-500 bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                            {user.avatarUrl ? (
                                <img src={user.avatarUrl} alt="" className="size-full object-cover" />
                            ) : (
                                <span className="text-lg font-bold text-slate-600 dark:text-slate-300">
                                    {(user.fullName || user.username)?.[0]?.toUpperCase() || '?'}
                                </span>
                            )}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.fullName || user.username}</p>
                            <p className="text-xs font-medium text-primary-500">Level {userLevel} Explorer</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
                {(isTeacher ? teacherMenuItems : studentMenuItems).map((item) => {
                    const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                                ${isActive
                                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <Icon className="w-5 h-5 shrink-0" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                            <span className={`text-sm font-medium ${isActive ? 'font-semibold' : ''}`}>{item.label}</span>
                        </Link>
                    )
                })}

                {/* Daily Streak - Student only */}
                {isStudent && (
                    <div className="mt-auto pt-4">
                        <div className="rounded-2xl p-5 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/50 dark:border-amber-700/30 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <Flame className="w-5 h-5 text-amber-500" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                <span className="font-bold text-slate-900 dark:text-white text-sm">Chuỗi ngày học</span>
                            </div>
                            <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                                {user?.streakDays ?? 0} Ngày
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-300">Tiếp tục phát huy, {user?.fullName?.split(' ')[0] || 'bạn'}!</p>
                            <div className="mt-4 pt-3 border-t border-amber-200/50 dark:border-amber-700/30">
                                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                                    <span>Nhiệm vụ hôm nay</span>
                                    <span>{questProgress.completed}/{questProgress.total}</span>
                                </div>
                                <div className="w-full rounded-full h-2 bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
                                        style={{ width: `${questPercent}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Settings - all users */}
                <Link
                    to="/settings"
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mt-4
                        ${location.pathname === '/settings'
                            ? 'bg-primary-500 text-white'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                >
                    <Settings className="w-5 h-5 shrink-0" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    <span className="text-sm font-medium">Cài đặt</span>
                </Link>
            </nav>
        </aside>
    )
}

export default Sidebar
