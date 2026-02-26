import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FileText, Clock, HelpCircle, ChevronDown, Play, Loader2 } from 'lucide-react'
import { examApi, ExamResponse } from '../../services/api/examApi'
import { classroomApi, ClassRoomResponse } from '../../services/api/classroomApi'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import { ExamSkeleton } from '../../components/ui/Skeleton'

export default function StudentExamsPage() {
    const navigate = useNavigate()
    const [classes, setClasses] = useState<ClassRoomResponse[]>([])
    const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
    const [exams, setExams] = useState<ExamResponse[]>([])
    const [loadingClasses, setLoadingClasses] = useState(true)
    const [loadingExams, setLoadingExams] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Fetch classes the student belongs to
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                setLoadingClasses(true)
                setError(null)
                const data = await classroomApi.getAll()
                setClasses(data || [])
                if (data && data.length > 0) {
                    setSelectedClassId(data[0].id)
                }
            } catch (err) {
                console.error('Failed to fetch classes:', err)
                setError('Không thể tải danh sách lớp học')
            } finally {
                setLoadingClasses(false)
            }
        }
        fetchClasses()
    }, [])

    // Fetch active exams when class is selected
    useEffect(() => {
        if (!selectedClassId) return

        const fetchExams = async () => {
            try {
                setLoadingExams(true)
                setError(null)
                const data = await examApi.getActiveByClass(selectedClassId)
                setExams(data || [])
            } catch (err) {
                console.error('Failed to fetch exams:', err)
                setError('Không thể tải danh sách bài thi')
            } finally {
                setLoadingExams(false)
            }
        }
        fetchExams()
    }, [selectedClassId])

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—'
        return new Date(dateStr).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const getExamStatus = (exam: ExamResponse) => {
        const now = new Date()
        const start = exam.startTime ? new Date(exam.startTime) : null
        const end = exam.endTime ? new Date(exam.endTime) : null

        if (start && start > now) {
            return { label: 'Sắp bắt đầu', variant: 'warning' as const }
        }
        if (start && end && start <= now && end >= now) {
            return { label: 'Đang diễn ra', variant: 'info' as const }
        }
        return { label: 'Đang mở', variant: 'info' as const }
    }

    const canTakeExam = (exam: ExamResponse) => {
        const now = new Date()
        const start = exam.startTime ? new Date(exam.startTime) : null
        const end = exam.endTime ? new Date(exam.endTime) : null

        if (start && start > now) return false
        if (end && end < now) return false
        return true
    }

    if (loadingClasses) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        )
    }

    if (classes.length === 0) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <EmptyState
                    icon={<FileText className="w-8 h-8" />}
                    title="Chưa tham gia lớp học nào"
                    description="Bạn cần tham gia một lớp học để xem và làm bài thi."
                />
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1
                    className="text-2xl md:text-3xl font-bold mb-2"
                    style={{ color: 'var(--color-text)' }}
                >
                    Bài thi
                </h1>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                    Chọn lớp học và xem các bài thi đang diễn ra
                </p>
            </div>

            {/* Class selector */}
            <div className="mb-6">
                <label
                    className="block text-sm font-medium mb-2"
                    style={{ color: 'var(--color-text-secondary)' }}
                >
                    Lớp học
                </label>
                <div className="relative w-full max-w-xs">
                    <select
                        value={selectedClassId ?? ''}
                        onChange={(e) => setSelectedClassId(Number(e.target.value))}
                        className="input-field appearance-none pr-10 cursor-pointer"
                    >
                        {classes.map((cls) => (
                            <option key={cls.id} value={cls.id}>
                                {cls.name} {cls.academicYear ? `(${cls.academicYear})` : ''}
                            </option>
                        ))}
                    </select>
                    <ChevronDown
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
                        style={{ color: 'var(--color-text-secondary)' }}
                    />
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Loading exams */}
            {loadingExams && (
                <div className="grid gap-4 sm:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <ExamSkeleton key={i} />
                    ))}
                </div>
            )}

            {/* Exams list */}
            {!loadingExams && exams.length === 0 && (
                <EmptyState
                    icon={<FileText className="w-8 h-8" />}
                    title="Không có bài thi nào"
                    description="Hiện tại chưa có bài thi nào đang diễn ra trong lớp này."
                />
            )}

            {!loadingExams && exams.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2">
                    {exams.map((exam) => {
                        const status = getExamStatus(exam)
                        const available = canTakeExam(exam)

                        return (
                            <div
                                key={exam.id}
                                className="card p-6 flex flex-col gap-4"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <h3
                                            className="text-lg font-semibold truncate"
                                            style={{ color: 'var(--color-text)' }}
                                        >
                                            {exam.title}
                                        </h3>
                                        {exam.className && (
                                            <p
                                                className="text-sm mt-1"
                                                style={{ color: 'var(--color-text-secondary)' }}
                                            >
                                                {exam.className}
                                            </p>
                                        )}
                                    </div>
                                    <Badge variant={status.variant}>{status.label}</Badge>
                                </div>

                                <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                    {exam.durationMinutes && (
                                        <span className="flex items-center gap-1.5">
                                            <Clock className="w-4 h-4" />
                                            {exam.durationMinutes} phút
                                        </span>
                                    )}
                                    {exam.questionCount != null && (
                                        <span className="flex items-center gap-1.5">
                                            <HelpCircle className="w-4 h-4" />
                                            {exam.questionCount} câu hỏi
                                        </span>
                                    )}
                                </div>

                                <div className="text-xs space-y-1" style={{ color: 'var(--color-text-secondary)' }}>
                                    <p>Bắt đầu: {formatDate(exam.startTime)}</p>
                                    <p>Kết thúc: {formatDate(exam.endTime)}</p>
                                </div>

                                <button
                                    onClick={() => navigate(`/exams/${exam.id}/take`)}
                                    disabled={!available}
                                    className={`mt-auto flex items-center justify-center gap-2 w-full py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${available
                                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25'
                                            : 'opacity-50 cursor-not-allowed'
                                        }`}
                                    style={!available ? { background: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' } : undefined}
                                >
                                    <Play className="w-4 h-4" />
                                    Vào thi
                                </button>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
