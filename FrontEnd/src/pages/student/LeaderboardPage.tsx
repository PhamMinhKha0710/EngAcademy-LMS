import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Trophy, Medal, Flame, Coins, Loader2, Crown, User } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { leaderboardApi, LeaderboardEntry } from '../../services/api/leaderboardApi'
import EmptyState from '../../components/ui/EmptyState'

type TabKey = 'global' | 'coins' | 'streak'


export default function LeaderboardPage() {
    const { t } = useTranslation()
    const { user, fetchCurrentUser } = useAuthStore()

    const [activeTab, setActiveTab] = useState<TabKey>('global')
    const tabs: { key: TabKey; label: string; icon: typeof Trophy }[] = [
        { key: 'global', label: t('leaderboard.tabGlobal'), icon: Trophy },
        { key: 'coins', label: t('leaderboard.tabCoins'), icon: Coins },
        { key: 'streak', label: t('leaderboard.tabStreak'), icon: Flame },
    ]
    const [entries, setEntries] = useState<LeaderboardEntry[]>([])
    const [myRank, setMyRank] = useState<LeaderboardEntry | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Fetch my rank once
    useEffect(() => {
        void fetchCurrentUser()
    }, [fetchCurrentUser])

    useEffect(() => {
        const fetchMyRank = async () => {
            try {
                const data = await leaderboardApi.getMyRank()
                setMyRank(data)
            } catch (err) {
                console.error('Failed to fetch rank:', err)
            }
        }
        fetchMyRank()
    }, [])

    // Fetch leaderboard data based on tab
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                setError(null)
                let data: LeaderboardEntry[] = []

                switch (activeTab) {
                    case 'global':
                        data = await leaderboardApi.getGlobal(50)
                        break
                    case 'coins': {
                        const page = await leaderboardApi.getByCoins()
                        data = page?.content || []
                        break
                    }
                    case 'streak':
                        data = await leaderboardApi.getByStreak(50)
                        break
                }

                setEntries(data || [])
            } catch (err) {
                console.error('Failed to fetch leaderboard:', err)
                setError(t('leaderboard.loadingError'))
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [activeTab, t])

    const getMetricValue = (entry: LeaderboardEntry) => {
        switch (activeTab) {
            case 'coins':
                return t('leaderboard.coinsMetric', { count: entry.totalCoins ?? 0 })
            case 'streak':
                return t('leaderboard.daysMetric', { count: entry.streakDays ?? 0 })
            default:
                return t('leaderboard.coinsMetric', { count: entry.totalCoins ?? 0 })
        }
    }

    const getMedalColor = (rank: number) => {
        if (rank === 1) return { bg: 'from-yellow-400 to-amber-500', text: 'text-yellow-400', border: 'border-yellow-500/40' }
        if (rank === 2) return { bg: 'from-gray-300 to-gray-400', text: 'text-gray-300', border: 'border-gray-400/40' }
        if (rank === 3) return { bg: 'from-amber-600 to-amber-700', text: 'text-amber-600', border: 'border-amber-600/40' }
        return { bg: '', text: 'text-slate-400', border: 'border-transparent' }
    }

    const rankedEntries = entries.map((entry, index) => ({ ...entry, computedRank: index + 1 }))

    const top3 = rankedEntries.slice(0, 3)
    const rest = rankedEntries.slice(3)

    // Reorder for podium display: 2nd, 1st, 3rd
    const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1
                    className="text-2xl md:text-3xl font-bold mb-2"
                    style={{ color: 'var(--color-text)' }}
                >
                    {t('leaderboard.title')}
                </h1>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                    {t('leaderboard.subtitle')}
                </p>
            </div>

            {/* My rank card */}
            {myRank && (
                <div
                    className="card p-4 mb-6 flex items-center gap-4 border-blue-500/30"
                    style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(16,185,129,0.06) 100%)' }}
                >
                    <div className="w-10 h-10 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-500 font-bold text-sm">
                        #{myRank.rank ?? '—'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                            {myRank.fullName || myRank.username}
                        </p>
                        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                            {t('leaderboard.yourRanking')}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-blue-500">
                            {getMetricValue(myRank)}
                        </p>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div
                className="flex rounded-xl p-1 mb-8"
                style={{ backgroundColor: 'var(--color-bg-secondary)' }}
            >
                {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.key
                    return (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isActive
                                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
                                    : 'hover:bg-slate-700/30'
                            }`}
                            style={!isActive ? { color: 'var(--color-text-secondary)' } : undefined}
                        >
                            <Icon className="w-4 h-4" />
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    )
                })}
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            )}

            {/* Empty */}
            {!loading && entries.length === 0 && (
                <EmptyState
                    icon={<Trophy className="w-8 h-8" />}
                    title={t('leaderboard.noDataTitle')}
                    description={t('leaderboard.noDataDesc')}
                />
            )}

            {!loading && entries.length > 0 && (
                <>
                    {/* Podium - Top 3 */}
                    {top3.length >= 3 && (
                        <div className="grid grid-cols-3 gap-3 mb-8 items-end">
                            {podiumOrder.map((entry) => {
                                const actualRank = entry.computedRank
                                const medal = getMedalColor(actualRank)
                                const isFirst = actualRank === 1
                                const isMe = entry.userId === user?.id

                                return (
                                    <div
                                        key={entry.userId}
                                        className={`card flex flex-col items-center text-center border ${medal.border} ${
                                            isFirst ? 'py-8 px-3' : 'py-6 px-3'
                                        } ${isMe ? 'ring-2 ring-blue-500/30' : ''}`}
                                    >
                                        {/* Medal */}
                                        <div className="relative mb-3">
                                            <div
                                                className={`w-14 h-14 ${isFirst ? 'w-18 h-18' : ''} rounded-full bg-gradient-to-br ${medal.bg} flex items-center justify-center shadow-lg`}
                                                style={isFirst ? { width: '4.5rem', height: '4.5rem' } : undefined}
                                            >
                                                {actualRank === 1 ? (
                                                    <Crown className="w-7 h-7 text-white" />
                                                ) : (
                                                    <Medal className={`w-6 h-6 text-white`} />
                                                )}
                                            </div>
                                            <span
                                                className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-gradient-to-br ${medal.bg} text-white shadow-md`}
                                            >
                                                {actualRank}
                                            </span>
                                        </div>

                                        {/* Avatar placeholder */}
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center mb-2"
                                            style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                                        >
                                            {entry.avatarUrl ? (
                                                <img
                                                    src={entry.avatarUrl}
                                                    alt={entry.username}
                                                    className="w-10 h-10 rounded-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                                            )}
                                        </div>

                                        {/* Name */}
                                        <p
                                            className={`font-semibold text-sm truncate w-full ${isMe ? 'text-blue-500' : ''}`}
                                            style={!isMe ? { color: 'var(--color-text)' } : undefined}
                                        >
                                            {entry.fullName || entry.username}
                                        </p>

                                        {/* Metric */}
                                        <p className={`text-sm font-bold mt-1 ${medal.text}`}>
                                            {getMetricValue(entry)}
                                        </p>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* If less than 3, show as list */}
                    {top3.length < 3 && top3.length > 0 && (
                        <div className="space-y-2 mb-6">
                            {top3.map((entry) => {
                                const medal = getMedalColor(entry.computedRank)
                                const isMe = entry.userId === user?.id
                                return (
                                    <div
                                        key={entry.userId}
                                        className={`card p-4 flex items-center gap-4 ${isMe ? 'ring-2 ring-blue-500/30' : ''}`}
                                    >
                                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${medal.bg} flex items-center justify-center text-white font-bold text-sm`}>
                                            {entry.computedRank}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className={`font-semibold truncate ${isMe ? 'text-blue-500' : ''}`} style={!isMe ? { color: 'var(--color-text)' } : undefined}>
                                                {entry.fullName || entry.username}
                                            </p>
                                        </div>
                                        <p className={`font-bold text-sm ${medal.text}`}>{getMetricValue(entry)}</p>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Remaining entries */}
                    {rest.length > 0 && (
                        <div
                            className="rounded-xl border overflow-hidden"
                            style={{ borderColor: 'var(--color-border)' }}
                        >
                            {rest.map((entry, index) => {
                                const rank = entry.computedRank
                                const isMe = entry.userId === user?.id
                                return (
                                    <div
                                        key={entry.userId}
                                        className={`flex items-center gap-4 px-4 py-3 transition-colors hover:bg-slate-800/20 ${
                                            index > 0 ? 'border-t' : ''
                                        } ${isMe ? 'bg-blue-500/5' : ''}`}
                                        style={{
                                            borderColor: 'var(--color-border)',
                                            backgroundColor: isMe ? undefined : 'var(--color-bg)',
                                        }}
                                    >
                                        {/* Rank */}
                                        <span
                                            className="w-8 text-center text-sm font-bold"
                                            style={{ color: 'var(--color-text-secondary)' }}
                                        >
                                            {rank}
                                        </span>

                                        {/* Avatar */}
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                            style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                                        >
                                            {entry.avatarUrl ? (
                                                <img
                                                    src={entry.avatarUrl}
                                                    alt={entry.username}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                            ) : (
                                                <User className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                                            )}
                                        </div>

                                        {/* Name */}
                                        <div className="flex-1 min-w-0">
                                            <p
                                                className={`text-sm font-medium truncate ${isMe ? 'text-blue-500' : ''}`}
                                                style={!isMe ? { color: 'var(--color-text)' } : undefined}
                                            >
                                                {entry.fullName || entry.username}
                                                {isMe && (
                                                    <span className="ml-2 text-xs text-blue-400">{t('leaderboard.you')}</span>
                                                )}
                                            </p>
                                        </div>

                                        {/* Metric */}
                                        <span
                                            className="text-sm font-semibold"
                                            style={{ color: 'var(--color-text)' }}
                                        >
                                            {getMetricValue(entry)}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
