import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { BookOpen, Plus, Search, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '@/lib/api'
import type { ApiResponse, Page, Lesson, LessonRequest } from '@/types/api'

export default function LessonsPage() {
    const [lessons, setLessons] = useState<Lesson[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingLesson, setEditingLesson] = useState<Lesson | null>(null)
    const [form, setForm] = useState<LessonRequest>({ title: '', description: '', content: '', level: '', published: false })
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deletingLesson, setDeletingLesson] = useState<Lesson | null>(null)

    const fetchLessons = async () => {
        setLoading(true)
        try {
            const response = await api.get<ApiResponse<Page<Lesson>>>(`/lessons?page=${page}&size=10`)
            setLessons(response.data.data.content)
            setTotalPages(response.data.data.totalPages)
        } catch {
            setLessons([
                { id: 1, title: 'Present Simple Tense', description: 'Thì hiện tại đơn', level: 'Beginner', published: true, orderIndex: 1 },
                { id: 2, title: 'Past Simple Tense', description: 'Thì quá khứ đơn', level: 'Beginner', published: true, orderIndex: 2 },
                { id: 3, title: 'Future Simple', description: 'Thì tương lai đơn', level: 'Intermediate', published: false, orderIndex: 3 },
            ])
            setTotalPages(1)
        } finally { setLoading(false) }
    }

    useEffect(() => { fetchLessons() }, [page])

    const handleSubmit = async () => {
        try {
            if (editingLesson) await api.put(`/lessons/${editingLesson.id}`, form)
            else await api.post('/lessons', form)
            fetchLessons()
        } catch { /* ignore */ }
        resetForm()
    }

    const handleDelete = async () => {
        if (!deletingLesson) return
        try { await api.delete(`/lessons/${deletingLesson.id}`) } catch { /* ignore */ }
        setDeleteDialogOpen(false)
        fetchLessons()
    }

    const resetForm = () => { setDialogOpen(false); setEditingLesson(null); setForm({ title: '', description: '', content: '', level: '', published: false }) }

    const openEdit = (lesson: Lesson) => {
        setEditingLesson(lesson)
        setForm({ title: lesson.title, description: lesson.description, content: lesson.content, level: lesson.level, published: lesson.published, orderIndex: lesson.orderIndex })
        setDialogOpen(true)
    }

    const filtered = lessons.filter((l) => l.title.toLowerCase().includes(search.toLowerCase()))

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý bài học</h1>
                    <p className="text-muted-foreground mt-1">Quản lý nội dung bài học</p>
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
                                        <TableHead>Mô tả</TableHead>
                                        <TableHead>Cấp độ</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.map((lesson) => (
                                        <TableRow key={lesson.id}>
                                            <TableCell className="font-medium">{lesson.id}</TableCell>
                                            <TableCell className="font-medium">{lesson.title}</TableCell>
                                            <TableCell className="text-muted-foreground max-w-[200px] truncate">{lesson.description}</TableCell>
                                            <TableCell><Badge variant="outline">{lesson.level || 'N/A'}</Badge></TableCell>
                                            <TableCell>
                                                <Badge variant={lesson.published ? 'default' : 'secondary'}>{lesson.published ? 'Đã xuất bản' : 'Nháp'}</Badge>
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

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
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
                            <Label>Mô tả</Label>
                            <Input value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mô tả" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Cấp độ</Label>
                                <Input value={form.level || ''} onChange={(e) => setForm({ ...form, level: e.target.value })} placeholder="Beginner/Intermediate/Advanced" />
                            </div>
                            <div className="space-y-2">
                                <Label>Thứ tự</Label>
                                <Input type="number" value={form.orderIndex || ''} onChange={(e) => setForm({ ...form, orderIndex: Number(e.target.value) })} placeholder="1, 2, 3..." />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={resetForm}>Hủy</Button>
                        <Button onClick={handleSubmit}>{editingLesson ? 'Cập nhật' : 'Tạo mới'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
