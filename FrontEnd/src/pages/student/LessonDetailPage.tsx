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
import FlashCard from '../../components/ui/FlashCard'
import QuizQuestion from '../../components/ui/QuizQuestion'
import Badge from '../../components/ui/Badge'

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

    const lessonId = id ? parseInt(id) : null

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
            addToast({ type: 'success', message: `Tuyệt vời! Bạn làm đúng toàn bộ ${quizScore}/${questions.length} câu.` })
        } else if (quizScore >= questions.length / 2) {
            addToast({ type: 'info', message: `Khá tốt! Bạn đạt ${quizScore}/${questions.length} điểm.` })
        } else {
            addToast({ type: 'warning', message: `Bạn chỉ đạt ${quizScore}/${questions.length} điểm. Hãy ôn tập lại nhé!` })
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
            await progressApi.completeLesson(user.id, lessonId)
            setCompleted(true)
            setCompletionPercentage(100)
            fireConfetti()
            addToast({ type: 'success', message: 'Chúc mừng! Bạn đã hoàn thành Bài học này!' })
        } catch (err) {
            console.error('Failed to complete lesson:', err)
            addToast({ type: 'error', message: 'Có lỗi xảy ra khi lưu tiến trình. Vui lòng thử lại!' })
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
                <p className="font-medium text-lg text-[var(--color-text)]">{error || 'Bài học không tồn tại.'}</p>
                <Link to="/lessons" className="btn-primary mt-6 inline-block">
                    Quay lại danh sách
                </Link>
            </div>
        )
    }

    return (
        <div className="min-h-full bg-[#F8FAFC] dark:bg-slate-950 pb-44">
            <div className="max-w-5xl mx-auto px-4 md:px-6 py-4 space-y-4">
                <header className="sticky top-0 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur border border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                        <Link to="/lessons" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <h1 className="text-base font-bold truncate max-w-[240px]">{lesson.title}</h1>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold">
                        {userInitials}
                    </div>
                </header>

                <motion.section
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-orange-50 to-white dark:from-slate-900 dark:to-slate-900 border border-orange-100 dark:border-slate-800 rounded-3xl p-6 relative overflow-hidden"
                    style={{ boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}
                >
                    <div className="relative z-10">
                        <div className="flex flex-wrap gap-2 mb-3">
                            {lesson.difficultyLevel && (
                                <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 text-[10px] font-bold rounded uppercase tracking-wider">
                                    Cấp {lesson.difficultyLevel}
                                </span>
                            )}
                            {lesson.topicName && (
                                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold rounded uppercase tracking-wider">
                                    {lesson.topicName}
                                </span>
                            )}
                        </div>
                        <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 mb-2">{lesson.title}</h2>
                        <p className="text-sm text-slate-500 mb-4">
                            {vocabulary.length} từ vựng • {questions.length} câu hỏi
                        </p>
                        
                        {(completionPercentage > 0 || completed) && (
                            <div className="mb-6 max-w-xs">
                                <div className="flex justify-between text-xs font-bold mb-1.5">
                                    <span className="text-slate-500 dark:text-slate-400">Tiến độ</span>
                                    <span className={completed ? 'text-green-500' : 'text-primary-500'}>
                                        {completionPercentage}%
                                    </span>
                                </div>
                                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700/50 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-1000 ${completed ? 'bg-green-500' : 'bg-primary-500'}`}
                                        style={{ width: `${completionPercentage}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        <button
                            onClick={startLearning}
                            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-2xl shadow-lg shadow-orange-200/70 transition-transform active:scale-95"
                        >
                            {startedLearning ? 'Tiếp tục học' : 'Bắt đầu học'}
                        </button>
                    </div>
                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-orange-500/5 rounded-full" />
                </motion.section>

                <nav className="flex overflow-x-auto gap-2 py-1">
                    {getTabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-sm font-semibold flex items-center gap-2 border transition-colors ${activeTab === tab.key
                                    ? 'bg-orange-500 text-white border-orange-500'
                                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-300'
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
                            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 space-y-6"
                            style={{ boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}
                        >
                            {lesson.contentHtml ? (
                                <div
                                    className="prose prose-sm max-w-none text-[var(--color-text)]"
                                    dangerouslySetInnerHTML={{ __html: lesson.contentHtml }}
                                />
                            ) : (
                                <p className="text-center py-12 text-[var(--color-text-secondary)]">Bài học này chưa có nội dung.</p>
                            )}
                            {lesson.audioUrl && (
                                <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
                                    <p className="text-sm font-medium mb-2 text-[var(--color-text)]">Audio bài học</p>
                                    <audio controls className="w-full max-w-md" src={lesson.audioUrl}>
                                        Trình duyệt không hỗ trợ audio.
                                    </audio>
                                </div>
                            )}
                            {lesson.videoUrl && (
                                <div className="mt-6 pt-6 border-t border-[var(--color-border)]">
                                    <p className="text-sm font-medium mb-2 text-[var(--color-text)]">Video bài học</p>
                                    <video controls className="w-full max-w-2xl rounded-xl" src={lesson.videoUrl}>
                                        Trình duyệt không hỗ trợ video.
                                    </video>
                                </div>
                            )}
                            <div className="mt-8 pt-6 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-3">
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                    Xong phần lý thuyết, chuyển sang học từ vựng và luyện tập nhé.
                                </p>
                                <button
                                    onClick={handleContinueLearning}
                                    className="btn-primary"
                                    disabled={!hasGrammar && vocabulary.length === 0 && questions.length === 0}
                                >
                                    Tiếp tục học
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
                            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 space-y-6"
                            style={{ boxShadow: '0 4px 20px -2px rgba(0,0,0,0.05)' }}
                        >
                            {hasGrammar ? (
                                <div
                                    className="prose prose-sm max-w-none text-[var(--color-text)]"
                                    dangerouslySetInnerHTML={{ __html: effectiveGrammarHtml }}
                                />
                            ) : (
                                <p className="text-center py-12 text-[var(--color-text-secondary)]">
                                    Bài học này chưa có nội dung ngữ pháp.
                                </p>
                            )}
                            <div className="mt-8 pt-6 border-t border-[var(--color-border)] flex flex-wrap items-center justify-between gap-3">
                                <p className="text-sm text-[var(--color-text-secondary)]">
                                    Ôn ngữ pháp xong, chuyển sang từ vựng để luyện phản xạ.
                                </p>
                                <button
                                    onClick={handleContinueLearning}
                                    className="btn-primary"
                                    disabled={vocabulary.length === 0 && questions.length === 0}
                                >
                                    Tiếp tục
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
                                                            Phát âm
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
                                                                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-primary-500/15 text-primary-500 hover:bg-primary-500/25 transition-colors"
                                                            >
                                                                <Volume2 className="w-3.5 h-3.5" />
                                                                Phát âm
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
                                <div className="card p-12 text-center">
                                    <p className="text-[var(--color-text-secondary)]">Bài học này chưa có từ vựng.</p>
                                </div>
                            )}
                            {vocabulary.length > 0 && (
                                <div className="mt-6 bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                                    <p className="text-sm text-[var(--color-text-secondary)]">
                                        Đã xem từ vựng? Sang phần luyện tập để kiểm tra lại kiến thức.
                                    </p>
                                    <button
                                        onClick={handleContinueLearning}
                                        className="btn-primary"
                                        disabled={questions.length === 0}
                                    >
                                        Sang luyện tập
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
                        >
                            {questions.length > 0 ? (
                                <div className="space-y-6">
                                    {questions.map((q, index) => (
                                        <motion.div
                                            key={q.id}
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="card p-6"
                                        >
                                            <p className="text-xs font-medium mb-3 text-[var(--color-text-secondary)]">
                                                Câu {index + 1}/{questions.length}
                                                {q.points ? ` • ${q.points} điểm` : ''}
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
                                                <div className="mt-4 p-4 rounded-xl bg-[var(--color-bg-tertiary)] text-sm text-[var(--color-text-secondary)]">
                                                    <span className="font-medium text-[var(--color-text)]">Giải thích: </span>
                                                    {q.explanation}
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}

                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4"
                                >
                                    {showResults ? (
                                        <>
                                            <div>
                                                <p className="text-lg font-bold text-[var(--color-text)]">
                                                    Kết quả: {quizScore}/{questions.length} câu đúng
                                                </p>
                                                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                                                    {quizScore === questions.length
                                                        ? t('lessons.perfectScore')
                                                        : t('lessons.reviewAndTryAgain')}
                                                </p>
                                            </div>
                                            <button onClick={handleResetQuiz} className="btn-secondary">
                                                {t('lessons.retryQuiz')}
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-sm text-[var(--color-text-secondary)]">
                                                {t('lessons.answeredCount', { answered: Object.keys(answers).length, total: questions.length })}
                                            </p>
                                            <button
                                                onClick={handleSubmitQuiz}
                                                disabled={Object.keys(answers).length === 0}
                                                className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                {t('lessons.submitQuiz')}
                                            </button>
                                        </>
                                    )}
                                </motion.div>
                            </div>
                        ) : (
                            <div className="card p-12 text-center">
                                <p className="text-[var(--color-text-secondary)]">Bài học này chưa có câu hỏi luyện tập.</p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

                <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-4 flex items-start gap-3 border border-blue-100/50 dark:border-blue-900/30">
                    <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-blue-600 dark:text-blue-300 leading-snug">
                        {t('lessons.completeWarning')}
                    </p>
                </div>
            </div>

            <footer className="sticky bottom-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 p-4">
                <div className="max-w-5xl mx-auto flex flex-col gap-3">
                    <button
                        onClick={handleContinueLearning}
                        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        Tiếp tục học
                    </button>
                    <button
                        onClick={handleCompleteLesson}
                        disabled={completing || !isLearningReadyToComplete || completed}
                        className={`w-full font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all ${
                                completed ? 'bg-green-100 text-green-600 border border-green-200 cursor-not-allowed' :
                                isLearningReadyToComplete
                                    ? 'bg-orange-100 text-orange-500 hover:bg-orange-200'
                                    : 'bg-orange-100 text-orange-400 opacity-60 cursor-not-allowed'
                            }`}
                    >
                        {completing ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
                        {completed ? 'Đã hoàn thành' : 'Hoàn thành bài học'}
                    </button>
                </div>
            </footer>
        </div>
    )

}
