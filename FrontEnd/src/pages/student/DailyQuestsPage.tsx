import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    ArrowRight,
    BookOpen,
    CheckCircle2,
    Clock3,
    FileText,
    Flame,
    Loader2,
    Sparkles,
    Target,
} from 'lucide-react'
import { DailyQuestResponse, QuestTask, questApi } from '../../services/api/questApi'
import EmptyState from '../../components/ui/EmptyState'
import { useAuthStore } from '../../store/authStore'
import { userApi } from '../../services/api/userApi'
import DailyStreakCelebrationOverlay from '../../components/ui/DailyStreakCelebrationOverlay'
import LevelUpCelebrationNotification from '../../components/ui/LevelUpCelebrationNotification'

type TaskMeta = {
    title: string
    description: string
    route: string
    actionLabel: string
    icon: React.ReactNode
    progressColor: string
    rewardLabel: string
}

const getTaskMeta = (taskType: string): TaskMeta => {
    switch (taskType) {
        case 'LEARN_VOCAB':
            return {
                title: 'Nhiem vu Tu vung',
                description: 'Hoc them tu moi trong ngay.',
                route: '/vocabulary',
                actionLabel: 'Di den Tu vung',
                icon: <BookOpen className="w-5 h-5" />,
                progressColor: 'from-sky-500 to-blue-600',
                rewardLabel: '+10 Xu',
            }
        case 'COMPLETE_LESSON':
            return {
                title: 'Hoan thanh bai hoc',
                description: 'Hoan thanh it nhat 1 bai hoc.',
                route: '/lessons',
                actionLabel: 'Di den Bai hoc',
                icon: <FileText className="w-5 h-5" />,
                progressColor: 'from-violet-500 to-fuchsia-600',
                rewardLabel: '+25 Xu',
            }
        case 'SCORE_EXAM':
            return {
                title: 'Chinh phuc bai thi',
                description: 'Dat diem muc tieu trong bai thi.',
                route: '/exams',
                actionLabel: 'Di den Bai thi',
                icon: <Target className="w-5 h-5" />,
                progressColor: 'from-amber-500 to-orange-600',
                rewardLabel: '+50 Xu',
            }
        default:
            return {
                title: 'Nhiem vu trong ngay',
                description: 'Hoan thanh nhiem vu de nhan thuong.',
                route: '/dashboard',
                actionLabel: 'Xem Dashboard',
                icon: <Sparkles className="w-5 h-5" />,
                progressColor: 'from-emerald-500 to-teal-600',
                rewardLabel: '+5 Xu',
            }
    }
}

const getTaskCurrent = (task: QuestTask) => task.currentProgress ?? task.currentCount ?? 0
const isTaskDone = (task: QuestTask) => Boolean(task.completed ?? task.isCompleted)
const isQuestDone = (quest: DailyQuestResponse) => Boolean(quest.completed ?? quest.isCompleted)

