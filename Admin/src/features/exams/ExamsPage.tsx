import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    FileText,
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    Send,
    Lock,
} from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'sonner'
import { useAppSelector } from '@/app/hooks'
import type {
    ApiResponse,
    Exam,
    ExamRequest,
    ClassRoom,
    Question,
    Page,
} from '@/types/api'

const STATUS_CONFIG: Record<
    string,
    { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
    DRAFT: { label: 'Nháp', variant: 'secondary' },
    PUBLISHED: { label: 'Đang mở', variant: 'default' },
    CLOSED: { label: 'Đã đóng', variant: 'outline' },
}

const emptyForm: ExamRequest = {
    title: '',
    classId: 0,
    startTime: '',
    endTime: '',
    durationMinutes: 60,
    shuffleQuestions: false,
    shuffleAnswers: false,
    antiCheatEnabled: false,
    questionIds: [],
}

export default function ExamsPage() {
    const navigate = useNavigate()
    const { user } = useAppSelector((state) => state.auth)

    const [exams, setExams] = useState<Exam[]>([])
    const [classes, setClasses] = useState<ClassRoom[]>([])
    const [questions, setQuestions] = useState<Question[]>([])
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState('')

    // Class selector for filtering exams
    const [selectedClassId, setSelectedClassId] = useState<number | null>(null)

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editing, setEditing] = useState<Exam | null>(null)
    const [form, setForm] = useState<ExamRequest>({ ...emptyForm })
    const [submitting, setSubmitting] = useState(false)

    // Delete dialog
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleting, setDeleting] = useState<Exam | null>(null)

    // Question search in the multi-select
    const [questionSearch, setQuestionSearch] = useState('')

    const fetchClasses = async () => {
        try {
            const response = await api.get<ApiResponse<ClassRoom[]>>('/classes')
            const data = response.data.data
            setClasses(Array.isArray(data) ? data : [])
        } catch {
            setClasses([])
        }
    }

    const fetchQuestions = async () => {
        try {
            const response = await api.get<ApiResponse<Question[] | Page<Question>>>('/questions')
            const data = response.data.data
            if (Array.isArray(data)) {
                setQuestions(data)
            } else if (data && 'content' in data) {
                setQuestions(data.content)
            } else {
                setQuestions([])
            }
        } catch {
            setQuestions([])
        }
    }

    const fetchExams = useCallback(async (classId?: number | null) => {
        setLoading(true)
        try {
            const url = classId ? `/exams/class/${classId}` : '/exams'
            const response = await api.get<ApiResponse<any>>(url)
            const data = response.data.data
            // Handle both array and paginated response
            if (Array.isArray(data)) {
                setExams(data)
            } else if (data && 'content' in data) {
                setExams(data.content)
            } else {
                setExams([])
            }
        } catch {
            toast.error('Không thể tải danh sách bài thi')
            setExams([])
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchClasses()
        fetchQuestions()
        fetchExams() // Fetch all exams on initial load
    }, [])

    useEffect(() => {
        fetchExams(selectedClassId)
    }, [selectedClassId, fetchExams])

    const resetForm = () => {
        setDialogOpen(false)
        setEditing(null)
        setForm({ ...emptyForm })
        setQuestionSearch('')
    }

    const openCreate = () => {
        resetForm()
        setDialogOpen(true)
    }

    const openEdit = (exam: Exam) => {
        setEditing(exam)
        setForm({
            title: exam.title,
            classId: exam.classId ?? 0,
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

    const handleSubmit = async () => {
        if (!form.title.trim()) {
            toast.error('Vui lòng nhập tiêu đề bài thi')
            return
        }
        if (!form.classId) {
            toast.error('Vui lòng chọn lớp')
            return
        }
        if (!form.startTime || !form.endTime) {
            toast.error('Vui lòng chọn thời gian bắt đầu và kết thúc')
            return
        }

        setSubmitting(true)
        try {
            const body: ExamRequest = {
                ...form,
                startTime: new Date(form.startTime).toISOString(),
                endTime: new Date(form.endTime).toISOString(),
            }

            if (editing) {
                await api.put(`/exams/${editing.id}`, body)
                toast.success('Cập nhật bài thi thành công')
            } else {
                const teacherId = user?.id ?? 0
                await api.post(`/exams?teacherId=${teacherId}`, body)
                toast.success('Tạo bài thi thành công')
            }
            resetForm()
            fetchExams(selectedClassId)
        } catch {
            toast.error(editing ? 'Cập nhật bài thi thất bại' : 'Tạo bài thi thất bại')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!deleting) return
        try {
            await api.delete(`/exams/${deleting.id}`)
            toast.success('Xóa bài thi thành công')
            fetchExams(selectedClassId)
        } catch {
            toast.error('Xóa bài thi thất bại')
        }
        setDeleteOpen(false)
        setDeleting(null)
    }

    const handlePublish = async (exam: Exam) => {
        try {
            await api.post(`/exams/${exam.id}/publish`)
            toast.success(`Đã xuất bản bài thi "${exam.title}"`)
            fetchExams(selectedClassId)
        } catch {
            toast.error('Xuất bản bài thi thất bại')
        }
    }

    const handleClose = async (exam: Exam) => {
        try {
            await api.post(`/exams/${exam.id}/close`)
            toast.success(`Đã đóng bài thi "${exam.title}"`)
            fetchExams(selectedClassId)
        } catch {
            toast.error('Đóng bài thi thất bại')
        }
    }

    const toggleQuestion = (qId: number) => {
        const ids = form.questionIds ?? []
        if (ids.includes(qId)) {
            setForm({ ...form, questionIds: ids.filter((id) => id !== qId) })
        } else {
            setForm({ ...form, questionIds: [...ids, qId] })
        }
    }

    const getStatusBadge = (status: string) => {
        const config = STATUS_CONFIG[status] || { label: status, variant: 'outline' as const }
        return <Badge variant={config.variant}>{config.label}</Badge>
    }

    const formatDateTime = (dt?: string) => {
        if (!dt) return '-'
        try {
            return new Date(dt).toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            })
        } catch {
            return dt
        }
    }

    const filtered = exams.filter((e) =>
        e.title.toLowerCase().includes(search.toLowerCase())
    )

    const filteredQuestions = questions.filter((q) =>
        q.questionText.toLowerCase().includes(questionSearch.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý bài thi</h1>
                    <p className="text-muted-foreground mt-1">
                        {selectedClassId
                            ? `${exams.length} bài thi trong lớp`
                            : `Tổng cộng ${exams.length} bài thi`}
                    </p>
                </div>
                <Button onClick={openCreate} className="gap-2">
                    <Plus className="h-4 w-4" /> Tạo bài thi
                </Button>
            </div>

            {/* Class Selector */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                        <Label className="shrink-0 font-medium">Lọc theo lớp:</Label>
                        <select
                            className="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            value={selectedClassId ?? ''}
                            onChange={(e) =>
                                setSelectedClassId(e.target.value ? Number(e.target.value) : null)
                            }
                        >
                            <option value="">-- Tất cả lớp --</option>
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name} {c.schoolName ? `(${c.schoolName})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Exams Table */}
            {(
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" /> Danh sách bài thi
                            </CardTitle>
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Tìm kiếm..."
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
                                <FileText className="h-10 w-10 mb-2" />
                                <p>Không tìm thấy bài thi nào</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">ID</TableHead>
                                        <TableHead>Tiêu đề</TableHead>
                                        <TableHead>Lớp</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead>Thời gian</TableHead>
                                        <TableHead>Số câu hỏi</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.map((exam) => (
                                        <TableRow key={exam.id}>
                                            <TableCell className="font-medium">{exam.id}</TableCell>
                                            <TableCell className="font-medium max-w-[200px] truncate">
                                                {exam.title}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">
                                                {exam.className || '-'}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(exam.status)}</TableCell>
                                            <TableCell className="text-sm">
                                                <div>{formatDateTime(exam.startTime)}</div>
                                                <div className="text-muted-foreground">
                                                    {exam.durationMinutes ? `${exam.durationMinutes} phút` : ''}
                                                </div>
                                            </TableCell>
                                            <TableCell>{exam.questionCount ?? '-'}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        title="Xem kết quả"
                                                        onClick={() => navigate(`/exams/${exam.id}/results`)}
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    {exam.status === 'DRAFT' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-green-600"
                                                            title="Xuất bản"
                                                            onClick={() => handlePublish(exam)}
                                                        >
                                                            <Send className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    {exam.status === 'PUBLISHED' && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-orange-600"
                                                            title="Đóng bài thi"
                                                            onClick={() => handleClose(exam)}
                                                        >
                                                            <Lock className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        title="Chỉnh sửa"
                                                        onClick={() => openEdit(exam)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive"
                                                        title="Xóa"
                                                        onClick={() => {
                                                            setDeleting(exam)
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
            )}

            {/* Create / Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm() }}>
                <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Chỉnh sửa bài thi' : 'Tạo bài thi mới'}</DialogTitle>
                        <DialogDescription>
                            {editing ? 'Cập nhật thông tin bài thi' : 'Điền đầy đủ thông tin bài thi'}
                        </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="flex-1 pr-4 -mr-4">
                        <div className="space-y-4 py-4 pr-4">
                            {/* Title */}
                            <div className="space-y-2">
                                <Label>Tiêu đề *</Label>
                                <Input
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="Nhập tiêu đề bài thi"
                                />
                            </div>

                            {/* Class */}
                            <div className="space-y-2">
                                <Label>Lớp *</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={form.classId || ''}
                                    onChange={(e) =>
                                        setForm({ ...form, classId: Number(e.target.value) })
                                    }
                                >
                                    <option value="">-- Chọn lớp --</option>
                                    {classes.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name} {c.schoolName ? `(${c.schoolName})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Date/Time */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Bắt đầu *</Label>
                                    <Input
                                        type="datetime-local"
                                        value={form.startTime}
                                        onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Kết thúc *</Label>
                                    <Input
                                        type="datetime-local"
                                        value={form.endTime}
                                        onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Duration */}
                            <div className="space-y-2">
                                <Label>Thời gian làm bài (phút)</Label>
                                <Input
                                    type="number"
                                    min={1}
                                    value={form.durationMinutes}
                                    onChange={(e) =>
                                        setForm({ ...form, durationMinutes: Number(e.target.value) || 60 })
                                    }
                                />
                            </div>

                            {/* Checkboxes */}
                            <div className="grid grid-cols-3 gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.shuffleQuestions ?? false}
                                        onChange={(e) =>
                                            setForm({ ...form, shuffleQuestions: e.target.checked })
                                        }
                                        className="h-4 w-4 rounded border-gray-300 accent-primary"
                                    />
                                    <span className="text-sm">Trộn câu hỏi</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.shuffleAnswers ?? false}
                                        onChange={(e) =>
                                            setForm({ ...form, shuffleAnswers: e.target.checked })
                                        }
                                        className="h-4 w-4 rounded border-gray-300 accent-primary"
                                    />
                                    <span className="text-sm">Trộn đáp án</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.antiCheatEnabled ?? false}
                                        onChange={(e) =>
                                            setForm({ ...form, antiCheatEnabled: e.target.checked })
                                        }
                                        className="h-4 w-4 rounded border-gray-300 accent-primary"
                                    />
                                    <span className="text-sm">Chống gian lận</span>
                                </label>
                            </div>

                            {/* Question Multi-Select */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label>
                                        Câu hỏi ({(form.questionIds ?? []).length} đã chọn)
                                    </Label>
                                </div>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        placeholder="Tìm câu hỏi..."
                                        value={questionSearch}
                                        onChange={(e) => setQuestionSearch(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                <ScrollArea className="h-48 rounded-md border">
                                    <div className="p-2 space-y-1">
                                        {filteredQuestions.length === 0 ? (
                                            <p className="text-sm text-muted-foreground text-center py-4">
                                                Không tìm thấy câu hỏi
                                            </p>
                                        ) : (
                                            filteredQuestions.map((q) => (
                                                <label
                                                    key={q.id}
                                                    className="flex items-start gap-2 rounded-md p-2 hover:bg-accent cursor-pointer"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={(form.questionIds ?? []).includes(q.id)}
                                                        onChange={() => toggleQuestion(q.id)}
                                                        className="h-4 w-4 mt-0.5 rounded border-gray-300 accent-primary shrink-0"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm truncate">{q.questionText}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            #{q.id} &middot; {q.questionType} &middot; {q.points ?? 0} điểm
                                                        </p>
                                                    </div>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                </ScrollArea>
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
                            Bạn có chắc muốn xóa bài thi &quot;{deleting?.title}&quot;? Hành động này không thể hoàn tác.
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
