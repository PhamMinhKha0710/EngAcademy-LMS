import { useState, useEffect, useCallback, Fragment } from 'react'
import { useParams } from 'react-router-dom'
import { examApi, ExamResponse, ExamResultResponse, AntiCheatEvent } from '../../services/api/examApi'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import Breadcrumb from '../../components/ui/Breadcrumb'
import {
    Loader2,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    ShieldAlert,
    Trophy,
    Inbox,
} from 'lucide-react'

export default function ExamResultsPage() {
    const { examId } = useParams<{ examId: string }>()

    const [exam, setExam] = useState<ExamResponse | null>(null)
    const [results, setResults] = useState<ExamResultResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Expandable anti-cheat
    const [expandedId, setExpandedId] = useState<number | null>(null)
    const [antiCheatEvents, setAntiCheatEvents] = useState<AntiCheatEvent[]>([])
    const [eventsLoading, setEventsLoading] = useState(false)

    const fetchData = useCallback(async () => {
        if (!examId) return
        setLoading(true)
        setError(null)
        try {
            const [examInfo, examResults] = await Promise.all([
                examApi.getById(parseInt(examId)),
                examApi.getResults(parseInt(examId)),
            ])
            setExam(examInfo)
            setResults(examResults)
        } catch {
            setError('Không thể tải kết quả bài thi.')
        } finally {
            setLoading(false)
        }
    }, [examId])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const toggleExpand = async (resultId: number) => {
        if (expandedId === resultId) {
            setExpandedId(null)
            setAntiCheatEvents([])
            return
        }
        setExpandedId(resultId)
        setEventsLoading(true)
        try {
            const events = await examApi.getAntiCheatEvents(resultId)
            setAntiCheatEvents(events)
        } catch {
            setAntiCheatEvents([])
        } finally {
            setEventsLoading(false)
        }
    }

    const getScoreColor = (percentage?: number) => {
        if (percentage == null) return ''
        if (percentage >= 80) return 'text-emerald-400'
        if (percentage >= 60) return 'text-blue-400'
        if (percentage >= 40) return 'text-yellow-400'
        return 'text-red-400'
    }

    const getRowBg = (percentage?: number) => {
        if (percentage == null) return ''
        if (percentage >= 80) return 'border-l-4 border-l-emerald-500/50'
        if (percentage >= 60) return 'border-l-4 border-l-blue-500/50'
        if (percentage >= 40) return 'border-l-4 border-l-yellow-500/50'
        return 'border-l-4 border-l-red-500/50'
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
                <AlertTriangle className="w-10 h-10 text-red-400" />
                <p style={{ color: 'var(--color-text-secondary)' }}>{error}</p>
                <button
                    onClick={fetchData}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                    Thử lại
                </button>
            </div>
        )
    }

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <Breadcrumb items={[
                { label: 'Quản lý bài thi', path: '/teacher/exams' },
                { label: exam?.title ? `Kết quả: ${exam.title}` : 'Kết quả bài thi' }
            ]} />

            {/* Header */}
            <div className="flex items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                        Kết quả: {exam?.title}
                    </h1>
                    <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                        {exam?.className && `Lớp ${exam.className} · `}
                        {results.length} bài nộp
                        {exam?.averageScore != null && ` · Điểm TB: ${Math.round(exam.averageScore)}%`}
                    </p>
                </div>
            </div>

            {/* Results */}
            {results.length === 0 ? (
                <EmptyState
                    icon={<Inbox className="w-8 h-8" />}
                    title="Chưa có bài nộp"
                    description="Chưa có học sinh nào nộp bài thi này."
                />
            ) : (
                <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--color-bg-secondary)' }}>
                    <table className="w-full text-left">
                        <thead>
                            <tr style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Học sinh</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Điểm</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Đúng/Tổng</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Phần trăm</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Xếp loại</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Vi phạm</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider w-10" style={{ color: 'var(--color-text-secondary)' }}></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: 'var(--color-bg-secondary)' }}>
                            {results.map((r) => (
                                <Fragment key={r.id}>
                                    <tr
                                        className={`transition-colors hover:bg-slate-800/30 cursor-pointer ${getRowBg(r.percentage)}`}
                                        style={{ backgroundColor: 'var(--color-bg)' }}
                                        onClick={() => toggleExpand(r.id)}
                                    >
                                        <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                                            {r.studentName || `Student #${r.studentId}`}
                                        </td>
                                        <td className={`px-4 py-3 text-sm font-semibold ${getScoreColor(r.percentage)}`}>
                                            {r.score ?? '—'}
                                        </td>
                                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                            {r.correctCount ?? 0}/{r.totalQuestions ?? 0}
                                        </td>
                                        <td className={`px-4 py-3 text-sm font-medium ${getScoreColor(r.percentage)}`}>
                                            {r.percentage != null ? `${Math.round(r.percentage)}%` : '—'}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {r.grade ? (
                                                <Badge
                                                    variant={
                                                        r.grade === 'A' || r.grade === 'A+'
                                                            ? 'success'
                                                            : r.grade === 'B' || r.grade === 'B+'
                                                                ? 'info'
                                                                : r.grade === 'C'
                                                                    ? 'warning'
                                                                    : 'danger'
                                                    }
                                                >
                                                    {r.grade}
                                                </Badge>
                                            ) : (
                                                '—'
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            {(r.violationCount ?? 0) > 0 ? (
                                                <span className="flex items-center gap-1 text-red-400">
                                                    <ShieldAlert className="w-3.5 h-3.5" />
                                                    {r.violationCount}
                                                </span>
                                            ) : (
                                                <span style={{ color: 'var(--color-text-secondary)' }}>0</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {expandedId === r.id ? (
                                                <ChevronUp className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                                            ) : (
                                                <ChevronDown className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                                            )}
                                        </td>
                                    </tr>

                                    {/* Expanded anti-cheat events */}
                                    {expandedId === r.id && (
                                        <tr>
                                            <td colSpan={7} className="p-0">
                                                <div
                                                    className="px-6 py-4"
                                                    style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                                                >
                                                    <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                                                        Sự kiện chống gian lận
                                                    </p>
                                                    {eventsLoading ? (
                                                        <div className="flex items-center justify-center py-4">
                                                            <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                                                        </div>
                                                    ) : antiCheatEvents.length === 0 ? (
                                                        <p className="text-sm py-2 flex items-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
                                                            <Trophy className="w-4 h-4 text-emerald-400" />
                                                            Không phát hiện vi phạm nào
                                                        </p>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {antiCheatEvents.map((evt) => (
                                                                <div
                                                                    key={evt.id}
                                                                    className="flex items-start gap-3 p-3 rounded-lg"
                                                                    style={{ backgroundColor: 'var(--color-bg)' }}
                                                                >
                                                                    <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                                                                    <div>
                                                                        <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                                                                            {evt.eventType}
                                                                        </p>
                                                                        {evt.details && (
                                                                            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                                                                                {evt.details}
                                                                            </p>
                                                                        )}
                                                                        {evt.timestamp && (
                                                                            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                                                                                {new Date(evt.timestamp).toLocaleString('vi-VN')}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
