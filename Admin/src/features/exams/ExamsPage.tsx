import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
// Label removed - not used on this page
import { FileText, Plus, Search, Edit, Trash2, Eye } from 'lucide-react'
import api from '@/lib/api'
import type { ApiResponse, Exam } from '@/types/api'

export default function ExamsPage() {
    const [exams, setExams] = useState<Exam[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deletingExam, setDeletingExam] = useState<Exam | null>(null)

    const fetchExams = async () => {
        setLoading(true)
        try {
            const response = await api.get<ApiResponse<Exam[]>>('/exams')
            setExams(Array.isArray(response.data.data) ? response.data.data : [])
        } catch {
            setExams([
                { id: 1, title: 'Kiểm tra Unit 1 - Grammar', description: 'Kiểm tra ngữ pháp Unit 1', duration: 45, totalQuestions: 30, passingScore: 70, status: 'PUBLISHED', shuffleQuestions: true, shuffleOptions: true, antiCheatEnabled: true },
                { id: 2, title: 'Kiểm tra Unit 2 - Vocabulary', description: 'Kiểm tra từ vựng', duration: 30, totalQuestions: 20, passingScore: 60, status: 'DRAFT', shuffleQuestions: false, shuffleOptions: true, antiCheatEnabled: false },
                { id: 3, title: 'Giữa kỳ - Tổng hợp', description: 'Bài thi giữa kỳ', duration: 60, totalQuestions: 50, passingScore: 65, status: 'CLOSED', shuffleQuestions: true, shuffleOptions: true, antiCheatEnabled: true },
            ])
        } finally { setLoading(false) }
    }

    useEffect(() => { fetchExams() }, [])

    const handleDelete = async () => {
        if (!deletingExam) return
        try { await api.delete(`/exams/${deletingExam.id}`) } catch { /* ignore */ }
        setDeleteDialogOpen(false)
        fetchExams()
    }

    const getStatusBadge = (status: string) => {
        const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
            PUBLISHED: { label: 'Đang mở', variant: 'default' },
            DRAFT: { label: 'Nháp', variant: 'secondary' },
            CLOSED: { label: 'Đã đóng', variant: 'outline' },
        }
        const c = config[status] || { label: status, variant: 'outline' as const }
        return <Badge variant={c.variant}>{c.label}</Badge>
    }

    const filtered = exams.filter((e) => e.title.toLowerCase().includes(search.toLowerCase()))

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý bài thi</h1>
                    <p className="text-muted-foreground mt-1">Tổng cộng {exams.length} bài thi</p>
                </div>
                <Button className="gap-2"><Plus className="h-4 w-4" /> Tạo bài thi</Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Danh sách bài thi</CardTitle>
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
                                    <TableHead>Tên bài thi</TableHead>
                                    <TableHead>Thời gian</TableHead>
                                    <TableHead>Số câu</TableHead>
                                    <TableHead>Điểm đạt</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead>Anti-Cheat</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((exam) => (
                                    <TableRow key={exam.id}>
                                        <TableCell className="font-medium">{exam.id}</TableCell>
                                        <TableCell className="font-medium">{exam.title}</TableCell>
                                        <TableCell>{exam.duration} phút</TableCell>
                                        <TableCell>{exam.totalQuestions}</TableCell>
                                        <TableCell>{exam.passingScore}%</TableCell>
                                        <TableCell>{getStatusBadge(exam.status)}</TableCell>
                                        <TableCell>
                                            <Badge variant={exam.antiCheatEnabled ? 'default' : 'outline'}>{exam.antiCheatEnabled ? 'Bật' : 'Tắt'}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8"><Eye className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setDeletingExam(exam); setDeleteDialogOpen(true) }}><Trash2 className="h-4 w-4" /></Button>
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
                        <DialogDescription>Bạn có chắc muốn xóa bài thi "{deletingExam?.title}"?</DialogDescription>
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
