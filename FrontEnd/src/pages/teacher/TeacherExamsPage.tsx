import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { examApi, ExamResponse, ExamRequest } from '../../services/api/examApi'
import { classroomApi, ClassRoomResponse } from '../../services/api/classroomApi'
import { questionApi, QuestionResponse } from '../../services/api/questionApi'
import DataTable from '../../components/ui/DataTable'
import Dialog from '../../components/ui/Dialog'
import Badge from '../../components/ui/Badge'
import {
    Plus,
    Pencil,
    Trash2,
    Loader2,
    AlertTriangle,
    Send,
    Lock,
    BarChart3,
    Clock,
} from 'lucide-react'

interface ExamForm {
    title: string
    classId: number | ''
    startTime: string
    endTime: string
    durationMinutes: number
    shuffleQuestions: boolean
    shuffleAnswers: boolean
    antiCheatEnabled: boolean
    questionIds: number[]
}

const emptyForm: ExamForm = {
    title: '',
    classId: '',
    startTime: '',
    endTime: '',
    durationMinutes: 60,
    shuffleQuestions: false,
    shuffleAnswers: false,
    antiCheatEnabled: false,
    questionIds: [],
}

export default function TeacherExamsPage() {
    const navigate = useNavigate()
    const user = useAuthStore((s) => s.user)
    const [exams, setExams] = useState<ExamResponse[]>([])
    const [classes, setClasses] = useState<ClassRoomResponse[]>([])
    const [questions, setQuestions] = useState<QuestionResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Dialog
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [form, setForm] = useState<ExamForm>(emptyForm)
    const [saving, setSaving] = useState(false)

    const fetchData = useCallback(async () => {
        if (!user?.id) return
        setLoading(true)
        setError(null)
        try {
            const [examPage, cls, qs] = await Promise.all([
                examApi.getByTeacher(user.id, 0, 100),
                classroomApi.getByTeacher(user.id),
                questionApi.getAll(),
            ])
            setExams(examPage.content)
            setClasses(cls)
            setQuestions(qs)
        } catch {
            setError('Không thể tải dữ liệu.')
        } finally {
            setLoading(false)
        }
    }, [user?.id])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const openCreate = () => {
        setEditingId(null)
        setForm(emptyForm)
        setDialogOpen(true)
    }

    const openEdit = (exam: ExamResponse) => {
        setEditingId(exam.id)
        setForm({
            title: exam.title,
            classId: exam.classId ?? '',
            startTime: exam.startTime ? exam.startTime.slice(0, 16) : '',
            endTime: exam.endTime ? exam.endTime.slice(0, 16) : '',
            durationMinutes: exam.durationMinutes ?? 60,
            shuffleQuestions: exam.shuffleQuestions ?? false,
            shuffleAnswers: exam.shuffleAnswers ?? false,
            antiCheatEnabled: exam.antiCheatEnabled ?? false,
            questionIds: [],
        })
        setDialogOpen(true)
    }

    const handleSave = async () => {
        if (!form.title.trim() || !form.classId || !user?.id) return
        setSaving(true)
        try {
            const payload: ExamRequest = {
                title: form.title.trim(),
                classId: Number(form.classId),
                startTime: form.startTime,
                endTime: form.endTime,
                durationMinutes: form.durationMinutes,
                shuffleQuestions: form.shuffleQuestions,
                shuffleAnswers: form.shuffleAnswers,
                antiCheatEnabled: form.antiCheatEnabled,
                questionIds: form.questionIds,
            }
            if (editingId) {
                await examApi.update(editingId, payload)
            } else {
                await examApi.create(user.id, payload)
            }
            setDialogOpen(false)
            await fetchData()
        } catch {
            alert('Lưu bài thi thất bại.')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc muốn xóa bài thi này?')) return
        try {
            await examApi.delete(id)
            await fetchData()
        } catch {
            alert('Xóa thất bại.')
        }
    }

    const handlePublish = async (id: number) => {
        if (!confirm('Phát hành bài thi?')) return
        try {
            await examApi.publish(id)
            await fetchData()
        } catch {
            alert('Phát hành thất bại.')
        }
    }

    const handleClose = async (id: number) => {
        if (!confirm('Đóng bài thi?')) return
        try {
            await examApi.close(id)
            await fetchData()
        } catch {
            alert('Đóng thất bại.')
        }
    }

    const toggleQuestion = (qId: number) => {
        setForm((prev) => ({
            ...prev,
            questionIds: prev.questionIds.includes(qId)
                ? prev.questionIds.filter((id) => id !== qId)
                : [...prev.questionIds, qId],
        }))
    }

    if (error && !loading) {
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

    const statusBadge = (status: string) => {
        switch (status) {
            case 'PUBLISHED':
                return <Badge variant="success">Đang mở</Badge>
            case 'CLOSED':
                return <Badge variant="danger">Đã đóng</Badge>
            default:
                return <Badge variant="warning">Nháp</Badge>
        }
    }

    const formatDateTime = (dt?: string) => {
        if (!dt) return '—'
        return new Date(dt).toLocaleString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const columns = [
        {
            key: 'title',
            label: 'Tiêu đề',
            render: (item: Record<string, unknown>) => (
                <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                    {item.title as string}
                </span>
            ),
        },
        {
            key: 'status',
            label: 'Trạng thái',
            render: (item: Record<string, unknown>) => statusBadge(item.status as string),
        },
        {
            key: 'className',
            label: 'Lớp',
            render: (item: Record<string, unknown>) => (
                <span style={{ color: 'var(--color-text-secondary)' }}>{(item.className as string) || '—'}</span>
            ),
        },
        {
            key: 'startTime',
            label: 'Bắt đầu',
            render: (item: Record<string, unknown>) => (
                <span className="text-xs flex items-center gap-1" style={{ color: 'var(--color-text-secondary)' }}>
                    <Clock className="w-3 h-3" />
                    {formatDateTime(item.startTime as string)}
                </span>
            ),
        },
        {
            key: 'submittedCount',
            label: 'Đã nộp',
            render: (item: Record<string, unknown>) => (
                <span style={{ color: 'var(--color-text-secondary)' }}>{(item.submittedCount as number) ?? 0}</span>
            ),
        },
        {
            key: 'actions',
            label: 'Thao tác',
            render: (item: Record<string, unknown>) => {
                const exam = item as unknown as ExamResponse
                return (
                    <div className="flex items-center gap-1">
                        {exam.status === 'DRAFT' && (
                            <button
                                onClick={(e) => { e.stopPropagation(); handlePublish(exam.id) }}
                                className="p-2 rounded-lg hover:bg-emerald-500/15 text-emerald-400 transition-colors"
                                title="Phát hành"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        )}
                        {exam.status === 'PUBLISHED' && (
                            <button
                                onClick={(e) => { e.stopPropagation(); handleClose(exam.id) }}
                                className="p-2 rounded-lg hover:bg-orange-500/15 text-orange-400 transition-colors"
                                title="Đóng bài thi"
                            >
                                <Lock className="w-4 h-4" />
                            </button>
                        )}
                        <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/teacher/exams/${exam.id}/results`) }}
                            className="p-2 rounded-lg hover:bg-blue-500/15 text-blue-400 transition-colors"
                            title="Xem kết quả"
                        >
                            <BarChart3 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); openEdit(exam) }}
                            className="p-2 rounded-lg hover:bg-emerald-500/15 text-emerald-400 transition-colors"
                            title="Sửa"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(exam.id) }}
                            className="p-2 rounded-lg hover:bg-red-500/15 text-red-400 transition-colors"
                            title="Xóa"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                )
            },
        },
    ]

    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                        Quản lý bài thi
                    </h1>
                    <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                        {exams.length} bài thi
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Tạo bài thi
                </button>
            </div>

            {/* Table */}
            <DataTable
                columns={columns}
                data={exams as unknown as Record<string, unknown>[]}
                loading={loading}
                emptyMessage="Chưa có bài thi nào"
            />

            {/* Create / Edit Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                title={editingId ? 'Chỉnh sửa bài thi' : 'Tạo bài thi mới'}
                footer={
                    <>
                        <button
                            onClick={() => setDialogOpen(false)}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-slate-700/50"
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || !form.title.trim() || !form.classId}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                            {editingId ? 'Cập nhật' : 'Tạo mới'}
                        </button>
                    </>
                }
            >
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                            Tiêu đề <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
                            style={{
                                backgroundColor: 'var(--color-bg-secondary)',
                                borderColor: 'var(--color-bg-secondary)',
                                color: 'var(--color-text)',
                            }}
                        />
                    </div>

                    {/* Class */}
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                            Lớp <span className="text-red-400">*</span>
                        </label>
                        <select
                            value={form.classId}
                            onChange={(e) => setForm({ ...form, classId: e.target.value ? parseInt(e.target.value) : '' })}
                            className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
                            style={{
                                backgroundColor: 'var(--color-bg-secondary)',
                                borderColor: 'var(--color-bg-secondary)',
                                color: 'var(--color-text)',
                            }}
                        >
                            <option value="">-- Chọn lớp --</option>
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                                Bắt đầu
                            </label>
                            <input
                                type="datetime-local"
                                value={form.startTime}
                                onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
                                style={{
                                    backgroundColor: 'var(--color-bg-secondary)',
                                    borderColor: 'var(--color-bg-secondary)',
                                    color: 'var(--color-text)',
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                                Kết thúc
                            </label>
                            <input
                                type="datetime-local"
                                value={form.endTime}
                                onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
                                style={{
                                    backgroundColor: 'var(--color-bg-secondary)',
                                    borderColor: 'var(--color-bg-secondary)',
                                    color: 'var(--color-text)',
                                }}
                            />
                        </div>
                    </div>

                    {/* Duration */}
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                            Thời gian (phút)
                        </label>
                        <input
                            type="number"
                            min={1}
                            value={form.durationMinutes}
                            onChange={(e) => setForm({ ...form, durationMinutes: parseInt(e.target.value) || 60 })}
                            className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
                            style={{
                                backgroundColor: 'var(--color-bg-secondary)',
                                borderColor: 'var(--color-bg-secondary)',
                                color: 'var(--color-text)',
                            }}
                        />
                    </div>

                    {/* Checkboxes */}
                    <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.shuffleQuestions}
                                onChange={(e) => setForm({ ...form, shuffleQuestions: e.target.checked })}
                                className="w-4 h-4 rounded border-slate-600 accent-blue-600"
                            />
                            <span className="text-sm" style={{ color: 'var(--color-text)' }}>Xáo trộn câu hỏi</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.shuffleAnswers}
                                onChange={(e) => setForm({ ...form, shuffleAnswers: e.target.checked })}
                                className="w-4 h-4 rounded border-slate-600 accent-blue-600"
                            />
                            <span className="text-sm" style={{ color: 'var(--color-text)' }}>Xáo trộn đáp án</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.antiCheatEnabled}
                                onChange={(e) => setForm({ ...form, antiCheatEnabled: e.target.checked })}
                                className="w-4 h-4 rounded border-slate-600 accent-blue-600"
                            />
                            <span className="text-sm" style={{ color: 'var(--color-text)' }}>Chống gian lận</span>
                        </label>
                    </div>

                    {/* Question multi-select */}
                    <div>
                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                            Chọn câu hỏi ({form.questionIds.length} đã chọn)
                        </label>
                        <div
                            className="max-h-48 overflow-y-auto rounded-lg border p-2 space-y-1"
                            style={{
                                backgroundColor: 'var(--color-bg-secondary)',
                                borderColor: 'var(--color-bg-secondary)',
                            }}
                        >
                            {questions.length === 0 ? (
                                <p className="text-xs text-center py-4" style={{ color: 'var(--color-text-secondary)' }}>
                                    Chưa có câu hỏi nào
                                </p>
                            ) : (
                                questions.map((q) => (
                                    <label
                                        key={q.id}
                                        className="flex items-start gap-2 p-2 rounded-lg cursor-pointer hover:bg-slate-700/30 transition-colors"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={form.questionIds.includes(q.id)}
                                            onChange={() => toggleQuestion(q.id)}
                                            className="w-4 h-4 mt-0.5 rounded border-slate-600 accent-blue-600 shrink-0"
                                        />
                                        <div className="min-w-0">
                                            <p className="text-sm truncate" style={{ color: 'var(--color-text)' }}>
                                                {q.questionText}
                                            </p>
                                            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                                {q.questionType} · {q.points ?? 1} điểm
                                                {q.lessonTitle ? ` · ${q.lessonTitle}` : ''}
                                            </p>
                                        </div>
                                    </label>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}
