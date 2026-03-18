import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
    ArrowLeft,
    BookOpen,
    FileText,
    Languages,
    Dumbbell,
    CheckCircle,
    Loader2,
    AlertCircle,
    Volume2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useAuthStore } from '../../store/authStore'
import { useToastStore } from '../../store/toastStore'
import { lessonApi, Lesson } from '../../services/api/lessonApi'
import { vocabularyApi, VocabularyResponse } from '../../services/api/vocabularyApi'
import { questionApi, QuestionResponse } from '../../services/api/questionApi'
import { progressApi } from '../../services/api/progressApi'
import { triggerQuestRefresh } from '../../utils/questRefresh'
import FlashCard from '../../components/ui/FlashCard'
import QuizQuestion from '../../components/ui/QuizQuestion'

type TabKey = 'content' | 'grammar' | 'vocabulary' | 'practice'

function fireConfetti() {
    confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
    })
}

export default function LessonDetailPage() {
    const { t } = useTranslation()
    const { id } = useParams<{ id: string }>()
    const user = useAuthStore((s) => s.user)
    const { addToast } = useToastStore()

    const [lesson, setLesson] = useState<Lesson | null>(null)
    const [vocabulary, setVocabulary] = useState<VocabularyResponse[]>([])
    const [questions, setQuestions] = useState<QuestionResponse[]>([])
    const [activeTab, setActiveTab] = useState<TabKey>('content')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const getTabs = useMemo(() => [
        { key: 'content' as TabKey, label: t('lessons.tabContent'), icon: <BookOpen className="w-4 h-4" /> },
        { key: 'grammar' as TabKey, label: t('lessons.tabGrammar'), icon: <FileText className="w-4 h-4" /> },
        { key: 'vocabulary' as TabKey, label: t('lessons.tabVocabulary'), icon: <Languages className="w-4 h-4" /> },
        { key: 'practice' as TabKey, label: t('lessons.tabPractice'), icon: <Dumbbell className="w-4 h-4" /> },
    ], [t])

    const [answers, setAnswers] = useState<Record<number, number[]>>({})
    const [showResults, setShowResults] = useState(false)
    const [completing, setCompleting] = useState(false)
    const [completed, setCompleted] = useState(false)
    const [completionPercentage, setCompletionPercentage] = useState(0)
    const [progressLoaded, setProgressLoaded] = useState(false)
    const [startedLearning, setStartedLearning] = useState(false)
    const [visitedTabs, setVisitedTabs] = useState<Record<TabKey, boolean>>({
        content: true,
        grammar: false,
        vocabulary: false,
        practice: false,
    })
    const [bannerImageFailed, setBannerImageFailed] = useState(false)

    const lessonId = id ? parseInt(id) : null

    // Banner: use lesson cover image if available; fallback to default. When load fails, show gradient + icon placeholder.
    const defaultBannerUrl = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800'
    const bannerImageUrl = lesson?.coverImageUrl || defaultBannerUrl
    const showBannerImage = !bannerImageFailed && bannerImageUrl

    useEffect(() => {
        if (!lessonId) return
        const fetchAll = async () => {
            setLoading(true)
            setError(null)
            try {
                const [lessonData, vocabData, questionData] = await Promise.allSettled([
                    lessonApi.getById(lessonId),
                    vocabularyApi.getByLesson(lessonId),
                    questionApi.getByLesson(lessonId),
                ])
                if (lessonData.status === 'fulfilled') setLesson(lessonData.value)
                else setError(t('lessons.loadError'))
                if (vocabData.status === 'fulfilled') setVocabulary(vocabData.value)
                if (questionData.status === 'fulfilled') setQuestions(questionData.value)

                if (user?.id) {
                    try {
                        const prog = await progressApi.getForLesson(user.id, lessonId)
                        if (prog) {
                            const isCompleted = !!prog.isCompleted
                            setCompleted(isCompleted)
                            // Nếu đã hoàn thành, luôn hiển thị 100%
                            setCompletionPercentage(isCompleted ? 100 : (prog.completionPercentage || 0))
                        }
                    } catch (e) {
                        // progress not created yet
                    }
                }
                setProgressLoaded(true)
            } catch (err) {
                console.error('Failed to load lesson:', err)
                setError(t('lessons.networkError'))
            } finally {
                setLoading(false)
            }
        }
        fetchAll()
    }, [lessonId])

    useEffect(() => {
        setVisitedTabs((prev) => ({ ...prev, [activeTab]: true }))
    }, [activeTab])

    useEffect(() => {
        setBannerImageFailed(false)
    }, [lesson?.id])

    const handleSelectAnswer = useCallback(
        (questionId: number, optionIds: number[]) => {
            if (showResults) return
            setAnswers((prev) => ({ ...prev, [questionId]: optionIds }))
        },
        [showResults]
    )

    const quizScore = questions.reduce((score, q) => {
        const selected = answers[q.id] || []
        const correctOption = q.options.find((o) => o.isCorrect)
        if (correctOption && selected.includes(correctOption.id)) return score + 1
        return score
    }, 0)

    useEffect(() => {
        // Chỉ auto-update sau khi đã fetch progress từ server xong
        // tránh race condition ghi đè % cũ trước khi load xong
        if (!progressLoaded || !user?.id || !lessonId || completed) return;
        
        const totalTabs = getTabs.length;
        const visitedCount = Object.values(visitedTabs).filter(Boolean).length;
        let basePercentage = Math.floor((visitedCount / totalTabs) * 80);
        
        if (questions.length > 0) {
           if (showResults) {
               basePercentage += Math.floor((quizScore / questions.length) * 20);
           }
        } else {
           if (visitedCount === totalTabs) basePercentage = 100;
        }
        
        if (basePercentage >= 100) basePercentage = 99;

        if (basePercentage > completionPercentage) {
            setCompletionPercentage(basePercentage);
            progressApi.updateProgress(user.id, lessonId, basePercentage).catch(console.error);
        }
    }, [progressLoaded, visitedTabs, showResults, quizScore, questions.length, user?.id, lessonId, completed, completionPercentage]);

    const handleSubmitQuiz = () => {
        setShowResults(true)
        if (quizScore === questions.length) {
            addToast({ type: 'success', message: t('lessons.quizPerfect', { score: quizScore, total: questions.length }) })
        } else if (quizScore >= questions.length / 2) {
            addToast({ type: 'info', message: t('lessons.quizGood', { score: quizScore, total: questions.length }) })
        } else {
            addToast({ type: 'warning', message: t('lessons.quizReview', { score: quizScore, total: questions.length }) })
        }
    }

    const handleResetQuiz = () => {
        setAnswers({})
        setShowResults(false)
    }

    const handleCompleteLesson = async () => {
        if (!user?.id || !lessonId) return
        setCompleting(true)
        try {
            const res = await progressApi.completeLesson(user.id, lessonId)
            setCompleted(true)
            setCompletionPercentage(100)
            fireConfetti()
            triggerQuestRefresh()
            addToast({ type: 'success', message: t('lessons.lessonCompletedToast') })
            if (res.questTaskCompleted) {
                addToast({ type: 'success', message: t('quests.taskCompleted') })
            }
        } catch (err) {
            console.error('Failed to complete lesson:', err)
            addToast({ type: 'error', message: t('lessons.saveProgressError') })
        } finally {
            setCompleting(false)
        }
    }

    const playAudio = (url: string | undefined) => {
        if (!url) {
            addToast({ type: 'warning', message: 'Chưa có file phát âm cho mục này.' })
            return
        }
        const audio = new Audio(url)
        audio.play().catch(() => {
            addToast({ type: 'error', message: 'Không thể phát âm thanh.' })
        })
    }

    const effectiveGrammarHtml = useMemo(() => {
        if (lesson?.grammarHtml && lesson.grammarHtml.trim()) {
            return lesson.grammarHtml
        }
        const content = lesson?.contentHtml || ''
        if (!content.trim()) return ''

        const grammarMatch = content.match(/<h3[^>]*>\s*Grammar Focus\s*<\/h3>([\s\S]*?)(?=<h3|$)/i)
        if (!grammarMatch) return ''

        return `<h3>Grammar Focus</h3>${grammarMatch[1]}`
    }, [lesson?.grammarHtml, lesson?.contentHtml])

    const hasGrammar = Boolean(effectiveGrammarHtml.trim())

    const startLearning = () => {
        setStartedLearning(true)
        if (hasGrammar) {
            setActiveTab('grammar')
            return
        }

        if (vocabulary.length > 0) {
            setActiveTab('vocabulary')
            return
        }
        if (questions.length > 0) {
            setActiveTab('practice')
        }
    }

    const requiresVocabulary = vocabulary.length > 0
    const requiresPractice = questions.length > 0
    const requiresGrammar = hasGrammar
    const isLearningReadyToComplete =
        startedLearning &&
        visitedTabs.content &&
        (!requiresGrammar || visitedTabs.grammar) &&
        (!requiresVocabulary || visitedTabs.vocabulary) &&
        (!requiresPractice || showResults)

    const userInitials = (user?.fullName || 'HS')
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase() || '')
        .join('')

    const handleContinueLearning = () => {
        if (!startedLearning) {
            startLearning()
            return
        }
        if (activeTab === 'content') {
            if (hasGrammar) {
                setActiveTab('grammar')
                return
            }
            if (vocabulary.length > 0) {
                setActiveTab('vocabulary')
                return
            }
            if (questions.length > 0) {
                setActiveTab('practice')
            }
            return
        }
        if (activeTab === 'grammar') {
            if (vocabulary.length > 0) {
                setActiveTab('vocabulary')
                return
            }
            if (questions.length > 0) {
                setActiveTab('practice')
            }
            return
        }
        if (activeTab === 'vocabulary' && questions.length > 0) {
            setActiveTab('practice')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
            </div>
        )
    }

    if (error || !lesson) {
        return (
            <div className="p-6 lg:p-8 flex flex-col items-center justify-center min-h-[50vh] text-center">
                <AlertCircle className="w-14 h-14 text-red-400 mb-4" />
                <p className="font-medium text-lg text-[var(--color-text)]">{error || t('lessons.lessonNotFound')}</p>
                <Link to="/lessons" className="btn-primary mt-6 inline-block focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 rounded-xl">
                    {t('lessons.backToList')}
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-full bg-[#f8f7f5] dark:bg-[#231a0f] pb-44">
            <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-4 space-y-5">
                <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                        <Link to="/lessons" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2" aria-label={t('lessons.backToList')}>
                            <ArrowLeft className="h-5 w-5" aria-hidden />
                        </Link>
                        <h1 className="text-base font-bold truncate max-w-[240px]">{lesson.title}</h1>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center text-xs font-bold">
                        {userInitials}
                    </div>
                </header>

                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative group"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-orange-400 rounded-xl blur opacity-20 group-hover:opacity-30 transition duration-500" />
                    <div className="relative flex flex-col lg:flex-row items-stretch bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-xl ring-1 ring-slate-200 dark:ring-slate-800">
                        <div className="lg:w-2/5 relative min-h-[200px] lg:min-h-[280px] bg-gradient-to-br from-orange-100 to-orange-50 dark:from-slate-800 dark:to-slate-800">
                            {showBannerImage ? (
                                <img
                                    src={bannerImageUrl}
                                    alt=""
                                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                                    onError={() => setBannerImageFailed(true)}
                                    aria-hidden
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 dark:bg-slate-700/30">
                                        <BookOpen className="h-10 w-10 text-orange-500/80 dark:text-orange-400/80" aria-hidden />
                                    </div>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4 lg:p-6">
                                <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                                    {completed ? t('lessons.completed') : t('lessons.active')}
                                </span>
                            </div>
                        </div>
                        <div className="flex-1 p-6 lg:p-8 flex flex-col justify-between gap-6">
                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    {lesson.difficultyLevel != null && (
                                        <span className="px-2 py-1 bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-bold rounded uppercase tracking-wider">
                                            {t('lessons.level')} {lesson.difficultyLevel}
                                        </span>
                                    )}
                                    {lesson.topicName && (
                                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded uppercase tracking-wider">
                                            {lesson.topicName}
                                        </span>
                                    )}
                                </div>
                                <h2 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                    {lesson.title}
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">
                                    {vocabulary.length} {t('lessons.words')} • {questions.length} {t('lessons.questions')}
                                </p>
                                <div className="flex justify-between items-end gap-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('lessons.progress')}</h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
                                            {completed ? t('lessons.completed') : t('lessons.footerHintInProgress')}
                                        </p>
                                    </div>
                                    <span className={`text-2xl lg:text-3xl font-black tabular-nums ${completed ? 'text-green-500' : 'text-orange-500'}`}>
                                        {completionPercentage}%
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${completed ? 'bg-green-500' : 'bg-orange-500'}`}
                                        style={{ width: `${completionPercentage}%` }}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3">
                                {!startedLearning && completionPercentage === 0 && (
                                    <button
                                        type="button"
                                        onClick={startLearning}
                                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 min-h-[44px] focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2"
                                    >
                                        {t('lessons.startLearning')}
                                        <ArrowLeft className="h-4 w-4 rotate-180" aria-hidden />
                                    </button>
                                )}
                                <Link
                                    to="/lessons"
                                    className="px-6 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-center min-h-[44px] flex items-center justify-center"
                                >
                                    {t('lessons.backToList')}
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.section>

                <nav className="flex border-b border-slate-200 dark:border-slate-800 gap-6 lg:gap-8 overflow-x-auto" role="tablist">
                    {getTabs.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            role="tab"
                            aria-selected={activeTab === tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`whitespace-nowrap px-1 pb-4 pt-1 text-sm font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 -mb-px ${activeTab === tab.key
                                    ? 'border-orange-500 text-orange-500'
                                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </nav>

                <AnimatePresence mode="wait">
                    {activeTab === 'content' && (
                        <motion.div
                            key="content"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-6 lg:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6"
                        >
                            <div className="flex items-center gap-3 pb-4 border-b border-orange-100 dark:border-slate-700/80">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                                    <BookOpen className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        {t('lessons.introHeading')}
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {lesson.topicName || lesson.title}
                                    </p>
                                </div>
                            </div>

                            {/* Main Content */}
                            {lesson.contentHtml ? (
                                <div
                                    className="prose prose-sm md:prose-base max-w-none text-[var(--color-text)] leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: lesson.contentHtml }}
                                />
                            ) : (
                                <p className="text-center py-12 text-[var(--color-text-secondary)]">{t('lessons.noContent')}</p>
                            )}

                            {/* Grammar Section in Content Tab */}
                            {hasGrammar && (
                                <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-3 pb-4 mb-4 border-b border-blue-100 dark:border-slate-700/80">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                                            <FileText className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                                {t('lessons.grammarSectionHeading')}
                                            </p>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                {t('lessons.grammarSubtitle')}
                                            </p>
                                        </div>
                                    </div>
                                    <div
                                        className="prose prose-sm md:prose-base max-w-none text-[var(--color-text)] leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: effectiveGrammarHtml }}
                                    />
                                    {/* Grammar Note Box */}
                                    <div className="mt-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30">
                                        <p className="text-sm text-blue-800 dark:text-blue-300">
                                            💡 Hãy chắc chắn bạn hiểu kỹ ngữ pháp này trước khi tiếp tục.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {lesson.audioUrl && (
                                <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
                                    <p className="text-sm font-medium mb-2 text-[var(--color-text)]">{t('lessons.audioLesson')}</p>
                                    <audio controls className="w-full max-w-md rounded-xl">
                                        <source src={lesson.audioUrl} />
                                        {t('lessons.browserNoAudio')}
                                    </audio>
                                </div>
                            )}
                            {lesson.videoUrl && (
                                <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
                                    <p className="text-sm font-medium mb-2 text-[var(--color-text)]">{t('lessons.videoLesson')}</p>
                                    <div className="aspect-video w-full rounded-xl overflow-hidden border border-orange-100 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                                        <video controls className="w-full h-full object-cover" src={lesson.videoUrl}>
                                            {t('lessons.browserNoVideo')}
                                        </video>
                                    </div>
                                </div>
                            )}
                            <div className="mt-8 pt-6 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-3">
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {t('lessons.contentDoneHint')}
                                </p>
                                <button
                                    type="button"
                                    onClick={handleContinueLearning}
                                    className="btn-primary min-h-[44px] px-6 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                                    disabled={!hasGrammar && vocabulary.length === 0 && questions.length === 0}
                                >
                                    {t('lessons.continue')}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'grammar' && (
                        <motion.div
                            key="grammar"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-6 lg:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6"
                        >
                            <div className="flex items-center gap-3 pb-4 border-b border-blue-100 dark:border-slate-700/80">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                        {t('lessons.grammarSectionHeading')}
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">
                                        {t('lessons.grammarSubtitle')}
                                    </p>
                                </div>
                            </div>

                            {hasGrammar ? (
                                <div className="space-y-6">
                                    {/* Grammar Header */}
                                    <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800/30">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500 text-white">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white">{t('lessons.grammarSectionHeading')}</h3>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">{t('lessons.grammarSubtitle')}</p>
                                        </div>
                                    </div>

                                    {/* Grammar Content */}
                                    <div
                                        className="prose prose-sm md:prose-base max-w-none text-[var(--color-text)] leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: effectiveGrammarHtml }}
                                    />

                                    {/* Grammar Examples Box */}
                                    <div className="mt-6 p-5 rounded-xl bg-amber-50 dark:bg-amber-900/15 border border-amber-200/50 dark:border-amber-700/30">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="h-6 w-6 rounded-full bg-amber-500/20 flex items-center justify-center">
                                                <span className="text-amber-600 dark:text-amber-400 text-sm font-bold">💡</span>
                                            </div>
                                            <h4 className="font-semibold text-amber-900 dark:text-amber-200">Lưu ý quan trọng</h4>
                                        </div>
                                        <p className="text-sm text-amber-800 dark:text-amber-300">
                                            Hãy chắc chắn bạn hiểu kỹ ngữ pháp này trước khi chuyển sang phần tiếp theo. Nếu chưa rõ, hãy xem lại nội dung hoặc hỏi giáo viên.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                                        <FileText className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <p className="text-lg font-medium text-slate-600 dark:text-slate-400">
                                        {t('lessons.noContent')}
                                    </p>
                                    <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
                                        Bài học này chưa có nội dung ngữ pháp.
                                    </p>
                                </div>
                            )}
                            <div className="mt-8 pt-6 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-3">
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {t('lessons.grammarDoneHint')}
                                </p>
                                <button
                                    type="button"
                                    onClick={handleContinueLearning}
                                    className="btn-primary min-h-[44px] px-6 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                                    disabled={vocabulary.length === 0 && questions.length === 0}
                                >
                                    {t('lessons.continue')}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'vocabulary' && (
                        <motion.div
                            key="vocabulary"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white dark:bg-slate-900 rounded-xl p-6 lg:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6"
                        >
                            {vocabulary.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {vocabulary.map((vocab, i) => (
                                        <motion.div
                                            key={vocab.id}
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                        >
                                            {/* <FlashCard
                                            front={
                                                <div>
                                                    <p className="text-2xl font-bold mb-2 text-[var(--color-text)]">{vocab.word}</p>
                                                    {vocab.audioUrl && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                playAudio(vocab.audioUrl!)
                                                            }}
                                                            className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-primary-500/15 text-primary-500 hover:bg-primary-500/25 transition-colors"
                                                        >
                                                            <Volume2 className="w-3.5 h-3.5" />
                                                            {t('lessons.playPronunciation')}
                                                        </button>
                                                    )}
                                                </div>
                                            }
                                            back={
                                                <div className="space-y-2 text-left">
                                                    <p className="text-lg font-semibold text-[var(--color-text)]">{vocab.meaning}</p>
                                                    {vocab.pronunciation && (
                                                        <p className="text-sm italic text-[var(--color-text-secondary)]">/{vocab.pronunciation}/</p>
                                                    )}
                                                    {vocab.exampleSentence && (
                                                        <p className="text-sm mt-2 text-[var(--color-text-secondary)]">"{vocab.exampleSentence}"</p>
                                                    )}
                                                </div>
                                            }
                                        /> */}
                                            <FlashCard
                                                front={
                                                    <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                                                        {vocab.imageUrl && (
                                                            <img
                                                                src={vocab.imageUrl}
                                                                alt={vocab.word}
                                                                className="w-32 h-32 object-contain rounded-lg"
                                                            />
                                                        )}

                                                        <p className="text-2xl font-bold text-[var(--color-text)]">
                                                            {vocab.word}
                                                        </p>

                                                        {vocab.audioUrl && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    playAudio(vocab.audioUrl!);
                                                                }}
                                                                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-primary-500/15 text-primary-500 hover:bg-primary-500/25 transition-colors focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                                                            >
                                                                <Volume2 className="w-3.5 h-3.5" />
                                                                {t('lessons.playPronunciation')}
                                                            </button>
                                                        )}
                                                    </div>
                                                }
                                                back={
                                                    <div className="space-y-2 text-left">
                                                        <p className="text-lg font-semibold text-[var(--color-text)]">
                                                            {vocab.meaning}
                                                        </p>

                                                        {vocab.pronunciation && (
                                                            <p className="text-sm italic text-[var(--color-text-secondary)]">
                                                                /{vocab.pronunciation}/
                                                            </p>
                                                        )}

                                                        {vocab.exampleSentence && (
                                                            <p className="text-sm mt-2 text-[var(--color-text-secondary)]">
                                                                "{vocab.exampleSentence}"
                                                            </p>
                                                        )}
                                                    </div>
                                                }
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center">
                                    <p className="text-slate-600 dark:text-slate-400">{t('lessons.noVocab')}</p>
                                </div>
                            )}
                            {vocabulary.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3">
                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                        {t('lessons.vocabDoneHint')}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={handleContinueLearning}
                                        className="btn-primary min-h-[44px] focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                                        disabled={questions.length === 0}
                                    >
                                        {t('lessons.goToPractice')}
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'practice' && (
                        <motion.div
                            key="practice"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white dark:bg-slate-900 rounded-xl p-6 lg:p-8 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6"
                        >
                            {questions.length > 0 ? (
                                <div className="space-y-6">
                                    {questions.map((q, index) => (
                                        <motion.div
                                            key={q.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="p-6 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30"
                                        >
                                            <p className="text-xs font-medium mb-3 text-[var(--color-text-secondary)]">
                                                {t('lessons.questionNumber', { current: index + 1, total: questions.length })}
                                                {q.points != null ? ` • ${t('lessons.pointsUnit', { points: q.points })}` : ''}
                                            </p>
                                            <QuizQuestion
                                                question={{
                                                    questionText: q.questionText,
                                                    questionType: q.questionType as 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_IN_BLANK',
                                                    options: q.options,
                                                }}
                                                selectedOptionIds={answers[q.id] || []}
                                                onSelect={(optionIds) => handleSelectAnswer(q.id, optionIds)}
                                                showResult={showResults}
                                                disabled={showResults}
                                            />
                                            {showResults && q.explanation && (
                                                <div className="mt-4 p-4 rounded-xl bg-[var(--color-bg-tertiary)] text-sm text-slate-600 dark:text-slate-400">
                                                    <span className="font-medium text-slate-800 dark:text-slate-200">{t('lessons.explanation')}: </span>
                                                    {q.explanation}
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="rounded-xl p-6 border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col sm:flex-row items-center justify-between gap-4"
                                >
                                    {showResults ? (
                                        <>
                                            <div>
                                                <p className="text-lg font-bold text-slate-900 dark:text-white">
                                                    {t('lessons.result')}: {t('lessons.resultScore', { score: quizScore, total: questions.length })}
                                                </p>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                                    {quizScore === questions.length
                                                        ? t('lessons.perfectScore')
                                                        : t('lessons.reviewAndTryAgain')}
                                                </p>
                                            </div>
                                            <button type="button" onClick={handleResetQuiz} className="btn-secondary min-h-[44px] focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2">
                                                {t('lessons.retryQuiz')}
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                                {t('lessons.answeredCount', { answered: Object.keys(answers).length, total: questions.length })}
                                            </p>
                                            <button
                                                type="button"
                                                onClick={handleSubmitQuiz}
                                                disabled={Object.keys(answers).length === 0}
                                                className="btn-primary min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                                            >
                                                {t('lessons.submitQuiz')}
                                            </button>
                                        </>
                                    )}
                                </motion.div>
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <p className="text-slate-600 dark:text-slate-400">{t('lessons.noQuestions')}</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

                <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-4 flex items-start gap-3 border border-blue-100/50 dark:border-blue-900/30">
                    <AlertCircle className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5 shrink-0" aria-hidden />
                    <p className="text-xs text-blue-700 dark:text-blue-200 leading-snug">
                        {t('lessons.completeWarning')}
                    </p>
                </div>
            </div>

            {(startedLearning || completionPercentage > 0) && (
                <footer className="fixed bottom-0 left-0 right-0 md:left-64 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.08)] px-4 py-3">
                    <div className="max-w-5xl mx-auto">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/80 px-4 py-3">
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                                    {t('lessons.footerTitle')}
                                </p>
                                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                                    {t('lessons.progress')}: <span className="text-orange-500 dark:text-orange-400">{completionPercentage}%</span>
                                </p>
                                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                    {completed
                                        ? t('lessons.footerHintCompleted')
                                        : t('lessons.footerHintInProgress')}
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleContinueLearning}
                                    className="btn-primary min-h-[44px] px-6 flex items-center justify-center"
                                >
                                    {t('lessons.continueLearning')}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCompleteLesson}
                                    disabled={completing || !isLearningReadyToComplete || completed}
                                    className={`text-sm font-semibold inline-flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-full border transition-colors ${
                                        completed
                                            ? 'border-emerald-200 text-emerald-500 cursor-not-allowed'
                                            : isLearningReadyToComplete
                                                ? 'border-orange-200 text-orange-500 hover:bg-orange-50'
                                                : 'border-slate-200 text-slate-400 cursor-not-allowed'
                                    }`}
                                >
                                    {completing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                    {completed ? t('lessons.completed') : t('lessons.completeLesson')}
                                </button>
                            </div>
                        </div>
                    </div>
                </footer>
            )}
        </div>
    )

}
