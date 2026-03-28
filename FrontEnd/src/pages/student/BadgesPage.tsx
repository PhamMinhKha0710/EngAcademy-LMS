import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Award, Loader2, Calendar, RefreshCw } from 'lucide-react'
import { badgeApi, BadgeDTO, BadgeProgressDTO } from '../../services/api/badgeApi'
import { useAuthStore } from '../../store/authStore'
import { useToastStore } from '../../store/toastStore'
import EmptyState from '../../components/ui/EmptyState'
import ProgressBar from '../../components/ui/ProgressBar'

const BADGE_GROUPS = ['STREAK', 'LESSON', 'QUIZ', 'LEVEL', 'SPECIAL', 'SOCIAL'] as const

type BadgeWithProgress = BadgeDTO & {
    earnedAt?: string | null
    percentComplete?: number
}

export default function BadgesPage() {
    const { t } = useTranslation()
    const user = useAuthStore((s) => s.user)
    const { addToast } = useToastStore()
    const [definitions, setDefinitions] = useState<BadgeDTO[]>([])
    const [earned, setEarned] = useState<BadgeDTO[]>([])
    const [progress, setProgress] = useState<BadgeProgressDTO[]>([])
    const [loading, setLoading] = useState(true)
    const [checking, setChecking] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        if (!user?.id) return
        try {
            setLoading(true)
            setError(null)
            const [defs, earnedList, progressList] = await Promise.all([
                badgeApi.getDefinitions(),
                badgeApi.getUserEarned(user.id),
                badgeApi.getUserProgress(user.id),
            ])
            setDefinitions(defs)
            setEarned(earnedList)
            setProgress(progressList)
        } catch (err) {
            console.error('Failed to fetch badges:', err)
            setError(t('common.error'))
        } finally {
            setLoading(false)
        }
    }, [user?.id, t])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleCheckBadges = async () => {
        if (!user?.id) return
        try {
            setChecking(true)
            const res = await badgeApi.checkAndAward(user.id)
            await fetchData()
            if (res.newlyEarnedBadges?.length) {
                addToast({
                    type: 'success',
                    message: t('badges.earnedCount', { count: res.newlyEarnedBadges.length }),
                })
            }
        } catch (err) {
            console.error('Failed to check badges:', err)
            addToast({ type: 'error', message: t('common.error') })
        } finally {
            setChecking(false)
        }
    }

    const earnedMap = useMemo(() => {
        const m = new Map<string, BadgeDTO>()
        earned.forEach((b) => m.set(b.badgeKey, b))
        return m
    }, [earned])

    const progressMap = useMemo(() => {
        const m = new Map<string, BadgeProgressDTO>()
        progress.forEach((p) => m.set(p.badgeKey, p))
        return m
    }, [progress])

    const defKeys = useMemo(() => new Set(definitions.map((d) => d.badgeKey)), [definitions])

    const badgesByGroup = useMemo(() => {
        const grouped: Record<string, BadgeWithProgress[]> = {}
        BADGE_GROUPS.forEach((g) => (grouped[g] = []))
        definitions.forEach((def) => {
            const earnedBadge = earnedMap.get(def.badgeKey)
            const prog = progressMap.get(def.badgeKey)
            const item: BadgeWithProgress = {
                ...def,
                earnedAt: earnedBadge?.earnedAt ?? null,
                percentComplete: prog?.percentComplete ?? (earnedBadge ? 100 : 0),
            }
            if (grouped[def.groupName]) {
                grouped[def.groupName].push(item)
            }
        })
        // Thêm badge bí mật đã đạt (không có trong definitions)
        earned.forEach((eb) => {
            if (defKeys.has(eb.badgeKey)) return
            const item: BadgeWithProgress = {
                ...eb,
                earnedAt: eb.earnedAt ?? null,
                percentComplete: 100,
            }
            if (grouped[eb.groupName]) {
                grouped[eb.groupName].push(item)
            }
        })
        return grouped
    }, [definitions, earned, earnedMap, progressMap, defKeys])

    const totalEarned = earned.length
    const totalBadges = 24
    const hasDefinitions = definitions.length > 0

    const formatDate = (dateStr?: string | null) => {
        if (!dateStr) return '—'
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    }

    const getDifficultyKey = (d: string) => {
        switch (d) {
            case 'EASY': return 'badges.difficultyEasy'
            case 'MEDIUM': return 'badges.difficultyMedium'
            case 'HARD': return 'badges.difficultyHard'
            case 'LEGENDARY': return 'badges.difficultyLegendary'
            default: return 'badges.difficultyMedium'
        }
    }

    const getGroupKey = (g: string) => {
        switch (g) {
            case 'STREAK': return 'badges.groupStreak'
            case 'LESSON': return 'badges.groupLesson'
            case 'QUIZ': return 'badges.groupQuiz'
            case 'LEVEL': return 'badges.groupLevel'
            case 'SPECIAL': return 'badges.groupSpecial'
            case 'SOCIAL': return 'badges.groupSocial'
            default: return g
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                        {t('badges.title')}
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)' }}>{t('badges.subtitle')}</p>
                </div>
                <button
                    onClick={handleCheckBadges}
                    disabled={checking || !user?.id}
                    className="btn-primary flex items-center gap-2 shrink-0"
                >
                    {checking ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <RefreshCw className="w-4 h-4" />
                    )}
                    {t('badges.checkButton')}
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Summary */}
            {hasDefinitions && (
                <div className="card p-6 mb-8 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 flex items-center justify-center">
                        <Award className="w-7 h-7 text-yellow-500" />
                    </div>
                    <div>
                        <p className="text-3xl font-extrabold" style={{ color: 'var(--color-text)' }}>
                            {t('badges.earnedCountOf', { earned: totalEarned, total: totalBadges })}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            {t('badges.completeChallenges')}
                        </p>
                    </div>
                </div>
            )}

            {/* Empty state - no definitions */}
            {!hasDefinitions && !error && (
                <EmptyState
                    icon={<Award className="w-8 h-8" />}
                    title={t('badges.noBadges')}
                    description={t('badges.completeChallenges')}
                />
            )}

            {/* Badge groups */}
            {hasDefinitions && (
                <div className="space-y-10">
                    {BADGE_GROUPS.map((groupKey) => {
                        const items = badgesByGroup[groupKey] || []
                        if (items.length === 0) return null

                        return (
                            <section key={groupKey}>
                                <h2
                                    className="text-sm font-semibold uppercase tracking-wider mb-4"
                                    style={{ color: 'var(--color-text-secondary)' }}
                                >
                                    {t(getGroupKey(groupKey))}
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {items.map((badge) => {
                                        const isEarned = !!badge.earnedAt
                                        return (
                                            <div
                                                key={badge.badgeKey}
                                                className={`card p-5 group transition-all duration-300 ${
                                                    isEarned
                                                        ? 'ring-2 ring-amber-400/50 dark:ring-amber-500/30 bg-amber-50/30 dark:bg-amber-900/10'
                                                        : 'opacity-90 hover:opacity-100'
                                                }`}
                                            >
                                                <div className="flex items-start gap-3">
                                                    <div
                                                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-2xl ${
                                                            isEarned
                                                                ? 'bg-amber-100 dark:bg-amber-900/30'
                                                                : 'bg-slate-100 dark:bg-slate-800'
                                                        }`}
                                                    >
                                                        {badge.iconEmoji || '🏅'}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3
                                                            className="font-semibold text-sm truncate"
                                                            style={{ color: 'var(--color-text)' }}
                                                        >
                                                            {badge.name}
                                                        </h3>
                                                        <p
                                                            className="text-xs mt-0.5 line-clamp-2"
                                                            style={{ color: 'var(--color-text-secondary)' }}
                                                        >
                                                            {badge.description}
                                                        </p>
                                                        <span
                                                            className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                                                badge.difficulty === 'LEGENDARY'
                                                                    ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                                                    : badge.difficulty === 'HARD'
                                                                      ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300'
                                                                      : badge.difficulty === 'MEDIUM'
                                                                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                                                        : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                                            }`}
                                                        >
                                                            {t(getDifficultyKey(badge.difficulty))}
                                                        </span>
                                                    </div>
                                                </div>

                                                {isEarned ? (
                                                    <div
                                                        className="mt-4 pt-3 border-t flex items-center gap-2 text-xs"
                                                        style={{
                                                            borderColor: 'var(--color-border)',
                                                            color: 'var(--color-text-secondary)',
                                                        }}
                                                    >
                                                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                                                        {t('badges.earnedOn')} {formatDate(badge.earnedAt)}
                                                    </div>
                                                ) : (
                                                    <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                                                        <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--color-text-secondary)' }}>
                                                            <span>{t('badges.locked')}</span>
                                                            <span>{Math.round(badge.percentComplete ?? 0)}%</span>
                                                        </div>
                                                        <ProgressBar
                                                            value={badge.percentComplete ?? 0}
                                                            height="h-1.5"
                                                            variant="gradient"
                                                            gradientStart="from-amber-400"
                                                            gradientEnd="to-amber-600"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </section>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
