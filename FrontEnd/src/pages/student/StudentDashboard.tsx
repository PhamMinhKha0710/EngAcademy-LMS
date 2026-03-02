import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
    ArrowRight,
    Bell,
    BookOpen,
    CheckCircle2,
    Clock,
    Flame,
    Gem,
    Loader2,
    PlayCircle,
    Settings,
    Trophy,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { progressApi, ProgressResponse } from '../../services/api/progressApi'
import { leaderboardApi, LeaderboardEntry } from '../../services/api/leaderboardApi'
import { DailyQuestResponse, questApi } from '../../services/api/questApi'

interface ProgressStats {
    completedLessons: number
    averageProgress: number
}

const NEXT_LESSON_IMAGE = 'https://lh3.googleusercontent.com/aida-public/AB6AXuALCoX9kpHAXVTawTzYGjbLCOoXiJ5VtIDa_NUAyZsaopP3FSofE1OwwHkKqo_WHwSlMvrKI0Voq4udFZ0yRDE1TUesQbm8mWKH6LXMT4LeoWChjDbCLb6yfxY_s1arB4a3L_jLUY2YxhRpOOkwyqfy3K57e-q7Vc03dz6gVvyHN40dgmEwupUmLnNp26VS2Qn4d8-gVem_PDPnbpQq1y_T7MkHTdZO6RwjtzUb2y4P-M7ahfmftTJEdhjgDsSiGM9_xy_1QnDcxuWS'

