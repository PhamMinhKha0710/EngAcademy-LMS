import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
// Label removed - not used on this page
import { HelpCircle, Plus, Search, Edit, Trash2 } from 'lucide-react'
import api from '@/lib/api'
import type { ApiResponse, Question } from '@/types/api'

export default function QuestionsPage() {
    const [questions, setQuestions] = useState<Question[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(null)

    const fetchQuestions = async () => {
        setLoading(true)
        try {
            const response = await api.get<ApiResponse<Question[]>>('/questions')
            setQuestions(response.data.data)
        } catch {
            setQuestions([
                { id: 1, content: 'What ____ you doing?', type: 'MULTIPLE_CHOICE', difficulty: 'EASY', options: [{ id: 1, content: 'are', isCorrect: true }, { id: 2, content: 'is', isCorrect: false }] },
                { id: 2, content: 'She ____ to school every day.', type: 'FILL_IN', difficulty: 'MEDIUM', options: [{ id: 3, content: 'goes', isCorrect: true }] },
                { id: 3, content: 'Choose the correct sentence:', type: 'MULTIPLE_CHOICE', difficulty: 'HARD', options: [{ id: 4, content: 'I have been studying', isCorrect: true }] },
            ])
        } finally { setLoading(false) }
    }

    useEffect(() => { fetchQuestions() }, [])

    const handleDelete = async () => {
        if (!deletingQuestion) return
        try { await api.delete(`/questions/${deletingQuestion.id}`) } catch { /* ignore */ }
        setDeleteDialogOpen(false)
        fetchQuestions()
    }

    const getDiffBadge = (d?: string) => {
        const v: Record<string, 'default' | 'secondary' | 'destructive'> = { EASY: 'secondary', MEDIUM: 'default', HARD: 'destructive' }
        return <Badge variant={v[d || ''] || 'secondary'}>{d || 'N/A'}</Badge>
    }

    const filtered = questions.filter((q) => q.content.toLowerCase().includes(search.toLowerCase()))

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý câu hỏi</h1>
                    <p className="text-muted-foreground mt-1">Tổng cộng {questions.length} câu hỏi</p>
                </div>
                <Button className="gap-2"><Plus className="h-4 w-4" /> Thêm câu hỏi</Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2"><HelpCircle className="h-5 w-5 text-primary" /> Danh sách</CardTitle>
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
                                    <TableHead>Nội dung</TableHead>
                                    <TableHead>Loại</TableHead>
                                    <TableHead>Độ khó</TableHead>
                                    <TableHead>Đáp án</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((q) => (
                                    <TableRow key={q.id}>
                                        <TableCell className="font-medium">{q.id}</TableCell>
                                        <TableCell className="max-w-[300px] truncate">{q.content}</TableCell>
                                        <TableCell><Badge variant="outline">{q.type}</Badge></TableCell>
                                        <TableCell>{getDiffBadge(q.difficulty)}</TableCell>
                                        <TableCell>{q.options.length}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setDeletingQuestion(q); setDeleteDialogOpen(true) }}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa</DialogTitle>
                        <DialogDescription>Bạn có chắc muốn xóa câu hỏi này?</DialogDescription>
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
