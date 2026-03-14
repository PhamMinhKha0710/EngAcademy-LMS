import { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
    Search,
    ChevronLeft,
    ChevronRight,
    BookOpen,
    AlertCircle,
    BookMarked,
    FileQuestion,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { lessonApi, Lesson } from '../../services/api/lessonApi'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import PageHero from '../../components/ui/PageHero'
import Skeleton from '../../components/ui/Skeleton'

const PAGE_SIZE = 12

const DIFFICULTY_CONFIG: Record<number, { labelKey: string; variant: 'success' | 'warning' | 'danger' | 'info' | 'default'; accent: string }> = {
    1: { labelKey: 'lessons.easy', variant: 'success', accent: 'from-success-500/20 to-success-500/5' },
    2: { labelKey: 'lessons.medium', variant: 'info', accent: 'from-primary-500/20 to-primary-500/5' },
    3: { labelKey: 'lessons.hard', variant: 'warning', accent: 'from-amber-500/20 to-amber-500/5' },
    4: { labelKey: 'lessons.veryHard', variant: 'danger', accent: 'from-red-500/20 to-red-500/5' },
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }

function LessonCardSkeleton() {
    return (
        <div className="card p-5 flex flex-col overflow-hidden">
            <div className="flex items-start justify-between mb-3">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <Skeleton className="h-5 w-full rounded mb-2" />
            <Skeleton className="h-4 w-3/4 rounded mb-4" />
            <div className="mt-auto pt-3 flex gap-4">
                <Skeleton className="h-4 w-20 rounded" />
                <Skeleton className="h-4 w-20 rounded" />
            </div>
        </div>
    )
}

export default function LessonsPage() {
    const { t } = useTranslation()
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
                setError(t('common.error'))
            } finally {
                setLoading(false)
            }
        }
        fetchLessons()
    }, [page, t])

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
        if (!level) return DIFFICULTY_CONFIG[1]
        return DIFFICULTY_CONFIG[level] || DIFFICULTY_CONFIG[1]
    }

    if (error && lessons.length === 0) {
        return (
            <div className="p-6 lg:p-8">
                <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
                    <AlertCircle className="w-14 h-14 text-red-400 mb-4" />
                    <p className="font-medium text-lg" style={{ color: 'var(--color-text)' }}>{error}</p>
                    <button onClick={() => setPage(0)} className="btn-primary mt-6">
                        {t('common.retry')}
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 lg:p-8 space-y-8">
            <PageHero
                title={t('lessons.title')}
                subtitle={t('lessons.subtitle', { count: totalElements })}
                icon={<BookOpen className="w-7 h-7" />}
                iconBg="primary"
            >
                <div className="relative w-full sm:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-secondary)]" />
                    <input
                        type="text"
                        placeholder={t('lessons.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field !pl-10"
                    />
                </div>
            </PageHero>

            {loading && lessons.length === 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <LessonCardSkeleton key={i} />
                    ))}
                </div>
            ) : filteredLessons.length > 0 ? (
                <motion.div
                    variants={container}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredLessons.map((lesson) => {
                            const diff = getDifficulty(lesson.difficultyLevel)
                            return (
                                <motion.div key={lesson.id} variants={item} layout>
                                    <Link
                                        to={`/lessons/${lesson.id}`}
                                        className="block group"
                                    >
                                        <motion.div
                                            className="card relative p-5 flex flex-col h-full overflow-hidden border-l-4"
                                            style={{ borderLeftColor: 'var(--color-primary)' }}
                                            whileHover={{ y: -4, boxShadow: '0 12px 24px -8px rgb(0 0 0 / 0.12)' }}
                                            transition={{ duration: 0.25 }}
                                        >
                                            <div className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-30 bg-gradient-to-br ${diff.accent}`} aria-hidden />
                                            <div className="relative flex items-start justify-between mb-3">
                                                <div className="w-12 h-12 rounded-xl bg-primary-500/15 flex items-center justify-center group-hover:bg-primary-500/25 transition-colors">
                                                    <BookOpen className="w-6 h-6 text-primary-500" />
                                                </div>
                                                <Badge variant={diff.variant}>{t(diff.labelKey)}</Badge>
                                            </div>
                                            <h3 className="font-semibold text-base leading-snug mb-1.5 line-clamp-2 group-hover:text-primary-500 transition-colors text-[var(--color-text)]">
                                                {lesson.title}
                                            </h3>
                                            {lesson.topicName && (
                                                <p className="text-xs mb-3 text-[var(--color-text-secondary)]">
                                                    {lesson.topicName}
                                                </p>
                                            )}
                                            <div className="mt-auto pt-3 flex items-center gap-4 text-xs text-[var(--color-text-secondary)] border-t border-[var(--color-border)]">
                                                {lesson.vocabularyCount != null && (
                                                    <span className="flex items-center gap-1">
                                                        <BookMarked className="w-3.5 h-3.5" />
                                                        {lesson.vocabularyCount} {t('lessons.words')}
                                                    </span>
                                                )}
                                                {lesson.questionCount != null && (
                                                    <span className="flex items-center gap-1">
                                                        <FileQuestion className="w-3.5 h-3.5" />
                                                        {lesson.questionCount} {t('lessons.questions')}
                                                    </span>
                                                )}
                                            </div>
                                        </motion.div>
                                    </Link>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                </motion.div>
            ) : (
                <EmptyState
                    icon={<BookOpen className="w-10 h-10" />}
                    title={searchTerm ? t('lessons.noLessonFound') : t('lessons.noLessonsYet')}
                    description={
                        searchTerm
                            ? t('lessons.noMatchSearch', { search: searchTerm })
                            : t('lessons.noLessonsYet')
                    }
                    action={
                        searchTerm ? (
                            <button onClick={() => setSearchTerm('')} className="btn-secondary">
                                {t('lessons.clearSearch')}
                            </button>
                        ) : undefined
                    }
                />
            )}

            {totalPages > 1 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center gap-2 pt-4"
                >
                    <button
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-[var(--color-bg-tertiary)] text-[var(--color-text)] hover:bg-primary-500/15 hover:text-primary-500"
                    >
                        <ChevronLeft className="w-4 h-4" /> {t('common.previous')}
                    </button>
                    <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i)}
                                className={`min-w-[2.5rem] h-10 px-2 rounded-xl text-sm font-medium transition-all duration-200 ${i === page ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' : 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] hover:bg-primary-500/15 hover:text-primary-500'
                                    }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                        disabled={page >= totalPages - 1}
                        className="flex items-center gap-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed bg-[var(--color-bg-tertiary)] text-[var(--color-text)] hover:bg-primary-500/15 hover:text-primary-500"
                    >
                        {t('common.next')} <ChevronRight className="w-4 h-4" />
                    </button>
                </motion.div>
            )}
        </div>
    )
}

