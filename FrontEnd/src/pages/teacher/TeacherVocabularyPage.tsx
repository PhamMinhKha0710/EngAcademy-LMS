import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { vocabularyApi, VocabularyResponse, VocabularyRequest } from '../../services/api/vocabularyApi'
import api from '../../services/api/axios'
import DataTable from '../../components/ui/DataTable'
import Dialog from '../../components/ui/Dialog'
import EmptyState from '../../components/ui/EmptyState'
import {
    Plus,
    Pencil,
    Trash2,
    Loader2,
    AlertTriangle,
    BookOpen,
    Inbox,
} from 'lucide-react'

interface Lesson {
    id: number
    title: string
}

interface VocabForm {
    word: string
    meaning: string
    pronunciation: string
    exampleSentence: string
    imageUrl: string
    audioUrl: string
    lessonId: number | ''
}

const emptyForm: VocabForm = {
    word: '',
    meaning: '',
    pronunciation: '',
    exampleSentence: '',
    imageUrl: '',
    audioUrl: '',
    lessonId: '',
}

export default function TeacherVocabularyPage() {
    const [searchParams, setSearchParams] = useSearchParams()
    const initialLessonId = searchParams.get('lessonId') || ''

    const [lessons, setLessons] = useState<Lesson[]>([])
    const [selectedLesson, setSelectedLesson] = useState<string>(initialLessonId)
    const [vocabulary, setVocabulary] = useState<VocabularyResponse[]>([])
    const [loading, setLoading] = useState(false)
    const [lessonsLoading, setLessonsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Dialog
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingId, setEditingId] = useState<number | null>(null)
    const [form, setForm] = useState<VocabForm>(emptyForm)
    const [saving, setSaving] = useState(false)

    const fetchLessons = useCallback(async () => {
        setLessonsLoading(true)
        try {
            const res = await api.get('/lessons?page=0&size=100')
            setLessons(res.data.data.content || [])
        } catch {
            /* ignore */
        } finally {
            setLessonsLoading(false)
        }
    }, [])

    const fetchVocabulary = useCallback(async (lessonId: string) => {
        if (!lessonId) {
            setVocabulary([])
            return
        }
        setLoading(true)
        setError(null)
        try {
            const data = await vocabularyApi.getByLesson(parseInt(lessonId))
            setVocabulary(data)
        } catch {
            setError('Không thể tải từ vựng.')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchLessons()
    }, [fetchLessons])

    useEffect(() => {
        fetchVocabulary(selectedLesson)
    }, [selectedLesson, fetchVocabulary])

    const handleLessonChange = (val: string) => {
        setSelectedLesson(val)
        if (val) {
            setSearchParams({ lessonId: val })
        } else {
            setSearchParams({})
        }
    }

    const openCreate = () => {
        setEditingId(null)
        setForm({ ...emptyForm, lessonId: selectedLesson ? parseInt(selectedLesson) : '' })
        setDialogOpen(true)
    }

    const openEdit = (v: VocabularyResponse) => {
        setEditingId(v.id)
        setForm({
            word: v.word,
            meaning: v.meaning,
            pronunciation: v.pronunciation || '',
            exampleSentence: v.exampleSentence || '',
            imageUrl: v.imageUrl || '',
            audioUrl: v.audioUrl || '',
            lessonId: v.lessonId ?? '',
        })
        setDialogOpen(true)
    }

    const handleSave = async () => {
        if (!form.word.trim() || !form.meaning.trim()) return
        setSaving(true)
        try {
            const payload: VocabularyRequest = {
                word: form.word.trim(),
                meaning: form.meaning.trim(),
                pronunciation: form.pronunciation.trim() || undefined,
                exampleSentence: form.exampleSentence.trim() || undefined,
                imageUrl: form.imageUrl.trim() || undefined,
                audioUrl: form.audioUrl.trim() || undefined,
                lessonId: form.lessonId ? Number(form.lessonId) : undefined,
            }
            if (editingId) {
                await vocabularyApi.update(editingId, payload)
            } else {
                await vocabularyApi.create(payload)
            }
            setDialogOpen(false)
            await fetchVocabulary(selectedLesson)
        } catch {
            alert('Lưu từ vựng thất bại.')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Bạn có chắc muốn xóa từ vựng này?')) return
        try {
            await vocabularyApi.delete(id)
            await fetchVocabulary(selectedLesson)
        } catch {
            alert('Xóa thất bại.')
        }
    }

    const columns = [
        {
            key: 'word',
            label: 'Từ vựng',
            render: (item: Record<string, unknown>) => (
                <span className="font-semibold" style={{ color: 'var(--color-text)' }}>
                    {item.word as string}
                </span>
            ),
        },
        {
            key: 'meaning',
            label: 'Nghĩa',
            render: (item: Record<string, unknown>) => (
                <span style={{ color: 'var(--color-text-secondary)' }}>{item.meaning as string}</span>
            ),
        },
        {
            key: 'pronunciation',
            label: 'Phát âm',
            render: (item: Record<string, unknown>) => (
                <span className="italic" style={{ color: 'var(--color-text-secondary)' }}>
                    {(item.pronunciation as string) || '—'}
                </span>
            ),
        },
        {
            key: 'actions',
            label: 'Thao tác',
            render: (item: Record<string, unknown>) => {
                const v = item as unknown as VocabularyResponse
                return (
                    <div className="flex items-center gap-1">
                        <button
                            onClick={(e) => { e.stopPropagation(); openEdit(v) }}
                            className="p-2 rounded-lg hover:bg-emerald-500/15 text-emerald-400 transition-colors"
                            title="Sửa"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(v.id) }}
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
                        Quản lý từ vựng
                    </h1>
                    <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                        {selectedLesson ? `${vocabulary.length} từ vựng` : 'Chọn bài học để xem từ vựng'}
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    disabled={!selectedLesson}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                    <Plus className="w-4 h-4" />
                    Thêm từ vựng
                </button>
            </div>

            {/* Lesson selector */}
            <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                <select
                    value={selectedLesson}
                    onChange={(e) => handleLessonChange(e.target.value)}
                    disabled={lessonsLoading}
                    className="px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/40 min-w-[250px]"
                    style={{
                        backgroundColor: 'var(--color-bg-secondary)',
                        borderColor: 'var(--color-bg-secondary)',
                        color: 'var(--color-text)',
                    }}
                >
                    <option value="">-- Chọn bài học --</option>
                    {lessons.map((l) => (
                        <option key={l.id} value={l.id}>
                            {l.title}
                        </option>
                    ))}
                </select>
                {lessonsLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
            </div>

            {/* Content */}
            {!selectedLesson ? (
                <EmptyState
                    icon={<Inbox className="w-8 h-8" />}
                    title="Chọn bài học"
                    description="Vui lòng chọn một bài học từ dropdown để quản lý từ vựng."
                />
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <AlertTriangle className="w-10 h-10 text-red-400" />
                    <p style={{ color: 'var(--color-text-secondary)' }}>{error}</p>
                    <button
                        onClick={() => fetchVocabulary(selectedLesson)}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            ) : (
                <DataTable
                    columns={columns}
                    data={vocabulary as unknown as Record<string, unknown>[]}
                    loading={loading}
                    emptyMessage="Bài học này chưa có từ vựng nào"
                />
            )}

            {/* Create / Edit Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                title={editingId ? 'Chỉnh sửa từ vựng' : 'Thêm từ vựng mới'}
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
                            disabled={saving || !form.word.trim() || !form.meaning.trim()}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                            {editingId ? 'Cập nhật' : 'Thêm mới'}
                        </button>
                    </>
                }
            >
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
                    {/* Lesson */}
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                            Bài học
                        </label>
                        <select
                            value={form.lessonId}
                            onChange={(e) => setForm({ ...form, lessonId: e.target.value ? parseInt(e.target.value) : '' })}
                            className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
                            style={{
                                backgroundColor: 'var(--color-bg-secondary)',
                                borderColor: 'var(--color-bg-secondary)',
                                color: 'var(--color-text)',
                            }}
                        >
                            <option value="">-- Chọn bài học --</option>
                            {lessons.map((l) => (
                                <option key={l.id} value={l.id}>
                                    {l.title}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* Word + Meaning */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                                Từ vựng <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.word}
                                onChange={(e) => setForm({ ...form, word: e.target.value })}
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
                                Nghĩa <span className="text-red-400">*</span>
                            </label>
                            <input
                                type="text"
                                value={form.meaning}
                                onChange={(e) => setForm({ ...form, meaning: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
                                style={{
                                    backgroundColor: 'var(--color-bg-secondary)',
                                    borderColor: 'var(--color-bg-secondary)',
                                    color: 'var(--color-text)',
                                }}
                            />
                        </div>
                    </div>
                    {/* Pronunciation */}
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                            Phát âm
                        </label>
                        <input
                            type="text"
                            value={form.pronunciation}
                            onChange={(e) => setForm({ ...form, pronunciation: e.target.value })}
                            placeholder="/prəˌnʌnsiˈeɪʃn/"
                            className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
                            style={{
                                backgroundColor: 'var(--color-bg-secondary)',
                                borderColor: 'var(--color-bg-secondary)',
                                color: 'var(--color-text)',
                            }}
                        />
                    </div>
                    {/* Example */}
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                            Câu ví dụ
                        </label>
                        <textarea
                            rows={2}
                            value={form.exampleSentence}
                            onChange={(e) => setForm({ ...form, exampleSentence: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/40 resize-y"
                            style={{
                                backgroundColor: 'var(--color-bg-secondary)',
                                borderColor: 'var(--color-bg-secondary)',
                                color: 'var(--color-text)',
                            }}
                        />
                    </div>
                    {/* URLs */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                                URL hình ảnh
                            </label>
                            <input
                                type="url"
                                value={form.imageUrl}
                                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
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
                                URL âm thanh
                            </label>
                            <input
                                type="url"
                                value={form.audioUrl}
                                onChange={(e) => setForm({ ...form, audioUrl: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
                                style={{
                                    backgroundColor: 'var(--color-bg-secondary)',
                                    borderColor: 'var(--color-bg-secondary)',
                                    color: 'var(--color-text)',
                                }}
                            />
                        </div>
                    </div>
                </div>
            </Dialog>
        </div>
    )
}
