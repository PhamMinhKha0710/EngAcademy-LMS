import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
    BookOpen,
    RotateCcw,
    Loader2,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    Trash2,
    TrendingUp,
    CircleX,
    CircleCheck,
    Lightbulb,
    Brain,
    Filter,
    ArrowUpDown,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useToastStore } from '../../store/toastStore'
import { mistakeApi, MistakeNotebook } from '../../services/api/mistakeApi'
import { vocabularyApi } from '../../services/api/vocabularyApi'
import { triggerQuestRefresh } from '../../utils/questRefresh'
import EmptyState from '../../components/ui/EmptyState'
import FlashCard from '../../components/ui/FlashCard'

type ViewMode = 'table' | 'review'
type SortMode = 'recent' | 'mistakeCount'

export default function MistakeNotebookPage() {
    const { t } = useTranslation()
    const { user } = useAuthStore()
    const { addToast } = useToastStore()

    const [mistakes, setMistakes] = useState<MistakeNotebook[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [reviewingId, setReviewingId] = useState<number | null>(null)
    const [viewMode, setViewMode] = useState<ViewMode>('table')
    const [currentCardIndex, setCurrentCardIndex] = useState(0)
    const [sortMode, setSortMode] = useState<SortMode>('recent')

    const fetchData = useCallback(async () => {
        if (!user?.id) return

        try {
            setLoading(true)
            setError(null)
            const allMistakes = await mistakeApi.getUserMistakes(user.id)
            setMistakes(allMistakes || [])
        } catch (err) {
            console.error('Failed to fetch mistakes:', err)
            setError(t('common.error'))
        } finally {
            setLoading(false)
        }
    }, [user?.id, t])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleDelete = async (id: number) => {
        try {
            setDeletingId(id)
            await mistakeApi.deleteMistake(id)
            setMistakes((prev) => prev.filter((m) => m.id !== id))
        } catch (err) {
            console.error('Failed to delete mistake:', err)
            setError(t('common.error'))
        } finally {
            setDeletingId(null)
        }
    }

    const handleReviewWord = async (correct: boolean) => {
        const currentItem = reviewItems[currentCardIndex]
        const vocabId = currentItem?.vocabularyId
        if (!vocabId || !user?.id) return

        try {
            setReviewingId(currentItem.id)
            const result = await vocabularyApi.reviewWord(vocabId, user.id, correct ? 'correct' : 'wrong')
            if (result.questTaskCompleted) {
                addToast({ type: 'success', message: t('quests.taskCompleted') })
            }
            if (correct) triggerQuestRefresh()
            if (canGoNext) setCurrentCardIndex((i) => i + 1)
        } catch (err) {
            console.error('Failed to review word:', err)
            addToast({ type: 'error', message: t('common.error') })
        } finally {
            setReviewingId(null)
        }
    }

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—'
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    }

    const formatRelativeTime = (dateStr?: string) => {
        if (!dateStr) return t('mistakes.unknownTime')
        const now = new Date().getTime()
        const then = new Date(dateStr).getTime()
        const diffMs = now - then

        if (diffMs < 60 * 60 * 1000) return t('mistakes.minutesAgo', { count: Math.max(1, Math.floor(diffMs / (60 * 1000))) })
        if (diffMs < 24 * 60 * 60 * 1000) return t('mistakes.hoursAgo', { count: Math.floor(diffMs / (60 * 60 * 1000)) })
        if (diffMs < 7 * 24 * 60 * 60 * 1000) return t('mistakes.daysAgo', { count: Math.floor(diffMs / (24 * 60 * 60 * 1000)) })
        return formatDate(dateStr)
    }

    const sortedMistakes = useMemo(() => {
        const items = [...mistakes]
        if (sortMode === 'mistakeCount') {
            items.sort((a, b) => (b.mistakeCount ?? 0) - (a.mistakeCount ?? 0))
            return items
        }
        items.sort((a, b) => {
            const ta = (a.lastMistakeAt ?? a.addedAt) ? new Date(a.lastMistakeAt ?? a.addedAt!).getTime() : 0
            const tb = (b.lastMistakeAt ?? b.addedAt) ? new Date(b.lastMistakeAt ?? b.addedAt!).getTime() : 0
            return tb - ta
        })
        return items
    }, [mistakes, sortMode])

    // Flashcard navigation
    const reviewItems = sortedMistakes
    const canGoPrev = currentCardIndex > 0
    const canGoNext = currentCardIndex < reviewItems.length - 1

    const handlePrevCard = () => {
        if (canGoPrev) setCurrentCardIndex((i) => i - 1)
    }
    const handleNextCard = () => {
        if (canGoNext) setCurrentCardIndex((i) => i + 1)
    }

    useEffect(() => {
        if (currentCardIndex > Math.max(reviewItems.length - 1, 0)) {
            setCurrentCardIndex(0)
        }
    }, [currentCardIndex, reviewItems.length])

    const totalItems = mistakes.length
    const totalMistakeCount = mistakes.reduce((sum, m) => sum + (m.mistakeCount ?? 0), 0)
    const highRiskCount = mistakes.filter((m) => (m.mistakeCount ?? 0) >= 3).length
    const reviewedRate = totalItems > 0 ? Math.round(((totalItems - highRiskCount) / totalItems) * 100) : 0

    // Review mode
    if (viewMode === 'review') {
        if (reviewItems.length === 0) {
            return (
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <button
                        onClick={() => setViewMode('table')}
                        className="flex items-center gap-2 text-sm mb-6 transition-colors hover:text-blue-500"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t('mistakes.backToNotebook')}
                    </button>
                    <EmptyState
                        icon={<BookOpen className="w-8 h-8" />}
                        title={t('mistakes.noWordsToReview')}
                        description={t('mistakes.notebookEmpty')}
                    />
                </div>
            )
        }

        const currentItem = reviewItems[currentCardIndex]

        return (
            <div className="max-w-3xl mx-auto px-4 py-8 md:py-10">
                <button
                    onClick={() => {
                        setViewMode('table')
                        setCurrentCardIndex(0)
                    }}
                    className="flex items-center gap-2 text-sm mb-6 transition-colors hover:text-blue-500"
                    style={{ color: 'var(--color-text-secondary)' }}
                >
                    <ArrowLeft className="w-4 h-4" />
                    {t('mistakes.backToNotebook')}
                </button>

                <div className="rounded-3xl border p-6 md:p-8 mb-6 bg-gradient-to-br from-blue-50/70 to-white dark:from-slate-800/70 dark:to-slate-900/80" style={{ borderColor: 'var(--color-border)' }}>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-wide text-blue-500 inline-flex items-center gap-2">
                                <Brain className="w-4 h-4" />
                                {t('mistakes.reviewCenter')}
                            </p>
                            <h2 className="text-2xl md:text-3xl font-black mt-2" style={{ color: 'var(--color-text)' }}>
                                {t('mistakes.reviewMistakes')}
                            </h2>
                            <p className="mt-2 text-sm md:text-base" style={{ color: 'var(--color-text-secondary)' }}>
                                {t('mistakes.tapToFlip')}
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setViewMode('table')
                                setCurrentCardIndex(0)
                            }}
                            className="btn-secondary shrink-0"
                        >
                            {t('mistakes.viewList')}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-3 mb-6">
                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
                        {currentCardIndex + 1} / {reviewItems.length}
                    </span>
                    <div
                        className="w-40 h-2 rounded-full overflow-hidden"
                        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                    >
                        <div
                            className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-300"
                            style={{ width: `${((currentCardIndex + 1) / reviewItems.length) * 100}%` }}
                        />
                    </div>
                </div>
                {currentCardIndex === reviewItems.length - 1 && reviewItems.length > 0 && (
                    <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                            {t('mistakes.lastCardReached', { total: reviewItems.length })}
                        </p>
                        <button
                            onClick={() => {
                                setViewMode('table')
                                setCurrentCardIndex(0)
                            }}
                            className="btn-primary text-sm shrink-0"
                        >
                            {t('mistakes.finishReview')}
                        </button>
                    </div>
                )}

                <div className="mb-8">
                    <FlashCard
                        height={340}
                        front={
                            <div className="flex-1 flex flex-col justify-between p-8 md:p-10">
                                <div className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 w-fit">
                                    {t('mistakes.vocabulary')}
                                </div>
                                <div className="text-center my-6">
                                    <p className="text-4xl md:text-5xl font-black" style={{ color: 'var(--color-text)' }}>
                                        {currentItem.word || '—'}
                                    </p>
                                    <p className="text-sm mt-3" style={{ color: 'var(--color-text-secondary)' }}>
                                        {t('mistakes.mistakesCount', { count: currentItem.mistakeCount ?? 0 })} • {formatRelativeTime(currentItem.lastMistakeAt ?? currentItem.addedAt)}
                                    </p>
                                </div>
                                <p className="text-xs uppercase tracking-wider text-center" style={{ color: 'var(--color-text-secondary)' }}>
                                    {t('mistakes.tapToSeeMeaning')}
                                </p>
                            </div>
                        }
                        back={
                            <div>
                                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                                    {t('mistakes.correctMeaning')}
                                </p>
                                <p className="text-3xl md:text-4xl font-black">
                                    {currentItem.meaning || t('mistakes.noMeaningAvailable')}
                                </p>
                            </div>
                        }
                    />
                </div>

                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleReviewWord(false)}
                            disabled={reviewingId === currentItem.id || !currentItem.vocabularyId}
                            className="px-4 py-2 rounded-xl text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 transition-colors disabled:opacity-50 text-sm font-semibold"
                        >
                            {t('mistakes.notMastered')}
                        </button>
                        <button
                            onClick={() => handleReviewWord(true)}
                            disabled={reviewingId === currentItem.id || !currentItem.vocabularyId}
                            className="px-4 py-2 rounded-xl text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 transition-colors disabled:opacity-50 text-sm font-semibold flex items-center gap-2"
                        >
                            {reviewingId === currentItem.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <CircleCheck className="w-4 h-4" />
                            )}
                            {t('mistakes.mastered')}
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handlePrevCard}
                            disabled={!canGoPrev}
                            className="p-3 rounded-xl transition-colors disabled:opacity-30"
                            style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text)' }}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => handleDelete(currentItem.id)}
                            disabled={deletingId === currentItem.id}
                            className="p-3 rounded-xl text-red-500 bg-red-500/10 hover:bg-red-500/15 transition-colors disabled:opacity-50"
                            title={t('mistakes.deleteCurrent')}
                        >
                            {deletingId === currentItem.id ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Trash2 className="w-5 h-5" />
                            )}
                        </button>
                        <button
                            onClick={handleNextCard}
                            disabled={!canGoNext}
                            className="p-3 rounded-xl transition-colors disabled:opacity-30"
                            style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text)' }}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
        )
    }

    return (
        <div className="w-full px-4 md:px-8 py-8 md:py-10 bg-slate-50 dark:bg-slate-900">
            <div className="mx-auto max-w-6xl space-y-8">
                <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                    <div className="max-w-2xl">
                        <p className="text-sm font-semibold uppercase tracking-wide text-blue-500 inline-flex items-center gap-2">
                            <Brain className="w-4 h-4" />
                            {t('mistakes.reviewCenter')}
                        </p>
                        <h1 className="mt-2 text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                            {t('mistakes.yourMistakes')}
                        </h1>
                        <p className="mt-3 text-base md:text-lg text-slate-600 dark:text-slate-400">
                            {t('mistakes.reviewRegularly')}
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            setViewMode('review')
                            setCurrentCardIndex(0)
                        }}
                        disabled={sortedMistakes.length === 0}
                        className="group flex items-center justify-center gap-3 bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RotateCcw className="w-5 h-5" />
                        <span>{t('mistakes.reviewNow')}</span>
                    </button>
                </section>

                {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-500 text-sm flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        {error}
                    </div>
                )}

                {sortedMistakes.length === 0 ? (
                    <EmptyState
                        icon={<BookOpen className="w-8 h-8" />}
                        title={t('mistakes.noMistakes')}
                        description={t('mistakes.practiceMore')}
                    />
                ) : (
                    <>
                        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                            <div className="card p-5 md:p-6 flex items-center gap-4">
                                <div className="size-12 rounded-full bg-red-100 dark:bg-red-900/20 text-red-500 flex items-center justify-center">
                                    <CircleX className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('mistakes.totalMistakes')}</p>
                                    <p className="text-3xl font-black text-slate-900 dark:text-white">{totalItems}</p>
                                </div>
                            </div>
                            <div className="card p-5 md:p-6 flex items-center gap-4">
                                <div className="size-12 rounded-full bg-emerald-100 dark:bg-emerald-900/20 text-emerald-500 flex items-center justify-center">
                                    <CircleCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('mistakes.stableRate')}</p>
                                    <p className="text-3xl font-black text-slate-900 dark:text-white">{reviewedRate}%</p>
                                </div>
                            </div>
                            <div className="card p-5 md:p-6 flex items-center gap-4">
                                <div className="size-12 rounded-full bg-blue-100 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{t('mistakes.totalErrors')}</p>
                                    <p className="text-3xl font-black text-slate-900 dark:text-white">{totalMistakeCount}</p>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                                    {t('mistakes.toReviewList')}
                                </h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSortMode('recent')}
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-2 transition-colors ${
                                            sortMode === 'recent'
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                        }`}
                                    >
                                        <Filter className="w-4 h-4" />
                                        {t('mistakes.recent')}
                                    </button>
                                    <button
                                        onClick={() => setSortMode('mistakeCount')}
                                        className={`px-4 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-2 transition-colors ${
                                            sortMode === 'mistakeCount'
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                        }`}
                                    >
                                        <ArrowUpDown className="w-4 h-4" />
                                        {t('mistakes.mostMistakes')}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {sortedMistakes.map((item) => (
                                    <div
                                        key={item.id}
                                        className="group bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-lg transition-all border border-slate-100 dark:border-slate-800 overflow-hidden"
                                    >
                                        <div className="flex flex-col md:flex-row">
                                            <div className="md:w-2 bg-red-500/80 group-hover:bg-red-500 transition-colors" />

                                            <div className="flex-1 p-5 md:p-7">
                                                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                                        {t('mistakes.vocabulary')}
                                                    </span>
                                                    <span className="text-xs text-slate-400 font-medium">
                                                        {formatRelativeTime(item.lastMistakeAt ?? item.addedAt)}
                                                    </span>
                                                </div>

                                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-5 break-all">
                                                    {item.word || t('mistakes.noWordData')}
                                                </h3>

                                                <div className="grid md:grid-cols-2 gap-4">
                                                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl p-4 relative">
                                                        <div className="absolute -top-3 left-4 bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/20 text-red-500 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                                                            <CircleX className="w-3.5 h-3.5" />
                                                            {t('mistakes.wrongWord')}
                                                        </div>
                                                        <p className="text-slate-700 dark:text-slate-300 font-semibold pt-2 break-all">
                                                            {item.word || '—'}
                                                        </p>
                                                    </div>

                                                    <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-xl p-4 relative">
                                                        <div className="absolute -top-3 left-4 bg-white dark:bg-slate-900 border border-emerald-100 dark:border-emerald-900/20 text-emerald-600 text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-sm">
                                                            <CircleCheck className="w-3.5 h-3.5" />
                                                            {t('mistakes.correctMeaning')}
                                                        </div>
                                                        <p className="text-slate-700 dark:text-slate-300 font-semibold pt-2 break-words">
                                                            {item.meaning || t('mistakes.noMeaningData')}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-4 flex items-start gap-3 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl">
                                                    <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                                                            {t('mistakes.memoryTip')}
                                                        </p>
                                                        <p className="text-sm text-slate-600 dark:text-slate-300">
                                                            {t('mistakes.mistakeTip', { count: item.mistakeCount ?? 0 })}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        {t('mistakes.lastUpdated')}: {formatDate(item.lastMistakeAt ?? item.addedAt)}
                                                    </p>

                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        disabled={deletingId === item.id}
                                                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold text-red-500 bg-red-500/10 hover:bg-red-500/15 transition-colors disabled:opacity-50"
                                                    >
                                                        {deletingId === item.id ? (
                                                            <>
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                                {t('mistakes.deleting')}
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Trash2 className="w-4 h-4" />
                                                                {t('mistakes.deleteItem')}
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                )}
            </div>
        </div>
    )
}

