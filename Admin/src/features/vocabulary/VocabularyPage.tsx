import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Languages, Plus, Search, Edit, Trash2 } from 'lucide-react'
import api from '@/lib/api'
import type { ApiResponse, Vocabulary, VocabularyRequest } from '@/types/api'

export default function VocabularyPage() {
    const [vocabs, setVocabs] = useState<Vocabulary[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editing, setEditing] = useState<Vocabulary | null>(null)
    const [form, setForm] = useState<VocabularyRequest>({ word: '', meaning: '' })
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleting, setDeleting] = useState<Vocabulary | null>(null)

    const fetch = async () => {
        setLoading(true)
        try {
            const r = await api.get<ApiResponse<Vocabulary[]>>('/vocabulary')
            setVocabs(Array.isArray(r.data.data) ? r.data.data : [])
        } catch {
            setVocabs([
                { id: 1, word: 'apple', meaning: 'quả táo', pronunciation: '/ˈæp.əl/', example: 'I eat an apple every day.' },
                { id: 2, word: 'beautiful', meaning: 'đẹp', pronunciation: '/ˈbjuː.tɪ.fəl/', example: 'She is beautiful.' },
                { id: 3, word: 'computer', meaning: 'máy tính', pronunciation: '/kəmˈpjuː.tər/', example: 'I use a computer for work.' },
            ])
        } finally { setLoading(false) }
    }

    useEffect(() => { fetch() }, [])

    const handleSubmit = async () => {
        try {
            if (editing) await api.put(`/vocabulary/${editing.id}`, form)
            else await api.post('/vocabulary', form)
            fetch()
        } catch { /* ignore */ }
        resetForm()
    }

    const handleDelete = async () => {
        if (!deleting) return
        try { await api.delete(`/vocabulary/${deleting.id}`) } catch { /* ignore */ }
        setDeleteOpen(false)
        fetch()
    }

    const resetForm = () => { setDialogOpen(false); setEditing(null); setForm({ word: '', meaning: '' }) }

    const openEdit = (v: Vocabulary) => {
        setEditing(v)
        setForm({ word: v.word, meaning: v.meaning, pronunciation: v.pronunciation, example: v.example })
        setDialogOpen(true)
    }

    const filtered = vocabs.filter((v) => v.word.toLowerCase().includes(search.toLowerCase()) || v.meaning.toLowerCase().includes(search.toLowerCase()))

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý từ vựng</h1>
                    <p className="text-muted-foreground mt-1">Tổng cộng {vocabs.length} từ vựng</p>
                </div>
                <Button onClick={() => { resetForm(); setDialogOpen(true) }} className="gap-2"><Plus className="h-4 w-4" /> Thêm từ vựng</Button>
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
                                    <TableHead>Ví dụ</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((v) => (
                                    <TableRow key={v.id}>
                                        <TableCell className="font-medium">{v.id}</TableCell>
                                        <TableCell className="font-semibold text-primary">{v.word}</TableCell>
                                        <TableCell>{v.meaning}</TableCell>
                                        <TableCell className="text-muted-foreground italic">{v.pronunciation}</TableCell>
                                        <TableCell className="max-w-[200px] truncate text-muted-foreground">{v.example}</TableCell>
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

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Chỉnh sửa từ vựng' : 'Thêm từ vựng mới'}</DialogTitle>
                        <DialogDescription>Điền thông tin từ vựng</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><Label>Từ *</Label><Input value={form.word} onChange={(e) => setForm({ ...form, word: e.target.value })} placeholder="apple" /></div>
                            <div className="space-y-2"><Label>Nghĩa *</Label><Input value={form.meaning} onChange={(e) => setForm({ ...form, meaning: e.target.value })} placeholder="quả táo" /></div>
                        </div>
                        <div className="space-y-2"><Label>Phát âm</Label><Input value={form.pronunciation || ''} onChange={(e) => setForm({ ...form, pronunciation: e.target.value })} placeholder="/ˈæp.əl/" /></div>
                        <div className="space-y-2"><Label>Ví dụ</Label><Input value={form.example || ''} onChange={(e) => setForm({ ...form, example: e.target.value })} placeholder="Câu ví dụ" /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={resetForm}>Hủy</Button>
                        <Button onClick={handleSubmit}>{editing ? 'Cập nhật' : 'Tạo mới'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