export default function StudentDashboard() {
    const user = useAuthStore((s) => s.user)
    const navigate = useNavigate()

    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<ProgressStats | null>(null)
    const [inProgress, setInProgress] = useState<ProgressResponse[]>([])
    const [completed, setCompleted] = useState<ProgressResponse[]>([])
    const [top5, setTop5] = useState<LeaderboardEntry[]>([])
    const [dailyQuest, setDailyQuest] = useState<DailyQuestResponse | null>(null)

    useEffect(() => {
        if (!user?.id) return

        const fetchData = async () => {
            setLoading(true)
            try {
                const [statsData, inProgressData, completedData, leaderboardData, dailyQuestData] =
                    await Promise.allSettled([
                        progressApi.getStats(user.id),
                        progressApi.getInProgress(user.id),
                        progressApi.getCompleted(user.id),
                        leaderboardApi.getTop(5),
                        questApi.getToday(),
                    ])

                if (statsData.status === 'fulfilled' && statsData.value) {
                    const raw = statsData.value as Record<string, unknown>
                    setStats({
                        completedLessons: (raw.completedLessons as number) ?? 0,
                        averageProgress: (raw.averageProgress as number) ?? 0,
                    })
                }
                if (inProgressData.status === 'fulfilled') setInProgress((inProgressData.value as ProgressResponse[]).slice(0, 4))
                if (completedData.status === 'fulfilled') setCompleted((completedData.value as ProgressResponse[]).slice(0, 5))
                if (leaderboardData.status === 'fulfilled') setTop5(leaderboardData.value)
                if (dailyQuestData.status === 'fulfilled') setDailyQuest(dailyQuestData.value)
            } catch (err) {
                console.error('Failed to load dashboard data:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user?.id])

    const handleContinueLearning = () => {
        if (inProgress.length > 0) {
            navigate(`/lessons/${inProgress[0].lessonId}`)
        } else {
            navigate('/lessons')
        }
    }

    const nextLesson = inProgress[0]
    const totalCoins = user?.coins ?? 0
    const xpInLevel = totalCoins % 500
    const xpNeeded = 500

    const wordsMastered = (stats?.completedLessons ?? 0) * 15
    const timeSpentMinutes = (stats?.completedLessons ?? 0) * 15
    const timeSpentDisplay = timeSpentMinutes >= 60
        ? `${Math.floor(timeSpentMinutes / 60)}h ${timeSpentMinutes % 60}m`
        : `${timeSpentMinutes}m`
    const questTasks = dailyQuest?.tasks ?? []
    const questCompletedCount = questTasks.filter((task) => Boolean(task.completed ?? task.isCompleted)).length
    const questTotalCount = questTasks.length
    const primaryQuest = questTasks.find((task) => !(task.completed ?? task.isCompleted)) ?? questTasks[0]
    const primaryQuestProgress = primaryQuest
        ? Math.min(
            (((primaryQuest.currentProgress ?? primaryQuest.currentCount ?? 0) / Math.max(primaryQuest.targetCount ?? 1, 1)) * 100),
            100
        )
        : 0
    const learningItems = [...inProgress.slice(0, 2), ...completed.slice(0, 1)]

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-primary-500" strokeWidth={2} />
            </div>
        )
    }

    return (
        <div className="flex flex-col min-h-full bg-background-light dark:bg-background-dark">
            <header className="border-b border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-4 md:px-8 py-4">
                <div className="mx-auto max-w-7xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                            Welcome back, {user?.fullName?.split(' ')[0] || 'ban'}!
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                            Ready to continue your English journey?
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-sm font-bold inline-flex items-center gap-1.5">
                            <Flame className="w-4 h-4" />
                            {user?.streakDays ?? 0} Days
                        </span>
                        <span className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 text-sm font-bold inline-flex items-center gap-1.5">
                            <Gem className="w-4 h-4" />
                            {(user?.coins ?? 0).toLocaleString()}
                        </span>
                        <button className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                            <Bell className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                            <Settings className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 md:p-8">
                <div className="mx-auto max-w-7xl space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="card p-5">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Daily Streak</p>
                            <p className="text-3xl font-black mt-2 text-slate-900 dark:text-white">{user?.streakDays ?? 0} <span className="text-lg font-semibold">Days</span></p>
                            <p className="text-xs mt-2 text-emerald-500 font-semibold">+1 today</p>
                        </div>
                        <div className="card p-5">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Total XP</p>
                            <p className="text-3xl font-black mt-2 text-slate-900 dark:text-white">{totalCoins.toLocaleString()} <span className="text-lg font-semibold">XP</span></p>
                            <p className="text-xs mt-2 text-emerald-500 font-semibold">+{Math.max(0, xpNeeded - xpInLevel)} to next level</p>
                        </div>
                        <div className="card p-5">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Words Mastered</p>
                            <p className="text-3xl font-black mt-2 text-slate-900 dark:text-white">{wordsMastered} <span className="text-lg font-semibold">Words</span></p>
                            <p className="text-xs mt-2 text-slate-500">Study time: {timeSpentDisplay}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                        <div className="xl:col-span-8 space-y-6">
                            <div className="card p-6 relative overflow-hidden">
                                <div className="absolute right-6 top-6 text-slate-200 dark:text-slate-700">
                                    <Trophy className="w-16 h-16" />
                                </div>
                                <p className="text-xs font-black tracking-wide text-primary-500 uppercase">Daily Quest</p>
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white mt-1">
                                    {primaryQuest ? (primaryQuest.taskType || 'Master the quest').replace(/_/g, ' ') : 'No quest yet'}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">
                                    Hoan thanh quest hom nay de nhan thuong va tang cap nhanh hon.
                                </p>
                                <div className="mt-5 h-3 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-primary-500 to-amber-400"
                                        style={{ width: `${primaryQuestProgress}%` }}
                                    />
                                </div>
                                <div className="mt-4 flex items-center justify-between gap-3">
                                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                                        {questCompletedCount} / {questTotalCount} quests completed
                                    </p>
                                    <Link to="/quests" className="btn-primary inline-flex items-center gap-2">
                                        Continue Quest
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            </div>

                            {nextLesson ? (
                                <div className="card overflow-hidden flex flex-col md:flex-row">
                                    <div className="md:w-[40%] min-h-[260px] bg-cover bg-center" style={{ backgroundImage: `url('${NEXT_LESSON_IMAGE}')` }} />
                                    <div className="p-6 md:p-8 flex-1">
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">Intermediate</span>
                                            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold inline-flex items-center gap-1">
                                                <Clock className="w-3.5 h-3.5" />
                                                15 min
                                            </span>
                                        </div>
                                        <h3 className="text-4xl font-black leading-tight text-slate-900 dark:text-white">
                                            {nextLesson.lessonTitle || `Bai hoc #${nextLesson.lessonId}`}
                                        </h3>
                                        <p className="mt-3 text-slate-500 dark:text-slate-400 text-lg">
                                            Learn with practical examples and quick quizzes.
                                        </p>
                                        <button
                                            onClick={handleContinueLearning}
                                            className="mt-6 rounded-full px-6 py-3 bg-black text-white font-bold inline-flex items-center gap-2 hover:bg-slate-800 transition-colors"
                                        >
                                            <PlayCircle className="w-5 h-5" />
                                            Start Lesson Now
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    to="/lessons"
                                    className="card p-8 min-h-[280px] flex flex-col items-center justify-center text-center hover:border-primary-500/30"
                                >
                                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                        <BookOpen className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <p className="mt-4 text-slate-500 dark:text-slate-400">
                                        Chua co bai hoc dang hoc, bat dau ngay!
                                    </p>
                                </Link>
                            )}
                        </div>

                        <div className="xl:col-span-4 space-y-6">
                            <div className="card p-6">
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">Leaderboard</h3>
                                    <Link to="/leaderboard" className="text-sm font-bold text-primary-500">See all</Link>
                                </div>
                                <div className="space-y-3">
                                    {top5.length > 0 ? top5.slice(0, 4).map((entry, index) => {
                                        const isCurrentUser = entry.userId === user?.id
                                        return (
                                            <div key={entry.userId} className={`flex items-center gap-3 p-3 rounded-xl ${isCurrentUser ? 'bg-amber-50 border border-amber-200' : 'bg-slate-50 dark:bg-slate-800/60'}`}>
                                                <span className="w-6 text-center font-black text-slate-400">{index + 1}</span>
                                                <div className="size-10 rounded-full overflow-hidden bg-gradient-to-br from-primary-500 to-purple-500 text-white grid place-items-center font-bold">
                                                    {entry.avatarUrl ? <img src={entry.avatarUrl} alt="" className="size-full object-cover" /> : ((entry.fullName || entry.username)?.[0] ?? '?')}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-bold truncate text-slate-900 dark:text-white">{isCurrentUser ? 'You' : (entry.fullName || entry.username)}</p>
                                                    <p className="text-xs text-slate-500">{(entry.totalCoins ?? 0).toLocaleString()} XP</p>
                                                </div>
                                            </div>
                                        )
                                    }) : <p className="text-sm text-slate-500">Chua co du lieu xep hang.</p>}
                                </div>
                            </div>

                            <div className="rounded-2xl p-6 bg-gradient-to-br from-violet-600 to-fuchsia-500 text-white">
                                <p className="text-xl font-black">Freeze Streak</p>
                                <p className="mt-2 text-violet-100">Protect your streak for one day if you miss a lesson.</p>
                                <Link to="/quests" className="mt-5 inline-flex items-center justify-center w-full rounded-full bg-white text-violet-700 font-bold py-2.5">
                                    Buy for 200 Gems
                                </Link>
                            </div>

                            <div className="card p-6">
                                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                    <CheckCircle2 className="w-4 h-4 text-amber-500" />
                                    Word of the day
                                </div>
                                <p className="text-3xl font-black mt-2 text-slate-900 dark:text-white">Serendipity</p>
                                <p className="mt-1 text-primary-500 italic">noun /ˌserənˈdipədi/</p>
                                <p className="mt-3 text-slate-500 dark:text-slate-400">
                                    Finding something good without looking for it.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Continue Learning</h2>
                            <Link to="/lessons" className="text-primary-500 font-bold">View all</Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {learningItems.length > 0 ? (
                                learningItems.map((item, idx) => (
                                    <Link key={`${item.id}-${idx}`} to={item.lessonId ? `/lessons/${item.lessonId}` : '/lessons'} className="card p-5 hover:border-primary-500/30">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.lessonTitle || `Bai hoc #${item.lessonId}`}</p>
                                        <p className="text-xs text-slate-500 mt-1">{item.completionPercentage ?? 0}% completed</p>
                                        <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                            <div className="h-full bg-primary-500" style={{ width: `${item.completionPercentage ?? 0}%` }} />
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="card p-5 md:col-span-3 text-center text-sm text-slate-500 dark:text-slate-400">
                                    Chua co tien do hoc tap de hien thi. Bam vao bai hoc de bat dau.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
