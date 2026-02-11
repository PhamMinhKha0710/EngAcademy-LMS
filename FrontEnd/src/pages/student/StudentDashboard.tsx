import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
    Flame,
    Coins,
    BookOpen,
    Trophy,
    Target,
    ChevronRight,
    Loader2,
    Star,
    Clock,
    CheckCircle,
    Circle,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { progressApi, ProgressResponse } from '../../services/api/progressApi'
import { questApi, DailyQuestResponse } from '../../services/api/questApi'
import { leaderboardApi, LeaderboardEntry } from '../../services/api/leaderboardApi'
import StatCard from '../../components/ui/StatCard'
import ProgressBar from '../../components/ui/ProgressBar'

interface ProgressStats {
    completedLessons: number
    totalLessons: number
    averageScore: number
    totalTimeSpent: number
}

export default function StudentDashboard() {
    const user = useAuthStore((s) => s.user)

    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<ProgressStats | null>(null)
    const [quest, setQuest] = useState<DailyQuestResponse | null>(null)
    const [inProgress, setInProgress] = useState<ProgressResponse[]>([])
    const [top5, setTop5] = useState<LeaderboardEntry[]>([])

    useEffect(() => {
        if (!user?.id) return

        const fetchData = async () => {
            setLoading(true)
            try {
                const [statsData, questData, inProgressData, leaderboardData] =
                    await Promise.allSettled([
                        progressApi.getStats(user.id),
                        questApi.getToday(),
                        progressApi.getInProgress(user.id),
                        leaderboardApi.getTop(5),
                    ])

                if (statsData.status === 'fulfilled') {
                    setStats(statsData.value as unknown as ProgressStats)
                }
                if (questData.status === 'fulfilled') {
                    setQuest(questData.value)
                }
                if (inProgressData.status === 'fulfilled') {
                    setInProgress((inProgressData.value as ProgressResponse[]).slice(0, 4))
                }
                if (leaderboardData.status === 'fulfilled') {
                    setTop5(leaderboardData.value)
                }
            } catch (err) {
                console.error('Failed to load dashboard data:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user?.id])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
        )
    }

    const completedQuestTasks = quest?.tasks?.filter((t) => t.completed).length ?? 0
    const totalQuestTasks = quest?.tasks?.length ?? 0
    const questProgress =
        totalQuestTasks > 0 ? Math.round((completedQuestTasks / totalQuestTasks) * 100) : 0

    const rankMedals = ['🥇', '🥈', '🥉']

    return (
        <div className="p-6 lg:p-8 space-y-8">
            {/* Welcome */}
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                    Xin chào, {user?.fullName || 'Học sinh'}!
                </h1>
                <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Hãy tiếp tục hành trình học tập của bạn hôm nay.
                </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                    icon={<Flame className="w-6 h-6" />}
                    label="Chuỗi ngày học"
                    value={`${user?.streakDays ?? 0} ngày`}
                    color="text-orange-500"
                />
                <StatCard
                    icon={<Coins className="w-6 h-6" />}
                    label="Xu tích lũy"
                    value={(user?.coins ?? 0).toLocaleString()}
                    color="text-yellow-500"
                />
                <StatCard
                    icon={<BookOpen className="w-6 h-6" />}
                    label="Bài học hoàn thành"
                    value={stats?.completedLessons ?? 0}
                    color="text-emerald-500"
                />
                <StatCard
                    icon={<Star className="w-6 h-6" />}
                    label="Điểm trung bình"
                    value={stats?.averageScore != null ? `${Math.round(stats.averageScore)}%` : '--'}
                    color="text-purple-500"
                />
            </div>

            {/* Daily Quest + Continue Learning */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Daily Quest */}
                <div className="card p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2
                            className="text-lg font-semibold flex items-center gap-2"
                            style={{ color: 'var(--color-text)' }}
                        >
                            <Target className="w-5 h-5 text-blue-500" />
                            Nhiệm vụ hôm nay
                        </h2>
                        {quest?.isCompleted && (
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-green-500/15 text-green-400">
                                Hoàn thành!
                            </span>
                        )}
                    </div>

                    {quest && quest.tasks.length > 0 ? (
                        <>
                            <div className="space-y-3">
                                {quest.tasks.map((task) => (
                                    <div key={task.id} className="flex items-start gap-3">
                                        {task.completed ? (
                                            <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                                        ) : (
                                            <Circle
                                                className="w-5 h-5 shrink-0 mt-0.5"
                                                style={{ color: 'var(--color-text-secondary)' }}
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p
                                                className={`text-sm ${task.completed ? 'line-through opacity-60' : ''}`}
                                                style={{ color: 'var(--color-text)' }}
                                            >
                                                {task.taskType}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <ProgressBar
                                                    value={
                                                        task.targetCount > 0
                                                            ? (task.currentProgress /
                                                                  task.targetCount) *
                                                              100
                                                            : 0
                                                    }
                                                    height="h-1.5"
                                                />
                                                <span
                                                    className="text-xs shrink-0"
                                                    style={{
                                                        color: 'var(--color-text-secondary)',
                                                    }}
                                                >
                                                    {task.currentProgress}/{task.targetCount}
                                                </span>
                                            </div>
                                            <p className="text-xs mt-1 flex items-center gap-1 text-yellow-400">
                                                <Coins className="w-3 h-3" />+{task.coins} xu
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--color-border)' }}>
                                <div className="flex justify-between text-sm mb-2">
                                    <span style={{ color: 'var(--color-text-secondary)' }}>
                                        Tiến độ
                                    </span>
                                    <span style={{ color: 'var(--color-text)' }}>
                                        {completedQuestTasks}/{totalQuestTasks}
                                    </span>
                                </div>
                                <ProgressBar
                                    value={questProgress}
                                    color="from-blue-500 to-emerald-500"
                                />
                            </div>
                        </>
                    ) : (
                        <p
                            className="text-sm py-8 text-center"
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            Không có nhiệm vụ nào hôm nay.
                        </p>
                    )}
                </div>

                {/* Continue Learning */}
                <div className="card p-6 lg:col-span-2">
                    <div className="flex items-center justify-between mb-5">
                        <h2
                            className="text-lg font-semibold flex items-center gap-2"
                            style={{ color: 'var(--color-text)' }}
                        >
                            <BookOpen className="w-5 h-5 text-emerald-500" />
                            Tiếp tục học
                        </h2>
                        <Link
                            to="/lessons"
                            className="text-sm text-blue-500 hover:text-blue-400 flex items-center gap-1"
                        >
                            Xem tất cả <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {inProgress.length > 0 ? (
                        <div className="grid sm:grid-cols-2 gap-4">
                            {inProgress.map((item) => (
                                <Link
                                    key={item.id}
                                    to={`/lessons/${item.lessonId}`}
                                    className="block p-4 rounded-xl transition-colors hover:opacity-80"
                                    style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
                                            <BookOpen className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3
                                                className="font-medium text-sm truncate"
                                                style={{ color: 'var(--color-text)' }}
                                            >
                                                {item.lessonTitle || `Bài học #${item.lessonId}`}
                                            </h3>
                                            <div className="flex items-center gap-2 mt-1.5">
                                                <Clock
                                                    className="w-3.5 h-3.5"
                                                    style={{
                                                        color: 'var(--color-text-secondary)',
                                                    }}
                                                />
                                                <span
                                                    className="text-xs"
                                                    style={{
                                                        color: 'var(--color-text-secondary)',
                                                    }}
                                                >
                                                    {item.lastAccessed
                                                        ? new Date(
                                                              item.lastAccessed
                                                          ).toLocaleDateString('vi-VN')
                                                        : 'Chưa truy cập'}
                                                </span>
                                            </div>
                                            <div className="mt-2">
                                                <ProgressBar
                                                    value={item.completionPercentage ?? 0}
                                                    height="h-1.5"
                                                />
                                                <p
                                                    className="text-xs mt-1"
                                                    style={{
                                                        color: 'var(--color-text-secondary)',
                                                    }}
                                                >
                                                    {item.completionPercentage ?? 0}% hoàn thành
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p
                            className="text-sm py-8 text-center"
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            Bạn chưa bắt đầu bài học nào.{' '}
                            <Link to="/lessons" className="text-blue-500 hover:underline">
                                Khám phá ngay!
                            </Link>
                        </p>
                    )}
                </div>
            </div>

            {/* Leaderboard Preview */}
            <div className="card p-6">
                <div className="flex items-center justify-between mb-5">
                    <h2
                        className="text-lg font-semibold flex items-center gap-2"
                        style={{ color: 'var(--color-text)' }}
                    >
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        Bảng xếp hạng
                    </h2>
                    <Link
                        to="/leaderboard"
                        className="text-sm text-blue-500 hover:text-blue-400 flex items-center gap-1"
                    >
                        Xem tất cả <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>

                {top5.length > 0 ? (
                    <div className="space-y-3">
                        {top5.map((entry, index) => (
                            <div
                                key={entry.userId}
                                className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                                    index === 0 ? 'bg-yellow-500/10' : ''
                                }`}
                                style={
                                    index !== 0
                                        ? { backgroundColor: 'var(--color-bg-tertiary)' }
                                        : undefined
                                }
                            >
                                <span className="text-xl w-8 text-center">
                                    {index < 3 ? rankMedals[index] : `#${index + 1}`}
                                </span>
                                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold shrink-0">
                                    {(entry.fullName || entry.username)?.[0]?.toUpperCase() || '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p
                                        className="font-medium text-sm truncate"
                                        style={{ color: 'var(--color-text)' }}
                                    >
                                        {entry.fullName || entry.username}
                                    </p>
                                    <p
                                        className="text-xs"
                                        style={{ color: 'var(--color-text-secondary)' }}
                                    >
                                        {entry.streakDays ?? 0} ngày streak
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold text-sm text-yellow-400">
                                        {(entry.totalCoins ?? 0).toLocaleString()}
                                    </p>
                                    <p
                                        className="text-xs"
                                        style={{ color: 'var(--color-text-secondary)' }}
                                    >
                                        xu
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p
                        className="text-sm py-6 text-center"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        Chưa có dữ liệu xếp hạng.
                    </p>
                )}
            </div>
        </div>
    )
}
