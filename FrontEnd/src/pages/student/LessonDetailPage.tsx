import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
    ArrowLeft,
    BookOpen,
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
import { lessonApi, Lesson } from '../../services/api/lessonApi'
import { vocabularyApi, VocabularyResponse } from '../../services/api/vocabularyApi'
import { questionApi, QuestionResponse } from '../../services/api/questionApi'
import { progressApi } from '../../services/api/progressApi'
import FlashCard from '../../components/ui/FlashCard'
import QuizQuestion from '../../components/ui/QuizQuestion'
import Badge from '../../components/ui/Badge'

type TabKey = 'content' | 'vocabulary' | 'practice'

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'content', label: 'Nội dung', icon: <BookOpen className="w-4 h-4" /> },
    { key: 'vocabulary', label: 'Từ vựng', icon: <Languages className="w-4 h-4" /> },
    { key: 'practice', label: 'Luyện tập', icon: <Dumbbell className="w-4 h-4" /> },
]

function fireConfetti() {
    confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
    })
}

export default function LessonDetailPage() {
    const { id } = useParams<{ id: string }>()
    const user = useAuthStore((s) => s.user)

    const [lesson, setLesson] = useState<Lesson | null>(null)
    const [vocabulary, setVocabulary] = useState<VocabularyResponse[]>([])
    const [questions, setQuestions] = useState<QuestionResponse[]>([])
    const [activeTab, setActiveTab] = useState<TabKey>('content')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [answers, setAnswers] = useState<Record<number, number[]>>({})
    const [showResults, setShowResults] = useState(false)
    const [completing, setCompleting] = useState(false)
    const [completed, setCompleted] = useState(false)

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
                else setError('Không thể tải bài học này.')
                if (vocabData.status === 'fulfilled') setVocabulary(vocabData.value)
                if (questionData.status === 'fulfilled') setQuestions(questionData.value)
            } catch (err) {
                console.error('Failed to load lesson:', err)
                setError('Đã xảy ra lỗi. Vui lòng thử lại.')
            } finally {
                setLoading(false)
            }
        }
        fetchAll()
    }, [lessonId])

    const handleSelectAnswer = useCallback(
        (questionId: number, optionIds: number[]) => {
            if (showResults) return
            setAnswers((prev) => ({ ...prev, [questionId]: optionIds }))
        },
        [showResults]
    )

    const handleSubmitQuiz = () => setShowResults(true)
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
            fireConfetti()
        } catch (err) {
            console.error('Failed to complete lesson:', err)
        } finally {
            setCompleting(false)
        }
    }

    const playAudio = (url: string) => {
        const audio = new Audio(url)
        audio.play().catch(() => {})
    }

    const quizScore = questions.reduce((score, q) => {
        const selected = answers[q.id] || []
        const correctOption = q.options.find((o) => o.isCorrect)
        if (correctOption && selected.includes(correctOption.id)) return score + 1
        return score
    }, 0)

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
        <div className="p-6 lg:p-8 space-y-8">
            <Link
                to="/lessons"
                className="inline-flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-primary-500 transition-colors duration-200"
            >
                <ArrowLeft className="w-4 h-4" />
                Quay lại danh sách
            </Link>

            {/* Hero */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative rounded-2xl overflow-hidden px-6 py-8 sm:px-8 sm:py-10 bg-[var(--color-bg-secondary)]"
            >
                <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-primary-500/10 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-success-500/10 blur-3xl" />
                <div className="relative">
                    <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] mb-3">
                        {lesson.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        {lesson.difficultyLevel && (
                            <Badge
                                variant={
                                    lesson.difficultyLevel <= 1 ? 'success' : lesson.difficultyLevel === 2 ? 'info' : lesson.difficultyLevel === 3 ? 'warning' : 'danger'
                                }
                            >
                                Cấp {lesson.difficultyLevel}
                            </Badge>
                        )}
                        {lesson.topicName && <Badge variant="default">{lesson.topicName}</Badge>}
                    </div>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        {vocabulary.length > 0 && <span>{vocabulary.length} từ vựng</span>}
                        {vocabulary.length > 0 && questions.length > 0 && ' • '}
                        {questions.length > 0 && <span>{questions.length} câu hỏi</span>}
                    </p>
                </div>
            </motion.div>

            {/* Tabs */}
            <div className="relative flex gap-1 p-1.5 rounded-xl w-fit bg-[var(--color-bg-tertiary)]">
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`relative flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 z-10 ${
                            activeTab === tab.key ? 'text-white' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]'
                        }`}
                    >
                        {tab.icon}
                        {tab.label}
                        {activeTab === tab.key && (
                            <motion.span
                                layoutId="lessonTab"
                                className="absolute inset-0 rounded-lg bg-primary-500"
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                style={{ zIndex: -1 }}
                            />
                        )}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'content' && (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="card p-6 lg:p-8"
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
                                        <FlashCard
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
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <div className="card p-12 text-center">
                                <p className="text-[var(--color-text-secondary)]">Bài học này chưa có từ vựng.</p>
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
                                    className="card p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
                                >
                                    {showResults ? (
                                        <>
                                            <div>
                                                <p className="text-lg font-bold text-[var(--color-text)]">
                                                    Kết quả: {quizScore}/{questions.length} câu đúng
                                                </p>
                                                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                                                    {quizScore === questions.length
                                                        ? 'Xuất sắc! Bạn đã trả lời đúng tất cả!'
                                                        : 'Ôn lại và thử lại nhé!'}
                                                </p>
                                            </div>
                                            <button onClick={handleResetQuiz} className="btn-secondary">
                                                Làm lại
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <p className="text-sm text-[var(--color-text-secondary)]">
                                                Đã trả lời {Object.keys(answers).length}/{questions.length} câu
                                            </p>
                                            <button
                                                onClick={handleSubmitQuiz}
                                                disabled={Object.keys(answers).length === 0}
                                                className="btn-primary disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                Nộp bài
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

            {/* Complete lesson */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
            >
                {completed ? (
                    <div className="flex items-center gap-3 text-success-500 font-medium">
                        <CheckCircle className="w-6 h-6" />
                        Bạn đã hoàn thành bài học này!
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                            Đánh dấu hoàn thành khi bạn đã sẵn sàng.
                        </p>
                        <button
                            onClick={handleCompleteLesson}
                            disabled={completing}
                            className="btn-primary flex items-center gap-2 disabled:opacity-60"
                        >
                            {completing ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <CheckCircle className="w-4 h-4" />
                            )}
                            Hoàn thành bài học
                        </button>
                    </>
                )}
            </motion.div>
        </div>
    )
}
