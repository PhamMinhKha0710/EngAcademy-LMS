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

export default function LessonDetailPage() {
    const { id } = useParams<{ id: string }>()
    const user = useAuthStore((s) => s.user)

    const [lesson, setLesson] = useState<Lesson | null>(null)
    const [vocabulary, setVocabulary] = useState<VocabularyResponse[]>([])
    const [questions, setQuestions] = useState<QuestionResponse[]>([])
    const [activeTab, setActiveTab] = useState<TabKey>('content')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Quiz state
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

                if (lessonData.status === 'fulfilled') {
                    setLesson(lessonData.value)
                } else {
                    setError('Không thể tải bài học này.')
                }

                if (vocabData.status === 'fulfilled') {
                    setVocabulary(vocabData.value)
                }
                if (questionData.status === 'fulfilled') {
                    setQuestions(questionData.value)
                }
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

    const handleSubmitQuiz = () => {
        setShowResults(true)
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

    // Compute quiz score
    const quizScore = questions.reduce((score, q) => {
        const selected = answers[q.id] || []
        const correctOption = q.options.find((o) => o.isCorrect)
        if (correctOption && selected.includes(correctOption.id)) {
            return score + 1
        }
        return score
    }, 0)

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
            </div>
        )
    }

    if (error || !lesson) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <p className="font-medium" style={{ color: 'var(--color-text)' }}>
                        {error || 'Bài học không tồn tại.'}
                    </p>
                    <Link to="/lessons" className="btn-primary mt-4 inline-block text-sm">
                        Quay lại danh sách
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* Back + Header */}
            <div>
                <Link
                    to="/lessons"
                    className="inline-flex items-center gap-1.5 text-sm mb-4 hover:opacity-80 transition-opacity"
                    style={{ color: 'var(--color-text-secondary)' }}
                >
                    <ArrowLeft className="w-4 h-4" />
                    Quay lại danh sách
                </Link>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                        {lesson.title}
                    </h1>
                    <div className="flex items-center gap-2">
                        {lesson.difficultyLevel && (
                            <Badge
                                variant={
                                    lesson.difficultyLevel <= 1
                                        ? 'success'
                                        : lesson.difficultyLevel === 2
                                          ? 'info'
                                          : lesson.difficultyLevel === 3
                                            ? 'warning'
                                            : 'danger'
                                }
                            >
                                Cấp {lesson.difficultyLevel}
                            </Badge>
                        )}
                        {lesson.topicName && <Badge variant="default">{lesson.topicName}</Badge>}
                    </div>
                </div>

                <div className="flex items-center gap-4 mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                    {vocabulary.length > 0 && <span>{vocabulary.length} từ vựng</span>}
                    {questions.length > 0 && <span>{questions.length} câu hỏi</span>}
                </div>
            </div>

            {/* Tabs */}
            <div
                className="flex gap-1 p-1 rounded-xl w-fit"
                style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
            >
                {TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            activeTab === tab.key
                                ? 'bg-blue-500 text-white shadow-sm'
                                : ''
                        }`}
                        style={
                            activeTab !== tab.key
                                ? { color: 'var(--color-text-secondary)' }
                                : undefined
                        }
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
                {/* Content Tab */}
                {activeTab === 'content' && (
                    <div className="card p-6 lg:p-8">
                        {lesson.contentHtml ? (
                            <div
                                className="prose prose-sm max-w-none"
                                style={{ color: 'var(--color-text)' }}
                                dangerouslySetInnerHTML={{ __html: lesson.contentHtml }}
                            />
                        ) : (
                            <p
                                className="text-sm text-center py-12"
                                style={{ color: 'var(--color-text-secondary)' }}
                            >
                                Bài học này chưa có nội dung.
                            </p>
                        )}

                        {/* Audio / Video */}
                        {lesson.audioUrl && (
                            <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--color-border)' }}>
                                <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                                    Audio bài học
                                </p>
                                <audio controls className="w-full max-w-md" src={lesson.audioUrl}>
                                    Trình duyệt không hỗ trợ audio.
                                </audio>
                            </div>
                        )}
                        {lesson.videoUrl && (
                            <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--color-border)' }}>
                                <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                                    Video bài học
                                </p>
                                <video controls className="w-full max-w-2xl rounded-xl" src={lesson.videoUrl}>
                                    Trình duyệt không hỗ trợ video.
                                </video>
                            </div>
                        )}
                    </div>
                )}

                {/* Vocabulary Tab */}
                {activeTab === 'vocabulary' && (
                    <div>
                        {vocabulary.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {vocabulary.map((vocab) => (
                                    <FlashCard
                                        key={vocab.id}
                                        front={
                                            <div>
                                                <p className="text-2xl font-bold mb-2">
                                                    {vocab.word}
                                                </p>
                                                {vocab.audioUrl && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            playAudio(vocab.audioUrl!)
                                                        }}
                                                        className="mx-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-blue-500/15 text-blue-500 hover:bg-blue-500/25 transition-colors"
                                                    >
                                                        <Volume2 className="w-3.5 h-3.5" />
                                                        Phát âm
                                                    </button>
                                                )}
                                            </div>
                                        }
                                        back={
                                            <div className="space-y-2">
                                                <p className="text-lg font-semibold">
                                                    {vocab.meaning}
                                                </p>
                                                {vocab.pronunciation && (
                                                    <p
                                                        className="text-sm italic"
                                                        style={{
                                                            color: 'var(--color-text-secondary)',
                                                        }}
                                                    >
                                                        /{vocab.pronunciation}/
                                                    </p>
                                                )}
                                                {vocab.exampleSentence && (
                                                    <p
                                                        className="text-sm mt-2"
                                                        style={{
                                                            color: 'var(--color-text-secondary)',
                                                        }}
                                                    >
                                                        "{vocab.exampleSentence}"
                                                    </p>
                                                )}
                                            </div>
                                        }
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="card p-6">
                                <p
                                    className="text-sm text-center py-12"
                                    style={{ color: 'var(--color-text-secondary)' }}
                                >
                                    Bài học này chưa có từ vựng.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Practice Tab */}
                {activeTab === 'practice' && (
                    <div>
                        {questions.length > 0 ? (
                            <div className="space-y-6">
                                {questions.map((q, index) => (
                                    <div key={q.id} className="card p-6">
                                        <p
                                            className="text-xs font-medium mb-3"
                                            style={{ color: 'var(--color-text-secondary)' }}
                                        >
                                            Câu {index + 1}/{questions.length}
                                            {q.points ? ` • ${q.points} điểm` : ''}
                                        </p>
                                        <QuizQuestion
                                            question={{
                                                questionText: q.questionText,
                                                questionType: q.questionType as
                                                    | 'MULTIPLE_CHOICE'
                                                    | 'TRUE_FALSE'
                                                    | 'FILL_IN_BLANK',
                                                options: q.options,
                                            }}
                                            selectedOptionIds={answers[q.id] || []}
                                            onSelect={(optionIds) =>
                                                handleSelectAnswer(q.id, optionIds)
                                            }
                                            showResult={showResults}
                                            disabled={showResults}
                                        />
                                        {showResults && q.explanation && (
                                            <div
                                                className="mt-4 p-3 rounded-lg text-sm"
                                                style={{
                                                    backgroundColor: 'var(--color-bg-tertiary)',
                                                    color: 'var(--color-text-secondary)',
                                                }}
                                            >
                                                <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                                                    Giải thích:
                                                </span>{' '}
                                                {q.explanation}
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* Score + Submit */}
                                <div className="card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    {showResults ? (
                                        <>
                                            <div>
                                                <p
                                                    className="text-lg font-bold"
                                                    style={{ color: 'var(--color-text)' }}
                                                >
                                                    Kết quả: {quizScore}/{questions.length} câu
                                                    đúng
                                                </p>
                                                <p
                                                    className="text-sm"
                                                    style={{
                                                        color: 'var(--color-text-secondary)',
                                                    }}
                                                >
                                                    {quizScore === questions.length
                                                        ? 'Xuất sắc! Bạn đã trả lời đúng tất cả!'
                                                        : 'Hãy ôn tập lại và thử lại nhé!'}
                                                </p>
                                            </div>
                                            <button
                                                onClick={handleResetQuiz}
                                                className="btn-secondary text-sm"
                                            >
                                                Làm lại
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <p
                                                className="text-sm"
                                                style={{
                                                    color: 'var(--color-text-secondary)',
                                                }}
                                            >
                                                Đã trả lời {Object.keys(answers).length}/
                                                {questions.length} câu
                                            </p>
                                            <button
                                                onClick={handleSubmitQuiz}
                                                disabled={Object.keys(answers).length === 0}
                                                className="btn-primary text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                                            >
                                                Nộp bài
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="card p-6">
                                <p
                                    className="text-sm text-center py-12"
                                    style={{ color: 'var(--color-text-secondary)' }}
                                >
                                    Bài học này chưa có câu hỏi luyện tập.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Complete Lesson Button */}
            <div className="card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                {completed ? (
                    <div className="flex items-center gap-3 text-green-400">
                        <CheckCircle className="w-6 h-6" />
                        <span className="font-medium">Bạn đã hoàn thành bài học này!</span>
                    </div>
                ) : (
                    <>
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            Đánh dấu bài học đã hoàn thành khi bạn sẵn sàng.
                        </p>
                        <button
                            onClick={handleCompleteLesson}
                            disabled={completing}
                            className="btn-primary text-sm flex items-center gap-2 disabled:opacity-60"
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
            </div>
        </div>
    )
}
