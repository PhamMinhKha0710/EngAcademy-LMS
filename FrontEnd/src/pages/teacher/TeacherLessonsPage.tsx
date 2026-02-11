import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api/axios'
import DataTable from '../../components/ui/DataTable'
import Dialog from '../../components/ui/Dialog'
import Badge from '../../components/ui/Badge'
import {
    Plus,
    Pencil,
    Trash2,
    BookOpen,
    HelpCircle,
    Loader2,
    AlertTriangle,
} from 'lucide-react'

interface Lesson {
    id: number
    title: string
    contentHtml?: string
    difficultyLevel?: number
    orderIndex?: number
    isPublished?: boolean
    vocabularyCount?: number
    questionCount?: number
}

interface LessonForm {
    title: string
    contentHtml: string
    difficultyLevel: number
    orderIndex: number
    isPublished: boolean
}

const emptyForm: LessonForm = {
    title: '',
    contentHtml: '',
    difficultyLevel: 1,
    orderIndex: 0,
    isPublished: false,
}

export default function TeacherLessonsPage() {
    const navigate = useNavigate()
    const [lessons, setLessons] = useState<Lesson[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Dialog
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [form, setForm] = useState<LessonForm>(emptyForm)
    const [saving, setSaving] = useState(false)

    const fetchLessons = useCallback(async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await api.get('/lessons?page=0&size=100')
            setLessons(res.data.data.content || [])
        } catch {
            setError('Không thể tải danh sách bài học.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchLessons()
    }, [fetchLessons])

    const openCreate = () => {
        setEditingId(null)
        setForm(emptyForm)
        setDialogOpen(true)
    }

    const openEdit = (lesson: Lesson) => {
        setEditingId(lesson.id)
        setForm({
            title: lesson.title,
            contentHtml: lesson.contentHtml || '',
            difficultyLevel: lesson.difficultyLevel ?? 1,
            orderIndex: lesson.orderIndex ?? 0,
            isPublished: lesson.isPublished ?? false,
        })
        setDialogOpen(true)
    }

    const handleSave = async () => {
        if (!form.title.trim()) return
        setSaving(true)
        try {
            if (editingId) {
                await api.put(`/lessons/${editingId}`, form)
            } else {
                await api.post('/lessons', form)
            }
            setDialogOpen(false)
            await fetchLessons()
        } catch {
            alert('Lưu bài học thất bại.')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc muốn xóa bài học này?')) return
        try {
            await api.delete(`/lessons/${id}`)
            await fetchLessons()
        } catch {
            alert('Xóa thất bại.')
        }
    }

    if (error && !loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
                <AlertTriangle className="w-10 h-10 text-red-400" />
                <p style={{ color: 'var(--color-text-secondary)' }}>{error}</p>
                <button
                    onClick={fetchLessons}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                    Thử lại
                </button>
            </div>
        )
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
            key: 'difficultyLevel',
            label: 'Độ khó',
            render: (item: Record<string, unknown>) => {
                const lvl = (item.difficultyLevel as number) || 1
                return (
                    <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }, (_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${i < lvl ? 'bg-blue-400' : 'bg-slate-600'}`}
                            />
                        ))}
                        <span className="ml-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                            {lvl}/5
                        </span>
                    </div>
                )
            },
        },
        {
            key: 'isPublished',
            label: 'Trạng thái',
            render: (item: Record<string, unknown>) => (
                <Badge variant={item.isPublished ? 'success' : 'warning'}>
                    {item.isPublished ? 'Đã xuất bản' : 'Nháp'}
                </Badge>
            ),
        },
        {
            key: 'orderIndex',
            label: 'Thứ tự',
            render: (item: Record<string, unknown>) => (
                <span style={{ color: 'var(--color-text-secondary)' }}>{(item.orderIndex as number) ?? 0}</span>
            ),
        },
        {
            key: 'actions',
            label: 'Thao tác',
            render: (item: Record<string, unknown>) => {
                const lesson = item as unknown as Lesson
                return (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/teacher/vocabulary?lessonId=${lesson.id}`) }}
                            className="p-2 rounded-lg hover:bg-blue-500/15 text-blue-400 transition-colors"
                            title="Từ vựng"
                        >
                            <BookOpen className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/teacher/questions?lessonId=${lesson.id}`) }}
                            className="p-2 rounded-lg hover:bg-purple-500/15 text-purple-400 transition-colors"
                            title="Câu hỏi"
                        >
                            <HelpCircle className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); openEdit(lesson) }}
                            className="p-2 rounded-lg hover:bg-emerald-500/15 text-emerald-400 transition-colors"
                            title="Sửa"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(lesson.id) }}
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
                        Quản lý bài học
                    </h1>
                    <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                        {lessons.length} bài học
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Tạo bài học
                </button>
            </div>

            {/* Table */}
            <DataTable
                columns={columns}
                data={lessons as unknown as Record<string, unknown>[]}
                loading={loading}
                emptyMessage="Chưa có bài học nào"
            />

            {/* Create / Edit Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                title={editingId ? 'Chỉnh sửa bài học' : 'Tạo bài học mới'}
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
                            disabled={saving || !form.title.trim()}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                            {editingId ? 'Cập nhật' : 'Tạo mới'}
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
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
                    {/* Content HTML */}
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                            Nội dung (HTML)
                        </label>
                        <textarea
                            rows={5}
                            value={form.contentHtml}
                            onChange={(e) => setForm({ ...form, contentHtml: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/40 resize-y"
                            style={{
                                backgroundColor: 'var(--color-bg-secondary)',
                                borderColor: 'var(--color-bg-secondary)',
                                color: 'var(--color-text)',
                            }}
                        />
                    </div>
                    {/* Difficulty + Order */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                                Độ khó
                            </label>
                            <select
                                value={form.difficultyLevel}
                                onChange={(e) => setForm({ ...form, difficultyLevel: parseInt(e.target.value) })}
                                className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
                                style={{
                                    backgroundColor: 'var(--color-bg-secondary)',
                                    borderColor: 'var(--color-bg-secondary)',
                                    color: 'var(--color-text)',
                                }}
                            >
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <option key={n} value={n}>
                                        {n}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                                Thứ tự
                            </label>
                            <input
                                type="number"
                                min={0}
                                value={form.orderIndex}
                                onChange={(e) => setForm({ ...form, orderIndex: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
                                style={{
                                    backgroundColor: 'var(--color-bg-secondary)',
                                    borderColor: 'var(--color-bg-secondary)',
                                    color: 'var(--color-text)',
                                }}
                            />
                        </div>
                    </div>
                    {/* Published */}
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.isPublished}
                            onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                            className="w-4 h-4 rounded border-slate-600 accent-blue-600"
                        />
                        <span className="text-sm" style={{ color: 'var(--color-text)' }}>Xuất bản</span>
                    </label>
                </div>
            </Dialog>
        </div>
    )
}
