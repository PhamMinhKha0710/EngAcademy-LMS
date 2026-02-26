import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
    Search,
    ChevronLeft,
    ChevronRight,
    BookOpen,
    Loader2,
    AlertCircle,
} from 'lucide-react'
import { lessonApi, Lesson } from '../../services/api/lessonApi'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { LessonSkeleton } from '../../components/ui/Skeleton'

const DIFFICULTY_LABELS: Record<number, { label: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'default' }> = {
    1: { label: 'Dễ', variant: 'success' },
    2: { label: 'Trung bình', variant: 'info' },
    3: { label: 'Khó', variant: 'warning' },
    4: { label: 'Rất khó', variant: 'danger' },
}

const PAGE_SIZE = 12

export default function LessonsPage() {
    const [lessons, setLessons] = useState<Lesson[]>([])
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        const fetchLessons = async () => {
            setLoading(true)
            setError(null)
            try {
                const data = await lessonApi.getAll(page, PAGE_SIZE)
                setLessons(data.content)
                setTotalPages(data.totalPages)
                setTotalElements(data.totalElements)
            } catch (err) {
                console.error('Failed to fetch lessons:', err)
                setError('Không thể tải danh sách bài học. Vui lòng thử lại.')
            } finally {
                setLoading(false)
            }
        }

        fetchLessons()
    }, [page])

    const filteredLessons = useMemo(() => {
        if (!searchTerm.trim()) return lessons
        const keyword = searchTerm.toLowerCase()
        return lessons.filter(
            (l) =>
                l.title.toLowerCase().includes(keyword) ||
                l.topicName?.toLowerCase().includes(keyword)
        )
    }, [lessons, searchTerm])

    const getDifficulty = (level?: number) => {
        if (!level) return DIFFICULTY_LABELS[1]
        return DIFFICULTY_LABELS[level] || DIFFICULTY_LABELS[1]
    }

    if (loading && lessons.length === 0) {
        return (
            <div className="p-6 lg:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded mb-2"></div>
                        <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
                    </div>
                    <div className="h-10 w-full sm:w-80 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <LessonSkeleton key={i} />
                    ))}
                </div>
            </div>
        )
    }

    if (error && lessons.length === 0) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <p style={{ color: 'var(--color-text)' }} className="font-medium">
                        {error}
                    </p>
                    <button
                        onClick={() => setPage(0)}
                        className="btn-primary mt-4 text-sm"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                        Bài học
                    </h1>
                    <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                        {totalElements} bài học có sẵn
                    </p>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-80">
                    <Search
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                        style={{ color: 'var(--color-text-secondary)' }}
                    />
                    <input
                        type="text"
                        placeholder="Tìm kiếm bài học..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-10"
                    />
                </div>
            </div>

            {/* Lesson Grid */}
            {filteredLessons.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {filteredLessons.map((lesson) => {
                        const diff = getDifficulty(lesson.difficultyLevel)
                        return (
                            <Link
                                key={lesson.id}
                                to={`/lessons/${lesson.id}`}
                                className="card p-5 flex flex-col hover:shadow-lg transition-all duration-200 group"
                            >
                                {/* Icon + Badge row */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="w-11 h-11 rounded-xl bg-blue-500/15 flex items-center justify-center">
                                        <BookOpen className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <Badge variant={diff.variant}>{diff.label}</Badge>
                                </div>

                                {/* Title */}
                                <h3
                                    className="font-semibold text-sm leading-snug mb-1.5 group-hover:text-blue-500 transition-colors line-clamp-2"
                                    style={{ color: 'var(--color-text)' }}
                                >
                                    {lesson.title}
                                </h3>

                                {/* Topic */}
                                {lesson.topicName && (
                                    <p
                                        className="text-xs mb-3"
                                        style={{ color: 'var(--color-text-secondary)' }}
                                    >
                                        {lesson.topicName}
                                    </p>
                                )}

                                {/* Meta */}
                                <div className="mt-auto pt-3 flex items-center gap-4 text-xs" style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}>
                                    {lesson.vocabularyCount != null && (
                                        <span>{lesson.vocabularyCount} từ vựng</span>
                                    )}
                                    {lesson.questionCount != null && (
                                        <span>{lesson.questionCount} câu hỏi</span>
                                    )}
                                </div>
                            </Link>
                        )
                    })}
                </div>
            ) : (
                <EmptyState
                    icon={<BookOpen className="w-8 h-8" />}
                    title="Không tìm thấy bài học"
                    description={
                        searchTerm
                            ? `Không có bài học nào phù hợp với "${searchTerm}"`
                            : 'Chưa có bài học nào được tạo.'
                    }
                    action={
                        searchTerm ? (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="btn-secondary text-sm"
                            >
                                Xóa tìm kiếm
                            </button>
                        ) : undefined
                    }
                />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-4">
                    <button
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                            backgroundColor: 'var(--color-bg-tertiary)',
                            color: 'var(--color-text)',
                        }}
                    >
                        <ChevronLeft className="w-4 h-4" />
                        Trước
                    </button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i)}
                                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${i === page
                                        ? 'bg-blue-500 text-white'
                                        : ''
                                    }`}
                                style={
                                    i !== page
                                        ? {
                                            backgroundColor: 'var(--color-bg-tertiary)',
                                            color: 'var(--color-text-secondary)',
                                        }
                                        : undefined
                                }
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                        className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                            backgroundColor: 'var(--color-bg-tertiary)',
                            color: 'var(--color-text)',
                        }}
                    >
                        Sau
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    )
}
