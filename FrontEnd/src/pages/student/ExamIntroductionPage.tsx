import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
    ArrowLeft,
    ArrowRight,
    CircleCheck,
    Clock3,
    HelpCircle,
    Info,
    Loader2,
    ShieldAlert,
    Wifi,
} from 'lucide-react'
import { examApi, ExamResponse } from '../../services/api/examApi'
import { useAuthStore } from '../../store/authStore'

export default function ExamIntroductionPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const examId = Number(id)

    const [exam, setExam] = useState<ExamResponse | null>(null)
    const [submissionState, setSubmissionState] = useState<'not_submitted' | 'submitted_waiting' | 'submitted_published'>('not_submitted')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!examId) return

        const fetchExam = async () => {
            try {
                setLoading(true)
                setError(null)
                // Student must use student endpoint, not teacher/admin endpoint.
                const data = await examApi.getForTake(examId)
                setExam(data)

                // Detect if this student already submitted and whether score is published.
                try {
                    await examApi.getMyResult(examId)
                    setSubmissionState('submitted_published')
                } catch (resultErr: any) {
                    const message = resultErr?.response?.data?.message || ''
                    if (typeof message === 'string' && message.includes('Giáo viên chưa công bố kết quả bài thi')) {
                        setSubmissionState('submitted_waiting')
                    } else {
                        setSubmissionState('not_submitted')
                    }
                }
            } catch (err: any) {
                setError(err?.response?.data?.message || 'Không thể tải thông tin bài thi')
            } finally {
                setLoading(false)
            }
        }

        fetchExam()
    }, [examId, user?.id])

    const canStart = useMemo(() => {
        if (!exam) return false
        const now = new Date()
        const start = exam.startTime ? new Date(exam.startTime) : null
        const end = exam.endTime ? new Date(exam.endTime) : null
        if (start && start > now) return false
        if (end && end < now) return false
        return true
    }, [exam])

    const formatDateTime = (value?: string) => {
        if (!value) return '—'
        return new Date(value).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                <p style={{ color: 'var(--color-text-secondary)' }}>Đang tải thông tin bài thi...</p>
            </div>
        )
    }

    if (error || !exam) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16">
                <div className="card p-8 text-center space-y-4">
                    <div className="mx-auto w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                        <ShieldAlert className="w-6 h-6 text-red-400" />
                    </div>
                    <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
                        Không thể mở màn giới thiệu bài thi
                    </h2>
                    <p style={{ color: 'var(--color-text-secondary)' }}>{error || 'Đã có lỗi xảy ra'}</p>
                    <button
                        onClick={() => navigate('/exams')}
                        className="btn-secondary inline-flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Quay về danh sách
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="card overflow-hidden">
                <div
                    className="relative px-6 sm:px-10 py-10 sm:py-12 text-center border-b"
                    style={{
                        background: 'color-mix(in srgb, var(--color-primary, #0da6f2) 10%, var(--color-bg) 90%)',
                        borderColor: 'var(--color-border)',
                    }}
                >
                    <div className="relative z-10 flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
                            <Info className="w-7 h-7 text-blue-500" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold" style={{ color: 'var(--color-text)' }}>
                            {exam.title}
                        </h1>
                        <p className="max-w-2xl text-sm sm:text-base" style={{ color: 'var(--color-text-secondary)' }}>
                            Hãy đọc kỹ hướng dẫn trước khi bắt đầu làm bài để có kết quả tốt nhất.
                        </p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3">
                    <div
                        className="md:col-span-1 p-6 sm:p-8 border-b md:border-b-0 md:border-r space-y-5"
                        style={{
                            backgroundColor: 'var(--color-bg-secondary)',
                            borderColor: 'var(--color-border)',
                        }}
                    >
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                                Thời lượng
                            </p>
                            <div className="flex items-center gap-3">
                                <Clock3 className="w-5 h-5 text-blue-500" />
                                <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                                    {exam.durationMinutes ?? 0} phút
                                </p>
                            </div>
                        </div>
                        <div className="h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                                Số câu hỏi
                            </p>
                            <div className="flex items-center gap-3">
                                <HelpCircle className="w-5 h-5 text-blue-500" />
                                <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                                    {exam.questionCount ?? 0} câu
                                </p>
                            </div>
                        </div>
                        <div className="h-px" style={{ backgroundColor: 'var(--color-border)' }} />
                        <div className="space-y-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            <p>Bắt đầu: {formatDateTime(exam.startTime)}</p>
                            <p>Kết thúc: {formatDateTime(exam.endTime)}</p>
                        </div>
                    </div>

                    <div className="md:col-span-2 p-6 sm:p-8">
                        <h3 className="text-xl font-bold mb-5 flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                            <Info className="w-5 h-5 text-blue-500" />
                            Hướng dẫn làm bài
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-3 rounded-xl border" style={{ borderColor: 'var(--color-border)' }}>
                                <CircleCheck className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                                <p style={{ color: 'var(--color-text-secondary)' }}>
                                    Đồng hồ sẽ bắt đầu chạy ngay khi vào đề. Bạn không thể tạm dừng bài thi.
                                </p>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-xl border" style={{ borderColor: 'var(--color-border)' }}>
                                <Wifi className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                                <p style={{ color: 'var(--color-text-secondary)' }}>
                                    Đảm bảo kết nối Internet ổn định để tránh gián đoạn trong lúc làm bài.
                                </p>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-xl border" style={{ borderColor: 'var(--color-border)' }}>
                                <ShieldAlert className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                                <p style={{ color: 'var(--color-text-secondary)' }}>
                                    Không tải lại trang hoặc thoát tab nhiều lần để tránh bị đánh dấu vi phạm.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 pt-5 border-t flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between" style={{ borderColor: 'var(--color-border)' }}>
                            <button
                                onClick={() => navigate('/exams')}
                                className="btn-secondary inline-flex items-center gap-2 justify-center"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Quay về danh sách
                            </button>

                            {submissionState === 'submitted_published' ? (
                                <button
                                    onClick={() => navigate(`/exams/${exam.id}/result`)}
                                    className="btn-primary inline-flex items-center gap-2 justify-center"
                                >
                                    Xem điểm
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            ) : submissionState === 'submitted_waiting' ? (
                                <button
                                    disabled
                                    className="btn-secondary inline-flex items-center gap-2 justify-center opacity-70 cursor-not-allowed"
                                >
                                    Đã nộp - Chờ công bố điểm
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate(`/exams/${exam.id}/take`)}
                                    disabled={!canStart}
                                    className="btn-primary inline-flex items-center gap-2 justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    Bắt đầu làm bài
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="h-1.5 w-full" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                    <div className="h-full w-1/4 bg-blue-500 rounded-r-full" />
                </div>
            </div>
        </div>
    )
}
