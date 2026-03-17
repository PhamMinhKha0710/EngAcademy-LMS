import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { QUEST_PROGRESS_CHANGED } from '../../utils/questRefresh'
import { useTranslation } from 'react-i18next'
import { useRole } from '../../hooks/useRole'
import { useAuthStore } from '../../store/authStore'
import { questApi } from '../../services/api/questApi'
import ProgressBar from '../ui/ProgressBar'
import AppIcon, { AppIconName } from '../common/AppIcon'

interface MenuItem {
    icon: AppIconName
    labelKey: string
    path: string
}

const studentMenuItems: MenuItem[] = [
    { icon: 'dashboard', labelKey: 'sidebar.dashboard', path: '/dashboard' },
    { icon: 'dailyQuests', labelKey: 'sidebar.dailyQuests', path: '/quests' },
    { icon: 'lessons', labelKey: 'sidebar.lessons', path: '/lessons' },
    { icon: 'vocabulary', labelKey: 'sidebar.vocabulary', path: '/vocabulary' },
    { icon: 'exams', labelKey: 'sidebar.exams', path: '/exams' },
    { icon: 'leaderboard', labelKey: 'sidebar.leaderboard', path: '/leaderboard' },
    { icon: 'mistakeNotebook', labelKey: 'sidebar.mistakeNotebook', path: '/mistakes' },
    { icon: 'badges', labelKey: 'sidebar.badges', path: '/badges' },
]

const teacherMenuItems: MenuItem[] = [
    { icon: 'dashboard', labelKey: 'sidebar.dashboard', path: '/teacher/dashboard' },
    { icon: 'classManagement', labelKey: 'sidebar.classManagement', path: '/teacher/management' },
    { icon: 'lessons', labelKey: 'sidebar.lessons', path: '/teacher/lessons' },
    { icon: 'questions', labelKey: 'sidebar.questions', path: '/teacher/questions' },
    { icon: 'vocabulary', labelKey: 'sidebar.vocabulary', path: '/teacher/vocabulary' },
    { icon: 'exams', labelKey: 'sidebar.exams', path: '/teacher/exams' },
    { icon: 'progress', labelKey: 'sidebar.progress', path: '/teacher/progress' },
]

interface SidebarProps {
    onClose?: () => void;
}

const Sidebar = ({ onClose }: SidebarProps) => {
    const { t } = useTranslation()
    const location = useLocation()
    const { isTeacher, isStudent } = useRole()
    const user = useAuthStore((s) => s.user)
    const [questProgress, setQuestProgress] = useState({ completed: 0, total: 0 })

    const userLevel = user?.exp ? Math.floor(user.exp / 1000) + 1 : 1
    const questPercent = questProgress.total > 0 ? (questProgress.completed / questProgress.total) * 100 : 0

    const refetchQuest = useCallback(() => {
        if (!isStudent) return
        questApi.getToday()
            .then((q) => {
                const total = q?.tasks?.length ?? 0
                const completed = q?.tasks?.filter((t) => Boolean(t.completed ?? t.isCompleted)).length ?? 0
                setQuestProgress({ completed, total })
            })
            .catch(() => { })
    }, [isStudent])

    useEffect(() => {
        refetchQuest()
    }, [refetchQuest, location.pathname])

    useEffect(() => {
        const handler = () => refetchQuest()
        window.addEventListener(QUEST_PROGRESS_CHANGED, handler)
        return () => window.removeEventListener(QUEST_PROGRESS_CHANGED, handler)
    }, [refetchQuest])

    return (
        <aside className="fixed left-0 top-16 bottom-0 w-64 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 overflow-hidden z-20">
            {/* User Profile - Student only */}
            {isStudent && user && (
                <div className="px-4 py-4 shrink-0 transform translate-y-3">
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
                            <p className="text-xs font-medium text-primary-500">{t('dashboard.level')} {userLevel} {t('dashboard.explorer')}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
                {(isTeacher ? teacherMenuItems : studentMenuItems).map((item) => {
                    const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={onClose}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                                ${isActive
                                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <AppIcon name={item.icon} className="shrink-0" />
                            <span className={`text-sm font-medium ${isActive ? 'font-semibold' : ''}`}>{t(item.labelKey)}</span>
                        </Link>
                    )
                })}

                {/* Daily Streak - Student only */}
                {isStudent && (
                    <div className="mt-auto pt-4">
                        <div className="rounded-2xl p-5 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200/50 dark:border-amber-700/30 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <AppIcon name="streak" className="text-amber-500" />
                                <span className="font-bold text-slate-900 dark:text-white text-sm">{t('sidebar.dailyStreak')}</span>
                            </div>
                            <p className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                                {user?.streakDays ?? 0} {t('dashboard.streaks')}
                            </p>
                            <p className="text-sm text-slate-600 dark:text-slate-300">{t('sidebar.todaysQuests')}, {user?.fullName || 'you'}!</p>
                            <div className="mt-4 pt-3 border-t border-amber-200/50 dark:border-amber-700/30">
                                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                                    <span>{t('sidebar.todaysQuests')}</span>
                                    <span>{questProgress.completed}/{questProgress.total}</span>
                                </div>
                                <ProgressBar 
                                  value={questPercent}
                                  height="h-2"
                                  variant="streak"
                                  className="mt-1"
                                />
                            </div>
                        </div>
                    </div>
                )}

        {/* Settings - all users */}
        <Link
          to="/settings"
          onClick={onClose}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 mt-4
                        ${
                          location.pathname === "/settings" ||
                          location.pathname === "/profile"
                            ? "bg-primary-500 text-white"
                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                        }`}
                >
                    <AppIcon name="settings" className="shrink-0" />
                    <span className="text-sm font-medium">{t('sidebar.settings')}</span>
                </Link>
            </nav>
        </aside>
    )
}

export default Sidebar;
