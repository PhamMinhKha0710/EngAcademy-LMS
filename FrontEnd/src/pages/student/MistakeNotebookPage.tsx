import { useState, useEffect, useCallback } from 'react'
import {
    BookOpen,
    Trash2,
    RotateCcw,
    Loader2,
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    ArrowLeft,
    Flame,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { mistakeApi, MistakeNotebook } from '../../services/api/mistakeApi'
import DataTable from '../../components/ui/DataTable'
import EmptyState from '../../components/ui/EmptyState'
import FlashCard from '../../components/ui/FlashCard'
import Badge from '../../components/ui/Badge'

type ViewMode = 'table' | 'review'

export default function MistakeNotebookPage() {
    const { user } = useAuthStore()

    const [mistakes, setMistakes] = useState<MistakeNotebook[]>([])
    const [topMistakes, setTopMistakes] = useState<MistakeNotebook[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [viewMode, setViewMode] = useState<ViewMode>('table')
    const [currentCardIndex, setCurrentCardIndex] = useState(0)

    const fetchData = useCallback(async () => {
        if (!user?.id) return

        try {
            setLoading(true)
            setError(null)
            const [allMistakes, top] = await Promise.all([
                mistakeApi.getUserMistakes(user.id),
                mistakeApi.getTopMistakes(user.id),
            ])
            setMistakes(allMistakes || [])
            setTopMistakes(top || [])
        } catch (err) {
            console.error('Failed to fetch mistakes:', err)
            setError('Không thể tải sổ lỗi sai')
        } finally {
            setLoading(false)
        }
    }, [user?.id])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleDelete = async (id: number) => {
        try {
            setDeletingId(id)
            await mistakeApi.deleteMistake(id)
            setMistakes((prev) => prev.filter((m) => m.id !== id))
            setTopMistakes((prev) => prev.filter((m) => m.id !== id))
        } catch (err) {
            console.error('Failed to delete mistake:', err)
            setError('Không thể xóa mục này')
        } finally {
            setDeletingId(null)
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

    // DataTable columns
    const columns = [
        {
            key: 'word',
            label: 'Từ vựng',
            render: (item: MistakeNotebook) => (
                <span className="font-semibold text-blue-500">
                    {item.word || '—'}
                </span>
            ),
        },
        {
            key: 'meaning',
            label: 'Nghĩa',
            render: (item: MistakeNotebook) => (
                <span>{item.meaning || '—'}</span>
            ),
        },
        {
            key: 'mistakeCount',
            label: 'Số lần sai',
            render: (item: MistakeNotebook) => (
                <Badge variant={
                    (item.mistakeCount ?? 0) >= 5
                        ? 'danger'
                        : (item.mistakeCount ?? 0) >= 3
                          ? 'warning'
                          : 'default'
                }>
                    {item.mistakeCount ?? 0} lần
                </Badge>
            ),
        },
        {
            key: 'lastMistakeAt',
            label: 'Lần cuối',
            render: (item: MistakeNotebook) => (
                <span className="text-xs">{formatDate(item.lastMistakeAt)}</span>
            ),
        },
        {
            key: 'actions',
            label: '',
            render: (item: MistakeNotebook) => (
                <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    title="Xóa"
                >
                    {deletingId === item.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Trash2 className="w-4 h-4" />
                    )}
                </button>
            ),
        },
    ]

    // Flashcard navigation
    const reviewItems = mistakes.length > 0 ? mistakes : []
    const canGoPrev = currentCardIndex > 0
    const canGoNext = currentCardIndex < reviewItems.length - 1

    const handlePrevCard = () => {
        if (canGoPrev) setCurrentCardIndex((i) => i - 1)
    }
    const handleNextCard = () => {
        if (canGoNext) setCurrentCardIndex((i) => i + 1)
    }

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
                        Quay lại sổ lỗi sai
                    </button>
                    <EmptyState
                        icon={<BookOpen className="w-8 h-8" />}
                        title="Không có từ nào để ôn tập"
                        description="Sổ lỗi sai trống. Hãy luyện tập thêm!"
                    />
                </div>
            )
        }

        const currentItem = reviewItems[currentCardIndex]

        return (
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Back button */}
                <button
                    onClick={() => {
                        setViewMode('table')
                        setCurrentCardIndex(0)
                    }}
                    className="flex items-center gap-2 text-sm mb-6 transition-colors hover:text-blue-500"
                    style={{ color: 'var(--color-text-secondary)' }}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại sổ lỗi sai
                </button>

                <div className="text-center mb-6">
                    <h2
                        className="text-xl font-bold mb-1"
                        style={{ color: 'var(--color-text)' }}
                    >
                        Ôn lại từ vựng
                    </h2>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        Nhấn vào thẻ để lật xem nghĩa
                    </p>
                </div>

                {/* Progress */}
                <div className="flex items-center justify-center gap-3 mb-6">
                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                        {currentCardIndex + 1} / {reviewItems.length}
                    </span>
                    <div
                        className="w-32 h-1.5 rounded-full overflow-hidden"
                        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                    >
                        <div
                            className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-300"
                            style={{ width: `${((currentCardIndex + 1) / reviewItems.length) * 100}%` }}
                        />
                    </div>
                </div>

                {/* FlashCard */}
                <div className="mb-8">
                    <FlashCard
                        front={
                            <div>
                                <p className="text-3xl font-bold mb-2">{currentItem.word}</p>
                                <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                    Sai {currentItem.mistakeCount ?? 0} lần
                                </p>
                            </div>
                        }
                        back={
                            <div>
                                <p className="text-2xl font-bold">{currentItem.meaning || 'Chưa có nghĩa'}</p>
                            </div>
                        }
                    />
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={handlePrevCard}
                        disabled={!canGoPrev}
                        className="p-3 rounded-xl transition-colors disabled:opacity-30"
                        style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text)' }}
                    >
                        <ChevronLeft className="w-5 h-5" />
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
        )
    }

    // Table mode
    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1
                        className="text-2xl md:text-3xl font-bold mb-2"
                        style={{ color: 'var(--color-text)' }}
                    >
                        Sổ lỗi sai
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)' }}>
                        Theo dõi các từ vựng hay sai và ôn tập lại
                    </p>
                </div>
                {mistakes.length > 0 && (
                    <button
                        onClick={() => {
                            setViewMode('review')
                            setCurrentCardIndex(0)
                        }}
                        className="btn-primary flex items-center gap-2 shrink-0"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Ôn lại
                    </button>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {error}
                </div>
            )}

            {/* Top mistakes */}
            {!loading && topMistakes.length > 0 && (
                <div className="mb-8">
                    <h2
                        className="text-lg font-semibold mb-4 flex items-center gap-2"
                        style={{ color: 'var(--color-text)' }}
                    >
                        <Flame className="w-5 h-5 text-orange-400" />
                        Hay sai nhất
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {topMistakes.slice(0, 8).map((m) => (
                            <div
                                key={m.id}
                                className="card p-4 text-center hover:scale-[1.02] transition-transform"
                            >
                                <p
                                    className="font-bold text-lg truncate"
                                    style={{ color: 'var(--color-text)' }}
                                >
                                    {m.word}
                                </p>
                                <p
                                    className="text-sm truncate mt-1"
                                    style={{ color: 'var(--color-text-secondary)' }}
                                >
                                    {m.meaning || '—'}
                                </p>
                                <div className="mt-2">
                                    <Badge variant={
                                        (m.mistakeCount ?? 0) >= 5
                                            ? 'danger'
                                            : (m.mistakeCount ?? 0) >= 3
                                              ? 'warning'
                                              : 'info'
                                    }>
                                        {m.mistakeCount ?? 0} lần
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* All mistakes table */}
            <div>
                <h2
                    className="text-lg font-semibold mb-4"
                    style={{ color: 'var(--color-text)' }}
                >
                    Tất cả lỗi sai ({mistakes.length})
                </h2>
                <DataTable
                    columns={columns as any} // eslint-disable-line @typescript-eslint/no-explicit-any
                    data={mistakes as any} // eslint-disable-line @typescript-eslint/no-explicit-any
                    loading={loading}
                    emptyMessage="Chưa có lỗi sai nào. Tiếp tục luyện tập!"
                />
            </div>
        </div>
    )
}