export default function DailyQuestsPage() {
    const navigate = useNavigate()
    const user = useAuthStore((s) => s.user)
    const setUser = useAuthStore((s) => s.setUser)
    const [quest, setQuest] = useState<DailyQuestResponse | null>(null)
    const [history, setHistory] = useState<DailyQuestResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null)
    const [completingQuest, setCompletingQuest] = useState(false)
    const [showStreakOverlay, setShowStreakOverlay] = useState(false)
    const [showLevelUpOverlay, setShowLevelUpOverlay] = useState(false)
    const [overlayStreakDays, setOverlayStreakDays] = useState(0)
    const [levelInfo, setLevelInfo] = useState({
        previousLevel: 1,
        newLevel: 1,
        xpGained: 0,
        currentXp: 0,
        levelXpCap: 500,
    })

    const fetchData = async () => {
        try {
            setLoading(true)
            setError(null)
            const [todayResult, historyResult] = await Promise.allSettled([
                questApi.getToday(),
                questApi.getHistory(),
            ])

            if (todayResult.status === 'fulfilled') setQuest(todayResult.value)
            else throw todayResult.reason

            if (historyResult.status === 'fulfilled') {
                setHistory(historyResult.value || [])
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Khong the tai nhiem vu hom nay')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void fetchData()
    }, [])

    const summary = useMemo(() => {
        if (!quest?.tasks?.length) {
            return { completed: 0, total: 0, percent: 0, remain: 0 }
        }
        const total = quest.tasks.length
        const completed = quest.tasks.filter(isTaskDone).length
        const percent = Math.round((completed / total) * 100)
        return { completed, total, percent, remain: Math.max(total - completed, 0) }
    }, [quest])

    const resetTime = useMemo(() => {
        const now = new Date()
        const tomorrow = new Date(now)
        tomorrow.setDate(now.getDate() + 1)
        tomorrow.setHours(0, 0, 0, 0)
        const ms = tomorrow.getTime() - now.getTime()
        const hours = Math.floor(ms / (1000 * 60 * 60))
        const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60))
        return `${hours}h ${mins}m`
    }, [])

    const handleTaskProgress = async (task: QuestTask) => {
        try {
            setUpdatingTaskId(task.id)
            const wasDone = isTaskDone(task)
            const current = getTaskCurrent(task)
            const nextProgress = Math.min(task.targetCount ?? current, current + 1)
            const updated = await questApi.updateTaskProgress(task.id, nextProgress)
            setQuest(updated)

            const updatedTask = updated.tasks.find((item) => item.id === task.id)
            const nowDone = updatedTask ? isTaskDone(updatedTask) : false
            const streakKey = `streak_overlay_task_${user?.id ?? 'guest'}_${task.id}_${updated.questDate}`
            if (!wasDone && nowDone && !sessionStorage.getItem(streakKey)) {
                sessionStorage.setItem(streakKey, '1')
                setOverlayStreakDays(user?.streakDays ?? 0)
                setShowStreakOverlay(true)
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Cap nhat tien do that bai')
        } finally {
            setUpdatingTaskId(null)
        }
    }

    const handleMarkCompleted = async (task: QuestTask) => {
        try {
            setUpdatingTaskId(task.id)
            const wasDone = isTaskDone(task)
            const updated = await questApi.updateTaskProgress(task.id, task.targetCount)
            setQuest(updated)

            const updatedTask = updated.tasks.find((item) => item.id === task.id)
            const nowDone = updatedTask ? isTaskDone(updatedTask) : false
            const streakKey = `streak_overlay_task_${user?.id ?? 'guest'}_${task.id}_${updated.questDate}`
            if (!wasDone && nowDone && !sessionStorage.getItem(streakKey)) {
                sessionStorage.setItem(streakKey, '1')
                setOverlayStreakDays(user?.streakDays ?? 0)
                setShowStreakOverlay(true)
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Khong the danh dau hoan thanh task')
        } finally {
            setUpdatingTaskId(null)
        }
    }

    const handleCompleteQuest = async () => {
        if (!quest) return
        try {
            setCompletingQuest(true)
            const beforeCoins = user?.coins ?? 0
            const previousLevel = Math.floor(beforeCoins / 500) + 1
            const updated = await questApi.completeQuest()
            setQuest(updated)
            setHistory((prev) => [updated, ...prev])

            const refreshedUser = await userApi.getMe()
            setUser(refreshedUser)
            const afterCoins = refreshedUser.coins ?? beforeCoins
            const newLevel = Math.floor(afterCoins / 500) + 1

            if (newLevel > previousLevel) {
                const levelKey = `level_up_overlay_${refreshedUser.id}_${updated.questDate}_${newLevel}`
                if (!sessionStorage.getItem(levelKey)) {
                    sessionStorage.setItem(levelKey, '1')
                    setLevelInfo({
                        previousLevel,
                        newLevel,
                        xpGained: Math.max(afterCoins - beforeCoins, 0),
                        currentXp: afterCoins % 500,
                        levelXpCap: 500,
                    })
                    setShowLevelUpOverlay(true)
                }
            }
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Khong the hoan thanh quest hom nay')
        } finally {
            setCompletingQuest(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--color-primary)]" />
            </div>
        )
    }

    if (!quest) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <EmptyState
                    icon={<Target className="w-8 h-8" />}
                    title="Khong tai duoc nhiem vu hom nay"
                    description={error || 'Vui long thu lai sau it phut.'}
                />
            </div>
        )
    }

    const questCompleted = isQuestDone(quest)

    return (
        <>
            <DailyStreakCelebrationOverlay
                open={showStreakOverlay}
                streakDays={overlayStreakDays}
                onClose={() => setShowStreakOverlay(false)}
                onContinue={() => {
                    setShowStreakOverlay(false)
                    navigate('/lessons')
                }}
                onShare={() => setShowStreakOverlay(false)}
            />

            <LevelUpCelebrationNotification
                open={showLevelUpOverlay}
                previousLevel={levelInfo.previousLevel}
                newLevel={levelInfo.newLevel}
                xpGained={levelInfo.xpGained}
                currentXp={levelInfo.currentXp}
                levelXpCap={levelInfo.levelXpCap}
                onClose={() => setShowLevelUpOverlay(false)}
                onPrimaryAction={() => {
                    setShowLevelUpOverlay(false)
                    navigate('/dashboard')
                }}
            />

            <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
            <section className="card p-6 md:p-8">
                <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl md:text-4xl font-black" style={{ color: 'var(--color-text)' }}>
                                Daily Quests
                            </h1>
                            <Sparkles className="w-7 h-7" style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <p className="mt-2 text-sm md:text-base max-w-xl" style={{ color: 'var(--color-text-secondary)' }}>
                            Hoan thanh tat ca quest trong ngay de mo khoa thuong them va giu chuoi hoc tap.
                        </p>
                    </div>
                    <div className="rounded-2xl border px-5 py-4 min-w-[210px]" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                            Resets in
                        </p>
                        <p className="mt-1 text-2xl font-black flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                            <Clock3 className="w-5 h-5" />
                            {resetTime}
                        </p>
                    </div>
                </div>
            </section>

            <section className="card p-6 md:p-7">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                    <div>
                        <h2 className="text-xl font-black" style={{ color: 'var(--color-text)' }}>
                            Goal Progress
                        </h2>
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            Con {summary.remain} quest nua de hoan tat muc tieu hom nay.
                        </p>
                    </div>
                    <span className="text-3xl font-black" style={{ color: 'var(--color-primary)' }}>
                        {summary.completed}/{summary.total}
                    </span>
                </div>
                <div className="h-4 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-tertiary)' }}>
                    <div
                        className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-[var(--color-primary)] to-amber-400"
                        style={{ width: `${summary.percent}%` }}
                    />
                </div>
                <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                        onClick={handleCompleteQuest}
                        disabled={summary.remain > 0 || questCompleted || completingQuest}
                        className="btn-primary disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {completingQuest ? 'Dang xu ly...' : questCompleted ? 'Da hoan thanh quest hom nay' : 'Nhan thuong quest hom nay'}
                    </button>
                    {error && (
                        <span className="text-sm text-red-500">{error}</span>
                    )}
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {quest.tasks?.map((task) => {
                    const meta = getTaskMeta(task.taskType)
                    const current = getTaskCurrent(task)
                    const done = isTaskDone(task)
                    const percent = task.targetCount > 0 ? Math.min((current / task.targetCount) * 100, 100) : 0
                    const taskBusy = updatingTaskId === task.id

                    return (
                        <article key={task.id} className="card p-5 flex flex-col border-2" style={{ borderColor: done ? 'color-mix(in srgb, var(--color-success) 30%, var(--color-border))' : 'var(--color-border)' }}>
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-primary)' }}>
                                    {meta.icon}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] px-2.5 py-1 rounded-full font-bold bg-amber-100 text-amber-700">
                                        {meta.rewardLabel}
                                    </span>
                                    <span
                                        className={`text-xs px-3 py-1 rounded-full font-semibold ${
                                            done
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-violet-100 text-violet-700'
                                        }`}
                                    >
                                        {done ? 'Da hoan thanh' : 'Dang thuc hien'}
                                    </span>
                                </div>
                            </div>

                            <h3 className="mt-4 text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                                {meta.title}
                            </h3>
                            <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                {meta.description}
                            </p>

                            <div className="mt-4">
                                <div className="flex items-center justify-between text-xs font-semibold mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                                    <span>Tien do</span>
                                    <span>{Math.min(current, task.targetCount)}/{task.targetCount}</span>
                                </div>
                                <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-tertiary)' }}>
                                    <div
                                        className={`h-full rounded-full bg-gradient-to-r ${meta.progressColor}`}
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                            </div>

                            <div className="mt-5 grid grid-cols-1 gap-2">
                                <button
                                    onClick={() => navigate(meta.route)}
                                    className="btn-primary w-full text-sm rounded-xl"
                                >
                                    <span className="inline-flex items-center gap-1.5">
                                        {meta.actionLabel}
                                        <ArrowRight className="w-4 h-4" />
                                    </span>
                                </button>
                                {done ? (
                                    <button
                                        disabled
                                        className="btn-secondary w-full text-sm opacity-80 cursor-not-allowed"
                                    >
                                        <span className="inline-flex items-center gap-1.5">
                                            <CheckCircle2 className="w-4 h-4" />
                                            Da nhan thuong task
                                        </span>
                                    </button>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => handleTaskProgress(task)}
                                            disabled={taskBusy}
                                            className="btn-secondary w-full text-sm rounded-xl"
                                        >
                                            {taskBusy ? 'Dang cap nhat...' : '+1 tien do'}
                                        </button>
                                        <button
                                            onClick={() => handleMarkCompleted(task)}
                                            disabled={taskBusy}
                                            className="btn-secondary w-full text-sm rounded-xl"
                                        >
                                            Hoan tat
                                        </button>
                                    </div>
                                )}
                            </div>
                        </article>
                    )
                })}
            </section>

            <section className="card p-6 md:p-7">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                    <Flame className="w-5 h-5 text-orange-500" />
                    Lich su quest gan day
                </h3>
                {history.length === 0 ? (
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        Chua co du lieu lich su.
                    </p>
                ) : (
                    <div className="space-y-2">
                        {history.slice(0, 5).map((item) => (
                            <div
                                key={`${item.id}-${item.questDate}`}
                                className="rounded-xl border px-4 py-3 flex items-center justify-between"
                                style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)' }}
                            >
                                <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                                    {new Date(item.questDate).toLocaleDateString('vi-VN')}
                                </span>
                                <span
                                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                        isQuestDone(item) ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'
                                    }`}
                                >
                                    {isQuestDone(item) ? 'Da hoan thanh' : 'Chua hoan thanh'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </section>
            </div>
        </>
    )
}
