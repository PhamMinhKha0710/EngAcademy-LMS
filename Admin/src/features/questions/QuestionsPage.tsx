import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { HelpCircle, Plus, Search, Edit, Trash2, X } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'sonner'
import type { ApiResponse, Question, QuestionRequest, Lesson, Page } from '@/types/api'

const QUESTION_TYPE_LABELS: Record<string, string> = {
    MULTIPLE_CHOICE: 'Trắc nghiệm',
    TRUE_FALSE: 'Đúng/Sai',
    FILL_IN_BLANK: 'Điền từ',
}

const QUESTION_TYPES = [
    { value: 'MULTIPLE_CHOICE', label: 'Trắc nghiệm' },
    { value: 'TRUE_FALSE', label: 'Đúng/Sai' },
    { value: 'FILL_IN_BLANK', label: 'Điền từ' },
]

const emptyForm: QuestionRequest = {
    questionType: 'MULTIPLE_CHOICE',
    questionText: '',
    points: 1,
    explanation: '',
    options: [
        { optionText: '', isCorrect: false },
        { optionText: '', isCorrect: false },
    ],
}

export default function QuestionsPage() {
    const [questions, setQuestions] = useState<Question[]>([])
    const [lessons, setLessons] = useState<Lesson[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    const [dialogOpen, setDialogOpen] = useState(false)
    const [editing, setEditing] = useState<Question | null>(null)
    const [form, setForm] = useState<QuestionRequest>({ ...emptyForm })
    const [submitting, setSubmitting] = useState(false)

    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleting, setDeleting] = useState<Question | null>(null)

    const fetchQuestions = async () => {
        setLoading(true)
        try {
            const response = await api.get<ApiResponse<Question[]>>('/questions')
            setQuestions(Array.isArray(response.data.data) ? response.data.data : [])
        } catch {
            toast.error('Không thể tải danh sách câu hỏi')
            setQuestions([])
        } finally {
            setLoading(false)
        }
    }

    const fetchLessons = async () => {
        try {
            const response = await api.get<ApiResponse<Page<Lesson> | Lesson[]>>('/lessons?page=0&size=100')
            const data = response.data.data
            if (Array.isArray(data)) {
                setLessons(data)
            } else if (data && 'content' in data) {
                setLessons(data.content)
            } else {
                setLessons([])
            }
        } catch {
            setLessons([])
        }
    }

    useEffect(() => {
        fetchQuestions()
        fetchLessons()
    }, [])

    const resetForm = () => {
        setDialogOpen(false)
        setEditing(null)
        setForm({ ...emptyForm, options: [{ optionText: '', isCorrect: false }, { optionText: '', isCorrect: false }] })
    }

    const openCreate = () => {
        resetForm()
        setDialogOpen(true)
    }

    const openEdit = (q: Question) => {
        setEditing(q)
        setForm({
            lessonId: q.lessonId,
            questionType: q.questionType,
            questionText: q.questionText,
            points: q.points ?? 1,
            explanation: q.explanation ?? '',
            options: q.options.map((o) => ({ optionText: o.optionText, isCorrect: o.isCorrect })),
        })
        setDialogOpen(true)
    }

    const handleSubmit = async () => {
        if (!form.questionText.trim()) {
            toast.error('Vui lòng nhập nội dung câu hỏi')
            return
        }
        if (form.options.length === 0) {
            toast.error('Vui lòng thêm ít nhất 1 đáp án')
            return
        }
        if (form.options.some((o) => !o.optionText.trim())) {
            toast.error('Vui lòng nhập nội dung cho tất cả đáp án')
            return
        }
        if (!form.options.some((o) => o.isCorrect)) {
            toast.error('Vui lòng chọn ít nhất 1 đáp án đúng')
            return
        }

        setSubmitting(true)
        try {
            if (editing) {
                await api.put(`/questions/${editing.id}`, form)
                toast.success('Cập nhật câu hỏi thành công')
            } else {
                await api.post('/questions', form)
                toast.success('Tạo câu hỏi thành công')
            }
            resetForm()
            fetchQuestions()
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || (editing ? 'Cập nhật câu hỏi thất bại' : 'Tạo câu hỏi thất bại')
            toast.error(errorMsg)
            console.error('Question submit error:', error.response?.data)
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!deleting) return
        try {
            await api.delete(`/questions/${deleting.id}`)
            toast.success('Xóa câu hỏi thành công')
            fetchQuestions()
        } catch {
            toast.error('Xóa câu hỏi thất bại')
        }
        setDeleteOpen(false)
        setDeleting(null)
    }

    const addOption = () => {
        setForm({ ...form, options: [...form.options, { optionText: '', isCorrect: false }] })
    }

    const removeOption = (index: number) => {
        setForm({ ...form, options: form.options.filter((_, i) => i !== index) })
    }

    const updateOption = (index: number, field: 'optionText' | 'isCorrect', value: string | boolean) => {
        const newOptions = [...form.options]
        newOptions[index] = { ...newOptions[index], [field]: value }
        setForm({ ...form, options: newOptions })
    }

    const getTypeBadge = (type: string) => {
        const config: Record<string, 'default' | 'secondary' | 'outline'> = {
            MULTIPLE_CHOICE: 'default',
            TRUE_FALSE: 'secondary',
            FILL_IN_BLANK: 'outline',
        }
        return <Badge variant={config[type] || 'outline'}>{QUESTION_TYPE_LABELS[type] || type}</Badge>
    }

    const filtered = questions.filter((q) =>
        q.questionText.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý câu hỏi</h1>
                    <p className="text-muted-foreground mt-1">Tổng cộng {questions.length} câu hỏi</p>
                </div>
                <Button onClick={openCreate} className="gap-2">
                    <Plus className="h-4 w-4" /> Thêm câu hỏi
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <HelpCircle className="h-5 w-5 text-primary" /> Danh sách câu hỏi
                        </CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm câu hỏi..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                            <HelpCircle className="h-10 w-10 mb-2" />
                            <p>Không tìm thấy câu hỏi nào</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">ID</TableHead>
                                    <TableHead>Câu hỏi</TableHead>
                                    <TableHead>Loại</TableHead>
                                    <TableHead>Điểm</TableHead>
                                    <TableHead>Bài học</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((q) => (
                                    <TableRow key={q.id}>
                                        <TableCell className="font-medium">{q.id}</TableCell>
                                        <TableCell className="max-w-[350px]">
                                            <span className="line-clamp-1">
                                                {q.questionText.length > 80
                                                    ? q.questionText.substring(0, 80) + '...'
                                                    : q.questionText}
                                            </span>
                                        </TableCell>
                                        <TableCell>{getTypeBadge(q.questionType)}</TableCell>
                                        <TableCell>{q.points ?? '-'}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {q.lessonTitle || (q.lessonId ? `#${q.lessonId}` : '-')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => openEdit(q)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive"
                                                    onClick={() => {
                                                        setDeleting(q)
                                                        setDeleteOpen(true)
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Create / Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm() }}>
                <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới'}</DialogTitle>
                        <DialogDescription>
                            {editing ? 'Cập nhật thông tin câu hỏi' : 'Điền đầy đủ thông tin câu hỏi'}
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="flex-1 pr-4 -mr-4">
                        <div className="space-y-4 py-4 pr-4">
                            {/* Lesson Select */}
                            <div className="space-y-2">
                                <Label>Bài học</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={form.lessonId ?? ''}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            lessonId: e.target.value ? Number(e.target.value) : undefined,
                                        })
                                    }
                                >
                                    <option value="">-- Chọn bài học --</option>
                                    {lessons.map((l) => (
                                        <option key={l.id} value={l.id}>
                                            {l.title}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Question Type */}
                            <div className="space-y-2">
                                <Label>Loại câu hỏi *</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={form.questionType}
                                    onChange={(e) => setForm({ ...form, questionType: e.target.value })}
                                >
                                    {QUESTION_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>
                                            {t.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Question Text */}
                            <div className="space-y-2">
                                <Label>Nội dung câu hỏi *</Label>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    rows={3}
                                    value={form.questionText}
                                    onChange={(e) => setForm({ ...form, questionText: e.target.value })}
                                    placeholder="Nhập nội dung câu hỏi..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Points */}
                                <div className="space-y-2">
                                    <Label>Điểm *</Label>
                                    <Input
                                        type="number"
                                        min={0}
                                        value={form.points ?? 1}
                                        onChange={(e) =>
                                            setForm({ ...form, points: e.target.value ? Number(e.target.value) : 1 })
                                        }
                                        placeholder="1"
                                    />
                                </div>
                            </div>

                            {/* Explanation */}
                            <div className="space-y-2">
                                <Label>Giải thích</Label>
                                <textarea
                                    className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    rows={2}
                                    value={form.explanation ?? ''}
                                    onChange={(e) => setForm({ ...form, explanation: e.target.value })}
                                    placeholder="Giải thích đáp án (tuỳ chọn)..."
                                />
                            </div>

                            {/* Options */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label>Đáp án ({form.options.length})</Label>
                                    <Button type="button" variant="outline" size="sm" onClick={addOption} className="gap-1">
                                        <Plus className="h-3 w-3" /> Thêm đáp án
                                    </Button>
                                </div>
                                {form.options.map((option, index) => (
                                    <div key={index} className="flex items-center gap-2 rounded-md border p-3">
                                        <input
                                            type="checkbox"
                                            checked={option.isCorrect}
                                            onChange={(e) => updateOption(index, 'isCorrect', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 accent-primary"
                                            title="Đáp án đúng"
                                        />
                                        <Input
                                            value={option.optionText}
                                            onChange={(e) => updateOption(index, 'optionText', e.target.value)}
                                            placeholder={`Đáp án ${index + 1}`}
                                            className="flex-1"
                                        />
                                        {form.options.length > 1 && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-destructive shrink-0"
                                                onClick={() => removeOption(index)}
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                ))}
                                <p className="text-xs text-muted-foreground">
                                    Tick vào checkbox để đánh dấu đáp án đúng
                                </p>
                            </div>
                        </div>
                    </ScrollArea>
                    <DialogFooter>
                        <Button variant="outline" onClick={resetForm} disabled={submitting}>
                            Hủy
                        </Button>
                        <Button onClick={handleSubmit} disabled={submitting}>
                            {submitting ? 'Đang xử lý...' : editing ? 'Cập nhật' : 'Tạo mới'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc muốn xóa câu hỏi #{deleting?.id}? Hành động này không thể hoàn tác.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteOpen(false)}>
                            Hủy
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Xóa
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
