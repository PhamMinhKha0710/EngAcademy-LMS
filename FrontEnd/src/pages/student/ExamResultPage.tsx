import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle, XCircle, ArrowLeft, Loader2, Trophy, AlertTriangle } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { examApi, ExamResultResponse } from '../../services/api/examApi'
import ProgressBar from '../../components/ui/ProgressBar'
import Breadcrumb from '../../components/ui/Breadcrumb'

export default function ExamResultPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const examId = Number(id)

    const [result, setResult] = useState<ExamResultResponse | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!examId || !user?.id) return

        const fetchResult = async () => {
            try {
                setLoading(true)
                setError(null)
                const results = await examApi.getResults(examId)

                // Find the current student's result
                const studentResult = results?.find(
                    (r: ExamResultResponse) => r.studentId === user.id
                )

                // Fallback: check by examResultId stored in sessionStorage
                if (!studentResult) {
                    const storedId = sessionStorage.getItem(`exam_result_${examId}`)
                    if (storedId) {
                        const fallback = results?.find(
                            (r: ExamResultResponse) => r.id === Number(storedId)
                        )
                        if (fallback) {
                            setResult(fallback)
                            return
                        }
                    }
                    setError('Không tìm thấy kết quả bài thi của bạn')
                    return
                }

                setResult(studentResult)
            } catch (err: any) {
                console.error('Failed to fetch result:', err)
                setError(err.response?.data?.message || 'Không thể tải kết quả bài thi')
            } finally {
                setLoading(false)
            }
        }
        fetchResult()
    }, [examId, user?.id])

    const getScoreColor = (percentage?: number) => {
        if (!percentage) return { text: 'text-slate-400', bg: 'from-slate-500 to-slate-600', ring: 'ring-slate-500/20' }
        if (percentage >= 80) return { text: 'text-green-400', bg: 'from-green-500 to-emerald-600', ring: 'ring-green-500/20' }
        if (percentage >= 50) return { text: 'text-yellow-400', bg: 'from-yellow-500 to-orange-500', ring: 'ring-yellow-500/20' }
        return { text: 'text-red-400', bg: 'from-red-500 to-rose-600', ring: 'ring-red-500/20' }
    }

    const getGradeLabel = (grade?: string) => {
        if (!grade) return 'N/A'
        const labels: Record<string, string> = {
            A: 'Xuất sắc',
            B: 'Giỏi',
            C: 'Khá',
            D: 'Trung bình',
            F: 'Chưa đạt',
        }
        return labels[grade] || grade
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                <p style={{ color: 'var(--color-text-secondary)' }}>Đang tải kết quả...</p>
            </div>
        )
    }

    if (error || !result) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-16 text-center">
                <div className="card p-8 flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-red-400" />
                    </div>
                    <h2 className="text-xl font-semibold" style={{ color: 'var(--color-text)' }}>
                        {error || 'Không tìm thấy kết quả'}
                    </h2>
                    <button
                        onClick={() => navigate('/exams')}
                        className="btn-secondary mt-2 flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Quay về danh sách
                    </button>
                </div>
            </div>
        )
    }

    const percentage = result.percentage ?? 0
    const colors = getScoreColor(percentage)

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <Breadcrumb items={[
                { label: 'Bài thi', path: '/exams' },
                { label: result.examTitle ? `Kết quả: ${result.examTitle}` : 'Kết quả bài thi' }
            ]} />

            {/* Result card */}
            <div className="card overflow-hidden">
                {/* Header gradient */}
                <div
                    className={`px-6 py-8 text-center bg-gradient-to-r ${colors.bg}`}
                >
                    <div className="flex justify-center mb-4">
                        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            {percentage >= 50 ? (
                                <Trophy className="w-10 h-10 text-white" />
                            ) : (
                                <XCircle className="w-10 h-10 text-white" />
                            )}
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-1">
                        {result.score != null ? result.score.toFixed(1) : '—'} điểm
                    </h1>
                    {result.examTitle && (
                        <p className="text-white/80 text-sm mt-2">{result.examTitle}</p>
                    )}
                </div>

                {/* Details */}
                <div className="p-6 space-y-6">
                    {/* Grade */}
                    <div className="text-center">
                        <span
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${colors.text} ring-2 ${colors.ring}`}
                            style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                        >
                            {percentage >= 50 ? (
                                <CheckCircle className="w-4 h-4" />
                            ) : (
                                <XCircle className="w-4 h-4" />
                            )}
                            {result.grade ? `${result.grade} — ${getGradeLabel(result.grade)}` : (percentage >= 50 ? 'Đạt' : 'Chưa đạt')}
                        </span>
                    </div>

                    {/* Score percentage bar */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                                Tỉ lệ đúng
                            </span>
                            <span className={`text-sm font-bold ${colors.text}`}>
                                {percentage.toFixed(1)}%
                            </span>
                        </div>
                        <ProgressBar
                            value={percentage}
                            color={
                                percentage >= 80
                                    ? 'from-green-500 to-emerald-500'
                                    : percentage >= 50
                                        ? 'from-yellow-500 to-orange-500'
                                        : 'from-red-500 to-rose-500'
                            }
                            height="h-3"
                        />
                    </div>

                    {/* Stats grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div
                            className="p-4 rounded-xl text-center"
                            style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                        >
                            <p className="text-2xl font-bold text-green-400">
                                {result.correctCount ?? 0}
                            </p>
                            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                                Câu đúng
                            </p>
                        </div>
                        <div
                            className="p-4 rounded-xl text-center"
                            style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                        >
                            <p className="text-2xl font-bold text-red-400">
                                {(result.totalQuestions ?? 0) - (result.correctCount ?? 0)}
                            </p>
                            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                                Câu sai
                            </p>
                        </div>
                        <div
                            className="p-4 rounded-xl text-center"
                            style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                        >
                            <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                                {result.totalQuestions ?? 0}
                            </p>
                            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                                Tổng câu hỏi
                            </p>
                        </div>
                        <div
                            className="p-4 rounded-xl text-center"
                            style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                        >
                            <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                                {result.violationCount ?? 0}
                            </p>
                            <p className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                                Vi phạm
                            </p>
                        </div>
                    </div>

                    {/* Submitted at */}
                    {result.submittedAt && (
                        <p className="text-center text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                            Nộp bài lúc:{' '}
                            {new Date(result.submittedAt).toLocaleString('vi-VN', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                            })}
                        </p>
                    )}

                    {/* Actions */}
                    <div className="flex justify-center pt-2">
                        <button
                            onClick={() => navigate('/exams')}
                            className="btn-primary flex items-center gap-2"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Quay về danh sách
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
