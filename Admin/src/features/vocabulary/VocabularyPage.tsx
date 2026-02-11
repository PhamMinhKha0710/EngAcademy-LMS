import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Languages, Plus, Search, Edit, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import type { ApiResponse, Vocabulary, VocabularyRequest, Lesson } from '@/types/api'

export default function VocabularyPage() {
    const [vocabs, setVocabs] = useState<Vocabulary[]>([])
    const [lessons, setLessons] = useState<Lesson[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editing, setEditing] = useState<Vocabulary | null>(null)
    const [form, setForm] = useState<VocabularyRequest>({ word: '', meaning: '', lessonId: undefined })
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleting, setDeleting] = useState<Vocabulary | null>(null)
    const [submitting, setSubmitting] = useState(false)

    const fetchVocabs = async () => {
        setLoading(true)
        try {
            const r = await api.get<ApiResponse<Vocabulary[]>>('/vocabulary')
            setVocabs(Array.isArray(r.data.data) ? r.data.data : [])
        } catch {
            setVocabs([])
            toast.error('Không thể tải từ vựng')
        } finally { setLoading(false) }
    }

    const fetchLessons = async () => {
        try {
            const r = await api.get<ApiResponse<{ content: Lesson[] }>>('/lessons?page=0&size=200')
            setLessons(r.data.data.content || [])
        } catch { /* ignore */ }
    }

    useEffect(() => {
        fetchVocabs()
        fetchLessons()
    }, [])

    const handleSubmit = async () => {
        if (!form.word.trim() || !form.meaning.trim()) { toast.error('Từ và nghĩa không được để trống'); return }
        setSubmitting(true)
        try {
            if (editing) {
                await api.put(`/vocabulary/${editing.id}`, form)
                toast.success('Cập nhật từ vựng thành công')
            } else {
                await api.post('/vocabulary', form)
                toast.success('Thêm từ vựng thành công')
            }
            fetchVocabs()
            resetForm()
        } catch {
            toast.error('Thao tác thất bại')
        } finally { setSubmitting(false) }
    }

    const handleDelete = async () => {
        if (!deleting) return
        try {
            await api.delete(`/vocabulary/${deleting.id}`)
            toast.success('Đã xóa từ vựng')
            fetchVocabs()
        } catch {
            toast.error('Xóa thất bại')
        }
        setDeleteOpen(false)
        setDeleting(null)
    }

    const resetForm = () => {
        setDialogOpen(false)
        setEditing(null)
        setForm({ word: '', meaning: '', lessonId: undefined })
    }

    const openEdit = (v: Vocabulary) => {
        setEditing(v)
        setForm({
            word: v.word,
            meaning: v.meaning,
            pronunciation: v.pronunciation,
            exampleSentence: v.exampleSentence,
            imageUrl: v.imageUrl,
            audioUrl: v.audioUrl,
            lessonId: v.lessonId,
        })
        setDialogOpen(true)
    }

    const filtered = vocabs.filter((v) =>
        v.word.toLowerCase().includes(search.toLowerCase()) ||
        v.meaning.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý từ vựng</h1>
                    <p className="text-muted-foreground mt-1">Tổng cộng {vocabs.length} từ vựng</p>
                </div>
                <Button onClick={() => { resetForm(); setDialogOpen(true) }} className="gap-2">
                    <Plus className="h-4 w-4" /> Thêm từ vựng
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2"><Languages className="h-5 w-5 text-primary" /> Danh sách</CardTitle>
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
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">ID</TableHead>
                                    <TableHead>Từ</TableHead>
                                    <TableHead>Nghĩa</TableHead>
                                    <TableHead>Phát âm</TableHead>
                                    <TableHead>Bài học</TableHead>
                                    <TableHead>Ví dụ</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.length === 0 ? (
                                    <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-8">Không có từ vựng</TableCell></TableRow>
                                ) : filtered.map((v) => (
                                    <TableRow key={v.id}>
                                        <TableCell className="font-medium">{v.id}</TableCell>
                                        <TableCell className="font-semibold text-primary">{v.word}</TableCell>
                                        <TableCell>{v.meaning}</TableCell>
                                        <TableCell className="text-muted-foreground italic">{v.pronunciation}</TableCell>
                                        <TableCell className="text-muted-foreground">{v.lessonTitle || '-'}</TableCell>
                                        <TableCell className="max-w-[200px] truncate text-muted-foreground">{v.exampleSentence}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(v)}><Edit className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setDeleting(v); setDeleteOpen(true) }}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Chỉnh sửa từ vựng' : 'Thêm từ vựng mới'}</DialogTitle>
                        <DialogDescription>Điền thông tin từ vựng</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Từ *</Label>
                                <Input value={form.word} onChange={(e) => setForm({ ...form, word: e.target.value })} placeholder="apple" />
                            </div>
                            <div className="space-y-2">
                                <Label>Nghĩa *</Label>
                                <Input value={form.meaning} onChange={(e) => setForm({ ...form, meaning: e.target.value })} placeholder="quả táo" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Phát âm</Label>
                            <Input value={form.pronunciation || ''} onChange={(e) => setForm({ ...form, pronunciation: e.target.value })} placeholder="/ˈæp.əl/" />
                        </div>
                        <div className="space-y-2">
                            <Label>Bài học</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                value={form.lessonId || ''}
                                onChange={(e) => setForm({ ...form, lessonId: e.target.value ? Number(e.target.value) : undefined })}
                            >
                                <option value="">-- Chọn bài học --</option>
                                {lessons.map((l) => (
                                    <option key={l.id} value={l.id}>{l.title}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Câu ví dụ</Label>
                            <Input value={form.exampleSentence || ''} onChange={(e) => setForm({ ...form, exampleSentence: e.target.value })} placeholder="I eat an apple every day." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>URL ảnh</Label>
                                <Input value={form.imageUrl || ''} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
                            </div>
                            <div className="space-y-2">
                                <Label>URL audio</Label>
                                <Input value={form.audioUrl || ''} onChange={(e) => setForm({ ...form, audioUrl: e.target.value })} placeholder="https://..." />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={resetForm}>Hủy</Button>
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
                        <DialogDescription>Xóa từ "{deleting?.word}"?</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteOpen(false)}>Hủy</Button>
                        <Button variant="destructive" onClick={handleDelete}>Xóa</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
