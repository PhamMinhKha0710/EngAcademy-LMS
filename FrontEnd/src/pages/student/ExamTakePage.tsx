import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AlertTriangle, Send, Loader2, ShieldAlert } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { examApi, ExamTakeDTO, SubmitExamRequest } from '../../services/api/examApi'
import Timer from '../../components/ui/Timer'
import QuizQuestion from '../../components/ui/QuizQuestion'
import Dialog from '../../components/ui/Dialog'

interface ExamQuestion {
    id: number
    questionText: string
    questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_IN_BLANK'
    options: { id: number; optionText: string; isCorrect: boolean }[]
}

export default function ExamTakePage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const examId = Number(id)

    const [examData, setExamData] = useState<ExamTakeDTO | null>(null)
    const [questions, setQuestions] = useState<ExamQuestion[]>([])
    const [durationSeconds, setDurationSeconds] = useState(0)
    const [answers, setAnswers] = useState<Map<number, number[]>>(new Map())
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [tabSwitchCount, setTabSwitchCount] = useState(0)
    const submittedRef = useRef(false)

    const examResultId = examData?.examResultId

    // Start exam on mount
    useEffect(() => {
        if (!user?.id || !examId) return

        const startExam = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await examApi.startExam(examId, user.id)
                setExamData(data)

                // Store examResultId for result page
                sessionStorage.removeItem(`exam_result_${examId}`)
                sessionStorage.setItem(`exam_result_${user.id}_${examId}`, String(data.examResultId))

                // Extract questions and duration from exam data
                const examQuestions = (data as any).questions || []
                setQuestions(examQuestions)

                const duration = (data as any).durationMinutes || 30
                setDurationSeconds(duration * 60)
            } catch (err: any) {
                console.error('Failed to start exam:', err)
                const message = err.response?.data?.message || ''
                if (typeof message === 'string' && message.includes('Bạn đã hoàn thành bài thi này')) {
                    navigate(`/exams/${examId}/result`, { replace: true })
                    return
                }
                setError(message || 'Không thể bắt đầu bài thi. Có thể bạn đã làm bài thi này rồi.')
            } finally {
                setLoading(false)
            }
        }
        startExam()
    }, [examId, user?.id])

    // Anti-cheat: detect tab/visibility changes
    useEffect(() => {
        const handler = () => {
            if (document.hidden && examResultId) {
                setTabSwitchCount((prev) => prev + 1)
                examApi.logAntiCheatEvent(examId, {
                    examResultId,
                    eventType: 'TAB_SWITCH',
                    details: 'Student switched tab',
                })
            }
        }
        document.addEventListener('visibilitychange', handler)
        return () => document.removeEventListener('visibilitychange', handler)
    }, [examId, examResultId])

    // Handle answer selection
    const handleSelect = useCallback((questionId: number, optionIds: number[]) => {
        setAnswers((prev) => {
            const next = new Map(prev)
            next.set(questionId, optionIds)
            return next
        })
    }, [])

    // Submit exam
    const handleSubmit = useCallback(async () => {
        if (!examResultId || submittedRef.current) return
        submittedRef.current = true

        try {
            setSubmitting(true)
            setShowConfirmDialog(false)

            const answerPayload: SubmitExamRequest['answers'] = []
            answers.forEach((selectedOptionIds, questionId) => {
                answerPayload.push({
                    questionId,
                    selectedOptionId: selectedOptionIds?.[0],
                    selectedOptionIds,
                })
            })

            await examApi.submitExam(examId, {
                examResultId,
                answers: answerPayload,
            })

            sessionStorage.removeItem(`exam_submit_success_${examId}`)
            sessionStorage.setItem(`exam_submit_success_${user?.id}_${examId}`, '1')
            navigate(`/exams/${examId}/result`, { replace: true })
        } catch (err: any) {
            console.error('Failed to submit exam:', err)
            setError(err.response?.data?.message || 'Không thể nộp bài. Vui lòng thử lại.')
            submittedRef.current = false
            setSubmitting(false)
        }
    }, [examId, examResultId, answers, navigate, user?.id])

    // Handle time up
    const handleTimeUp = useCallback(() => {
        if (!submittedRef.current) {
            handleSubmit()
        }
    }, [handleSubmit])

    const answeredCount = answers.size
    const totalCount = questions.length
    const examTitle = (examData as any)?.title as string | undefined

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                <p style={{ color: 'var(--color-text-secondary)' }}>Đang khởi tạo phiên làm bài...</p>
            </div>
        )
    }

    if (error && !examData) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                <div
                    className="card p-8 flex flex-col items-center gap-4"
                >
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
                        Không thể bắt đầu bài thi
                    </h2>
                    <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {error}
                    </p>
                    <button
                        onClick={() => navigate('/exams')}
                        className="btn-secondary mt-2"
                    >
                        Quay về danh sách
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            {/* Sticky header with timer */}
            <div
                className="sticky top-0 z-40 -mx-4 px-4 py-4 backdrop-blur-md border-b mb-6"
                style={{
                    backgroundColor: 'color-mix(in srgb, var(--color-bg) 85%, transparent)',
                    borderColor: 'var(--color-border)',
                }}
            >
                <div className="flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-4">
                        {examTitle && (
                            <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                                {examTitle}
                            </span>
                        )}
                        {durationSeconds > 0 && (
                            <Timer
                                durationSeconds={durationSeconds}
                                onTimeUp={handleTimeUp}
                                isPaused={submitting}
                            />
                        )}
                        <span
                            className="text-sm font-medium"
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            {answeredCount}/{totalCount} câu đã trả lời
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {tabSwitchCount > 0 && (
                            <span className="flex items-center gap-1.5 text-xs text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/25">
                                <ShieldAlert className="w-3.5 h-3.5" />
                                {tabSwitchCount} lần rời tab
                            </span>
                        )}
                        <button
                            onClick={() => setShowConfirmDialog(true)}
                            disabled={submitting}
                            className="btn-primary flex items-center gap-2 !px-5 !py-2.5 text-sm"
                        >
                            {submitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Send className="w-4 h-4" />
                            )}
                            Nộp bài
                        </button>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="mt-3">
                    <div
                        className="w-full h-1.5 rounded-full overflow-hidden"
                        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                    >
                        <div
                            className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
                            style={{ width: `${totalCount ? (answeredCount / totalCount) * 100 : 0}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Error banner */}
            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Questions */}
            <div className="space-y-8">
                {questions.map((question, index) => (
                    <div key={question.id} className="card p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <span
                                className="flex items-center justify-center w-8 h-8 rounded-lg text-sm font-bold bg-blue-500/10 text-blue-500"
                            >
                                {index + 1}
                            </span>
                            {answers.has(question.id) && (
                                <span className="text-xs text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/25">
                                    Đã trả lời
                                </span>
                            )}
                        </div>
                        <QuizQuestion
                            question={question}
                            selectedOptionIds={answers.get(question.id) || []}
                            onSelect={(optionIds) => handleSelect(question.id, optionIds)}
                            disabled={submitting}
                        />
                    </div>
                ))}
            </div>

            {/* Bottom submit */}
            {questions.length > 0 && (
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={() => setShowConfirmDialog(true)}
                        disabled={submitting}
                        className="btn-primary flex items-center gap-2 text-base px-8 py-3"
                    >
                        {submitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <Send className="w-5 h-5" />
                        )}
                        Nộp bài thi
                    </button>
                </div>
            )}

            {/* Confirm dialog */}
            <Dialog
                open={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
                title="Xác nhận nộp bài"
                footer={
                    <>
                        <button
                            onClick={() => setShowConfirmDialog(false)}
                            className="btn-secondary !py-2 !px-4 text-sm"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="btn-primary !py-2 !px-4 text-sm"
                        >
                            Xác nhận nộp bài
                        </button>
                    </>
                }
            >
                <div className="space-y-3">
                    <p>Bạn có chắc chắn muốn nộp bài?</p>
                    <div
                        className="p-3 rounded-lg text-sm"
                        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                    >
                        <p>
                            Đã trả lời: <strong className="text-blue-500">{answeredCount}</strong> / {totalCount} câu
                        </p>
                        {answeredCount < totalCount && (
                            <p className="text-yellow-400 mt-1 flex items-center gap-1.5">
                                <AlertTriangle className="w-4 h-4" />
                                Còn {totalCount - answeredCount} câu chưa trả lời
                            </p>
                        )}
                    </div>
                </div>
            </Dialog>
        </div>
    )
}
