import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { BookOpen, Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import type { ApiResponse, Page, Lesson, LessonRequest } from '@/types/api'

export default function LessonsPage() {
    const [lessons, setLessons] = useState<Lesson[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
    const [form, setForm] = useState<LessonRequest>({ title: '', contentHtml: '', difficultyLevel: 1, orderIndex: 1, isPublished: false })
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null)
    const [submitting, setSubmitting] = useState(false)

    const fetchLessons = async () => {
        setLoading(true)
        try {
            const response = await api.get<ApiResponse<Page<Lesson>>>(`/lessons?page=${page}&size=10`)
            setLessons(response.data.data.content)
            setTotalPages(response.data.data.totalPages)
            setTotalElements(response.data.data.totalElements)
        } catch {
            setLessons([])
            toast.error('Không thể tải danh sách bài học')
        } finally { setLoading(false) }
    }

    useEffect(() => { fetchLessons() }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleSubmit = async () => {
        if (!form.title.trim()) { toast.error('Tiêu đề không được để trống'); return }
        setSubmitting(true)
        try {
            if (editingLesson) {
                await api.put(`/lessons/${editingLesson.id}`, form)
                toast.success('Cập nhật bài học thành công')
            } else {
                await api.post('/lessons', form)
                toast.success('Tạo bài học thành công')
            }
            fetchLessons()
            resetForm()
        } catch {
            toast.error('Thao tác thất bại')
        } finally { setSubmitting(false) }
    }

    const handleDelete = async () => {
        if (!deletingLesson) return
        try {
            await api.delete(`/lessons/${deletingLesson.id}`)
            toast.success('Đã xóa bài học')
            fetchLessons()
        } catch {
            toast.error('Xóa thất bại')
        }
        setDeleteDialogOpen(false)
        setDeletingLesson(null)
    }

    const resetForm = () => {
        setDialogOpen(false)
        setEditingLesson(null)
        setForm({ title: '', contentHtml: '', difficultyLevel: 1, orderIndex: 1, isPublished: false })
    }

    const openEdit = (lesson: Lesson) => {
        setEditingLesson(lesson)
        setForm({
            title: lesson.title,
            contentHtml: lesson.contentHtml,
            audioUrl: lesson.audioUrl,
            videoUrl: lesson.videoUrl,
            difficultyLevel: lesson.difficultyLevel,
            orderIndex: lesson.orderIndex,
            isPublished: lesson.isPublished,
        })
        setDialogOpen(true)
    }

    const filtered = lessons.filter((l) => l.title.toLowerCase().includes(search.toLowerCase()))

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý bài học</h1>
                    <p className="text-muted-foreground mt-1">Tổng cộng {totalElements} bài học</p>
                </div>
                <Button onClick={() => { resetForm(); setDialogOpen(true) }} className="gap-2">
                    <Plus className="h-4 w-4" /> Thêm bài học
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Danh sách bài học</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">ID</TableHead>
                                        <TableHead>Tiêu đề</TableHead>
                                        <TableHead>Độ khó</TableHead>
                                        <TableHead>Thứ tự</TableHead>
                                        <TableHead>Từ vựng</TableHead>
                                        <TableHead>Câu hỏi</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.length === 0 ? (
                                        <TableRow><TableCell colSpan={8} className="text-center text-muted-foreground py-8">Không có bài học nào</TableCell></TableRow>
                                    ) : filtered.map((lesson) => (
                                        <TableRow key={lesson.id}>
                                            <TableCell className="font-medium">{lesson.id}</TableCell>
                                            <TableCell className="font-medium max-w-[250px] truncate">{lesson.title}</TableCell>
                                            <TableCell><Badge variant="outline">Lv.{lesson.difficultyLevel ?? 1}</Badge></TableCell>
                                            <TableCell>{lesson.orderIndex ?? '-'}</TableCell>
                                            <TableCell>{lesson.vocabularyCount ?? 0}</TableCell>
                                            <TableCell>{lesson.questionCount ?? 0}</TableCell>
                                            <TableCell>
                                                <Badge variant={lesson.isPublished ? 'default' : 'secondary'}>
                                                    {lesson.isPublished ? 'Đã xuất bản' : 'Nháp'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(lesson)}><Edit className="h-4 w-4" /></Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setDeletingLesson(lesson); setDeleteDialogOpen(true) }}><Trash2 className="h-4 w-4" /></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-sm text-muted-foreground">Trang {page + 1} / {Math.max(totalPages, 1)}</p>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}><ChevronLeft className="h-4 w-4" /></Button>
                                    <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page >= totalPages - 1}><ChevronRight className="h-4 w-4" /></Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingLesson ? 'Chỉnh sửa bài học' : 'Thêm bài học mới'}</DialogTitle>
                        <DialogDescription>Điền thông tin bài học</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Tiêu đề *</Label>
                            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Tiêu đề bài học" />
                        </div>
                        <div className="space-y-2">
                            <Label>Nội dung HTML</Label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                value={form.contentHtml || ''}
                                onChange={(e) => setForm({ ...form, contentHtml: e.target.value })}
                                placeholder="<p>Nội dung bài học...</p>"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Độ khó (1-5)</Label>
                                <Input type="number" min={1} max={5} value={form.difficultyLevel || 1} onChange={(e) => setForm({ ...form, difficultyLevel: Number(e.target.value) })} />
                            </div>
                            <div className="space-y-2">
                                <Label>Thứ tự</Label>
                                <Input type="number" value={form.orderIndex || 1} onChange={(e) => setForm({ ...form, orderIndex: Number(e.target.value) })} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isPublished"
                                checked={form.isPublished || false}
                                onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor="isPublished">Xuất bản ngay</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={resetForm}>Hủy</Button>
                        <Button onClick={handleSubmit} disabled={submitting}>
                            {submitting ? 'Đang xử lý...' : editingLesson ? 'Cập nhật' : 'Tạo mới'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa</DialogTitle>
                        <DialogDescription>Bạn có chắc muốn xóa bài học "{deletingLesson?.title}"?</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
                        <Button variant="destructive" onClick={handleDelete}>Xóa</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
