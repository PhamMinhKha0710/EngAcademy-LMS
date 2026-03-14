import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
    Clock,
    Calendar,
    CheckCircle2,
    TrendingUp,
    Target,
    Layers,
    Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
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

const STATUS_CONFIG: Record<string, { label: string; icon: any; className: string }> = {
    DRAFT: { label: 'Bản nháp', icon: FileText, className: 'bg-muted/20 text-muted-foreground border-border/30' },
    PUBLISHED: { label: 'Đang mở', icon: CheckCircle2, className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
    CLOSED: { label: 'Đã đóng', icon: Lock, className: 'bg-destructive/10 text-destructive border-destructive/20' },
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

    const [selectedClassId, setSelectedClassId] = useState<number | null>(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editing, setEditing] = useState<Exam | null>(null)
    const [form, setForm] = useState<ExamRequest>({ ...emptyForm })
    const [submitting, setSubmitting] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleting, setDeleting] = useState<Exam | null>(null)
    const [questionSearch, setQuestionSearch] = useState('')
    const [statsData, setStatsData] = useState<any>(null)

    const fetchDashboardStats = async () => {
        try {
            const response = await api.get<ApiResponse<any>>('/dashboard/stats')
            if (response.data.success) {
                setStatsData(response.data.data)
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error)
        }
    }

    const fetchClasses = async () => {
        try {
            const response = await api.get<ApiResponse<ClassRoom[]>>('/classes')
            const data = response.data.data
            setClasses(Array.isArray(data) ? data : [])
            if (Array.isArray(data) && data.length > 0 && !selectedClassId) {
                setSelectedClassId(data[0].id)
            }
        } catch { setClasses([]) }
    }

    const fetchQuestions = async () => {
        try {
            const response = await api.get<ApiResponse<Question[] | Page<Question>>>('/questions')
            const data = response.data.data
            if (Array.isArray(data)) setQuestions(data)
            else if (data && 'content' in data) setQuestions(data.content)
            else setQuestions([])
        } catch { setQuestions([]) }
    }

    const fetchExams = useCallback(async (classId: number) => {
        setLoading(true)
        try {
            const response = await api.get<ApiResponse<Exam[]>>(`/exams/class/${classId}`)
            setExams(Array.isArray(response.data.data) ? response.data.data : [])
        } catch {
            toast.error('Không thể tải danh sách bài thi')
            setExams([])
        } finally { setLoading(false) }
    }, [])

    useEffect(() => {
        fetchClasses()
        fetchQuestions()
        fetchDashboardStats()
    }, [])

    useEffect(() => {
        if (selectedClassId) fetchExams(selectedClassId)
        else setExams([])
    }, [selectedClassId, fetchExams])

    const resetForm = () => {
        setDialogOpen(false)
        setEditing(null)
        setForm({ ...emptyForm })
        setQuestionSearch('')
    }

    const openCreate = () => {
        resetForm()
        setForm({ ...emptyForm, classId: selectedClassId ?? 0 })
        setDialogOpen(true)
    }

    const openEdit = async (exam: Exam) => {
        setLoading(true)
        try {
            const response = await api.get<ApiResponse<Exam>>(`/exams/${exam.id}`)
            const fullExam = response.data.data
            setEditing(fullExam)
            setForm({
                title: fullExam.title,
                classId: fullExam.classId ?? 0,
                startTime: fullExam.startTime ? fullExam.startTime.slice(0, 16) : '',
                endTime: fullExam.endTime ? fullExam.endTime.slice(0, 16) : '',
                durationMinutes: fullExam.durationMinutes ?? 60,
                shuffleQuestions: fullExam.shuffleQuestions ?? false,
                shuffleAnswers: fullExam.shuffleAnswers ?? false,
                antiCheatEnabled: fullExam.antiCheatEnabled ?? false,
                questionIds: fullExam.questions ? fullExam.questions.map((q: Question) => q.id) : [],
            })
            setDialogOpen(true)
        } catch {
            toast.error('Không thể lấy thông tin chi tiết bài thi')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async () => {
        if (!form.title.trim() || !form.classId || !form.startTime || !form.endTime) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
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
                await api.post(`/exams?teacherId=${user?.id ?? 0}`, body)
                toast.success('Tạo bài thi thành công')
            }
            resetForm()
            if (selectedClassId) fetchExams(selectedClassId)
        } catch { toast.error(editing ? 'Cập nhật thất bại' : 'Tạo mới thất bại') }
        finally { setSubmitting(false) }
    }

    const handleDelete = async () => {
        if (!deleting) return
        try {
            await api.delete(`/exams/${deleting.id}`)
            toast.success('Xóa bài thi thành công')
            if (selectedClassId) fetchExams(selectedClassId)
        } catch { toast.error('Xóa bài thi thất bại') }
        setDeleteOpen(false)
        setDeleting(null)
    }

    const handlePublish = async (exam: Exam) => {
        try {
            await api.post(`/exams/${exam.id}/publish`)
            toast.success('Đã xuất bản bài thi')
            if (selectedClassId) fetchExams(selectedClassId)
        } catch { toast.error('Lỗi khi xuất bản') }
    }

    const handleClose = async (exam: Exam) => {
        try {
            await api.post(`/exams/${exam.id}/close`)
            toast.success('Đã đóng phòng thi')
            if (selectedClassId) fetchExams(selectedClassId)
        } catch { toast.error('Lỗi khi đóng') }
    }

    const toggleQuestion = (qId: number) => {
        const ids = form.questionIds ?? []
        setForm({ ...form, questionIds: ids.includes(qId) ? ids.filter(id => id !== qId) : [...ids, qId] })
    }

    const filtered = exams.filter(e => e.title.toLowerCase().includes(search.toLowerCase()))
    const filteredQuestions = questions.filter(q => q.questionText.toLowerCase().includes(questionSearch.toLowerCase()))

    const stats = [
        { title: 'Tổng số bài thi', value: statsData?.totalExams?.toString() || '0', icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
        { title: 'Lượt tham gia', value: statsData?.totalAttempts?.toLocaleString() || '0', icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-500/10', trend: 'up' },
        { title: 'Điểm trung bình', value: (statsData?.averageScore || 0).toFixed(1), icon: TrendingUp, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    ]

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase">Quản lý bài thi</h1>
                    <p className="text-muted-foreground mt-2 font-medium">Tạo đề thi, thiết lập phòng thi và theo dõi kết quả của học sinh.</p>
                </div>
                <Button onClick={openCreate} disabled={!selectedClassId} className="h-14 px-8 rounded-2xl gap-3 font-black text-lg bg-primary shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">
                    <Plus className="h-6 w-6" /> TẠO BÀI THI MỚI
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.title} className="premium-card border-none shadow-xl dark:shadow-none overflow-hidden text-sm uppercase">
                        <CardContent className="p-7 flex justify-between items-start">
                            <div>
                                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-5", stat.bg)}>
                                    <stat.icon className={cn("h-6 w-6", stat.color)} />
                                </div>
                                <p className="text-[10px] font-black text-muted-foreground tracking-widest leading-loose">{stat.title}</p>
                                <p className="text-4xl font-black mt-2 text-foreground tracking-tighter">{stat.value}</p>
                            </div>
                            {stat.trend === 'up' && (
                                <div className="flex items-center gap-1 text-emerald-500 font-black text-[10px] bg-emerald-500/10 px-2 py-1 rounded-lg">
                                    <TrendingUp className="h-3 w-3" /> +12%
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Selection & Table */}
            <Card className="premium-card border-none shadow-xl dark:shadow-none overflow-hidden">
                <CardHeader className="p-8 pb-4">
                    <div className="flex items-center justify-between flex-wrap gap-6">
                        <div className="flex items-center gap-4 bg-muted/20 p-2 rounded-2xl border border-border/40">
                            <Layers className="h-5 w-5 text-muted-foreground/40 ml-2" />
                            <select
                                className="bg-transparent border-none text-sm font-black focus:ring-0 cursor-pointer min-w-[200px]"
                                value={selectedClassId ?? ''}
                                onChange={(e) => setSelectedClassId(e.target.value ? Number(e.target.value) : null)}
                            >
                                <option value="">-- Chọn lớp học --</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name} {c.schoolName ? `(${c.schoolName})` : ''}</option>)}
                            </select>
                        </div>
                        <div className="relative group shrink-0">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input placeholder="Tìm đề thi..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-11 h-12 w-80 bg-muted/20 border-border/50 rounded-xl font-bold" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8 pt-4">
                    {!selectedClassId ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/20">
                            <Layers className="h-24 w-24 mb-6" />
                            <p className="text-xl font-black italic">Vui lòng chọn lớp học để bắt đầu quản lý</p>
                        </div>
                    ) : loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="h-10 w-10 border-4 border-primary/20 border-t-primary animate-spin rounded-full" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">Truy xuất dữ liệu đề thi...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground/20">
                            <FileText className="h-24 w-24 mb-6" />
                            <p className="text-xl font-black italic">Không tìm thấy bài thi nào</p>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-border/40 overflow-hidden shadow-sm">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30 border-border/50 hover:bg-muted/30">
                                        <TableHead className="h-14 pl-8 font-black uppercase text-[10px] tracking-widest">Đề thi</TableHead>
                                        <TableHead className="font-black uppercase text-[10px] tracking-widest">Trạng thái</TableHead>
                                        <TableHead className="font-black uppercase text-[10px] tracking-widest">Lịch thi</TableHead>
                                        <TableHead className="font-black uppercase text-[10px] tracking-widest text-center">Câu hỏi</TableHead>
                                        <TableHead className="text-right pr-8 font-black uppercase text-[10px] tracking-widest">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.map((exam) => (
                                        <TableRow key={exam.id} className="h-24 border-border/40 hover:bg-muted/5 transition-colors group">
                                            <TableCell className="pl-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-11 w-11 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:bg-primary/10 transition-colors">
                                                        <FileText className="h-5 w-5 text-primary/60" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-foreground group-hover:text-primary transition-colors">{exam.title}</span>
                                                        <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest mt-1">ID: #{exam.id} &middot; {exam.className}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {exam.status && (
                                                    <div className={cn(
                                                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest",
                                                        STATUS_CONFIG[exam.status]?.className
                                                    )}>
                                                        {(() => {
                                                            const Icon = STATUS_CONFIG[exam.status]?.icon || FileText
                                                            return <Icon className="h-3 w-3" />
                                                        })()}
                                                        {STATUS_CONFIG[exam.status]?.label}
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-foreground/70">
                                                        <Calendar className="h-3 w-3 text-muted-foreground/40" /> {exam.startTime ? new Date(exam.startTime).toLocaleDateString('vi-VN') : '—'}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground/30 uppercase">
                                                        <Clock className="h-2.5 w-2.5" /> {exam.startTime ? new Date(exam.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '—'} - {exam.durationMinutes} PHÚT
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center font-black text-lg text-foreground/80">{exam.questionCount}</TableCell>
                                            <TableCell className="text-right pr-8">
                                                <div className="flex justify-end gap-2 opacity-20 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary transition-all" onClick={() => navigate(`/exams/${exam.id}/results`)} title="Kết quả">
                                                        <Eye className="h-5 w-5" />
                                                    </Button>
                                                    {exam.status === 'DRAFT' && (
                                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-emerald-500/10 text-emerald-600 transition-all" onClick={() => handlePublish(exam)} title="Xuất bản">
                                                            <Send className="h-5 w-5" />
                                                        </Button>
                                                    )}
                                                    {exam.status === 'PUBLISHED' && (
                                                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-amber-500/10 text-amber-600 transition-all" onClick={() => handleClose(exam)} title="Đóng">
                                                            <Lock className="h-5 w-5" />
                                                        </Button>
                                                    )}
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/5 text-muted-foreground/40 hover:text-foreground transition-all" onClick={() => openEdit(exam)}>
                                                        <Edit className="h-5 w-5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-destructive/10 text-muted-foreground/40 hover:text-destructive transition-all" onClick={() => { setDeleting(exam); setDeleteOpen(true) }}>
                                                        <Trash2 className="h-5 w-5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialogs scaled & rounded */}
            <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm() }}>
                <DialogContent className="max-w-3xl rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="p-8 bg-muted/20 border-b border-border/40">
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight">{editing ? 'Chỉnh sửa bài thi' : 'Thiết lập bài thi mới'}</DialogTitle>
                        <DialogDescription className="font-medium">Cấu hình thời gian, phòng thi và danh sách câu hỏi.</DialogDescription>
                    </DialogHeader>
                    <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">Tiêu đề bài thi</Label>
                                    <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-12 bg-muted/20 rounded-2xl border-border/50 font-bold" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">Lớp học mục tiêu</Label>
                                    <select 
                                        className="w-full h-12 bg-muted/20 rounded-2xl border border-border/50 px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20"
                                        value={form.classId} onChange={(e) => setForm({ ...form, classId: Number(e.target.value) })}
                                    >
                                        <option value={0}>-- Chọn lớp học --</option>
                                        {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">Ngày bắt đầu</Label>
                                        <Input type="datetime-local" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="h-12 bg-muted/20 rounded-2xl border-border/50 font-bold" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">Ngày kết thúc</Label>
                                        <Input type="datetime-local" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="h-12 bg-muted/20 rounded-2xl border-border/50 font-bold" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest pl-1">Thời lượng (Phút)</Label>
                                    <Input type="number" value={form.durationMinutes} onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })} className="h-12 bg-muted/20 rounded-2xl border-border/50 font-bold" />
                                </div>
                                <div className="flex flex-wrap gap-4 pt-4 border-t border-border/30">
                                    {['shuffleQuestions', 'shuffleAnswers', 'antiCheatEnabled'].map(opt => (
                                        <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                                            <input type="checkbox" checked={(form as any)[opt]} onChange={(e) => setForm({ ...form, [opt]: e.target.checked })} className="h-5 w-5 rounded-lg accent-primary border-border bg-muted/20" />
                                            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                                                {opt === 'shuffleQuestions' ? 'Trộn câu' : opt === 'shuffleAnswers' ? 'Trộn đáp án' : 'Chống gian lận'}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase text-primary tracking-widest bg-primary/5 px-3 py-1.5 rounded-lg border border-primary/10">BỘ CÂU HỎI ({(form.questionIds ?? []).length} đã chọn)</Label>
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                                    <Input placeholder="Tìm câu hỏi..." value={questionSearch} onChange={(e) => setQuestionSearch(e.target.value)} className="pl-11 h-12 bg-muted/20 rounded-2xl border-border/50 font-bold" />
                                </div>
                                <ScrollArea className="h-[350px] rounded-2xl border border-border/50 bg-muted/5 p-4">
                                    <div className="space-y-2">
                                        {filteredQuestions.map(q => (
                                            <label key={q.id} className={cn(
                                                "flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer group",
                                                (form.questionIds ?? []).includes(q.id) ? "bg-primary/5 border-primary/20" : "bg-transparent border-transparent hover:bg-muted/10"
                                            )}>
                                                <input type="checkbox" checked={(form.questionIds ?? []).includes(q.id)} onChange={() => toggleQuestion(q.id)} className="mt-1 h-5 w-5 rounded-lg accent-primary border-border bg-muted/20" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-foreground leading-snug line-clamp-2">{q.questionText}</p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Badge variant="outline" className="text-[8px] font-black uppercase border-border/50">{q.questionType}</Badge>
                                                        <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">ID: #{q.id}</span>
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </ScrollArea>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="p-8 bg-muted/10 border-t border-border/40 gap-3">
                        <Button variant="ghost" onClick={resetForm} disabled={submitting} className="h-12 px-8 rounded-2xl font-black transition-all">HỦY BỎ</Button>
                        <Button onClick={handleSubmit} disabled={submitting} className="h-12 px-10 rounded-2xl font-black bg-primary shadow-xl shadow-primary/20">
                            {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : editing ? 'LƯU THAY ĐỔI' : 'XÁC NHẬN TẠO'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Alert with premium look */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="max-w-md rounded-3xl p-8 gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive mx-auto mb-2">
                        <Trash2 className="h-8 w-8" />
                    </div>
                    <div className="text-center space-y-2">
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight">Xác nhận xóa</DialogTitle>
                        <DialogDescription className="font-medium text-muted-foreground px-4">Đề thi &quot;{deleting?.title}&quot; sẽ bị gỡ bỏ vĩnh viễn khỏi hệ thống.</DialogDescription>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" onClick={() => setDeleteOpen(false)} className="h-12 rounded-2xl font-black bg-muted/20 border-border/50">HỦY</Button>
                        <Button variant="destructive" onClick={handleDelete} className="h-12 rounded-2xl font-black shadow-lg shadow-destructive/20">XÓA BỎ</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
