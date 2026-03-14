import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { HelpCircle, Plus, Search, Edit, Trash2, X, Target, Braces, Layers, CheckCircle2, Loader2, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import api from '@/lib/api'
import { toast } from 'sonner'
import type { ApiResponse, Question, QuestionRequest, Lesson, Page } from '@/types/api'

const QUESTION_TYPE_LABELS: Record<string, string> = {
    MULTIPLE_CHOICE: 'Trắc nghiệm',
    TRUE_FALSE: 'Đúng/Sai',
    FILL_IN_BLANK: 'Điền từ',
}

const QUESTION_TYPES = [
    { value: 'MULTIPLE_CHOICE', label: 'Trắc nghiệm', icon: Layers, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { value: 'TRUE_FALSE', label: 'Đúng/Sai', icon: Target, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { value: 'FILL_IN_BLANK', label: 'Điền từ', icon: Braces, color: 'text-violet-500', bg: 'bg-violet-500/10' },
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

    const fetchQuestions = async () => {
        setLoading(true)
        try {
            const response = await api.get<ApiResponse<Question[]>>('/questions')
            const data = Array.isArray(response.data.data) ? response.data.data : []
            setQuestions([...data].reverse())
        } catch {
            toast.error('Không thể tải danh sách câu hỏi')
            setQuestions([])
        } finally { setLoading(false) }
    }

    const fetchLessons = async () => {
        try {
            const response = await api.get<ApiResponse<Page<Lesson> | Lesson[]>>('/lessons?page=0&size=100')
            const data = response.data.data
            if (Array.isArray(data)) setLessons(data)
            else if (data && 'content' in data) setLessons(data.content)
        } catch { setLessons([]) }
    }

    useEffect(() => {
        fetchQuestions()
        fetchLessons()
        fetchDashboardStats()
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
        if (!form.questionText.trim()) { toast.error('Vui lòng nhập nội dung câu hỏi'); return }
        if (form.options.length === 0) { toast.error('Vui lòng thêm ít nhất 1 đáp án'); return }
        if (form.options.some((o) => !o.optionText.trim())) { toast.error('Vui lòng nhập nội dung cho tất cả đáp án'); return }
        if (!form.options.some((o) => o.isCorrect)) { toast.error('Vui lòng chọn ít nhất 1 đáp án đúng'); return }

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
        } catch { toast.error(editing ? 'Cập nhật thất bại' : 'Tạo mới thất bại') }
        finally { setSubmitting(false) }
    }

    const handleDelete = async () => {
        if (!deleting) return
        try {
            await api.delete(`/questions/${deleting.id}`)
            toast.success('Đã xóa câu hỏi')
            fetchQuestions()
        } catch { toast.error('Xóa thất bại') }
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

    const filtered = questions.filter((q) => q.questionText.toLowerCase().includes(search.toLowerCase()))

    const stats = [
        { title: 'Ngân hàng câu hỏi', value: statsData?.totalQuestions?.toLocaleString() || '0', icon: HelpCircle, color: 'text-primary', bg: 'bg-primary/10' },
        { title: 'Câu hỏi đã tạo', value: questions.length.toString(), icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { title: 'Điểm trung bình hệ thống', value: (statsData?.averageScore || 0).toFixed(1), icon: Target, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    ]

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight uppercase italic underline decoration-primary/30 underline-offset-8">Ngân hàng câu hỏi</h1>
                    <p className="text-muted-foreground mt-4 font-medium max-w-2xl">Quản lý kho câu hỏi trắc nghiệm, đúng sai và điền từ. Các câu hỏi được sử dụng để tạo đề thi và bài tập cho học sinh.</p>
                </div>
                <Button onClick={openCreate} className="h-14 px-8 rounded-2xl gap-3 font-black text-lg bg-primary shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    <Plus className="h-6 w-6" /> THÊM CÂU HỎI MỚI
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.title} className="premium-card border-none shadow-xl dark:shadow-none bg-card hover:translate-y-[-4px] transition-all duration-300">
                        <CardContent className="p-7">
                            <div className="flex items-center justify-between mb-4">
                                <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", stat.bg)}>
                                    <stat.icon className={cn("h-6 w-6", stat.color)} />
                                </div>
                                <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest bg-muted/20 px-2 py-1 rounded-lg">Realtime</span>
                            </div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.title}</p>
                            <p className="text-4xl font-black mt-1 text-foreground tracking-tighter">{stat.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Table Card */}
            <Card className="premium-card border-none shadow-xl dark:shadow-none overflow-hidden">
                <CardHeader className="p-8 pb-4">
                    <div className="flex items-center justify-between flex-wrap gap-6">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Braces className="h-5 w-5 text-primary" />
                            </div>
                            <h2 className="text-xl font-black uppercase tracking-tight">Danh sách câu hỏi</h2>
                        </div>
                        <div className="relative group min-w-[320px]">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
                            <Input placeholder="Tìm câu hỏi..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-11 h-12 bg-muted/20 border-border/50 rounded-xl font-bold" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8 pt-4">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="h-10 w-10 border-4 border-primary/20 border-t-primary animate-spin rounded-full" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">Đang truy xuất ngân hàng câu hỏi...</p>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-border/40 overflow-hidden shadow-sm">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30 hover:bg-muted/30 border-border/50">
                                        <TableHead className="h-14 pl-8 font-black uppercase text-[10px] tracking-widest text-muted-foreground">ID</TableHead>
                                        <TableHead className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Nội dung câu hỏi</TableHead>
                                        <TableHead className="font-black uppercase text-[10px] tracking-widest text-muted-foreground">Lớp học / Bài học</TableHead>
                                        <TableHead className="font-black uppercase text-[10px] tracking-widest text-muted-foreground text-center">Điểm</TableHead>
                                        <TableHead className="text-right pr-8 font-black uppercase text-[10px] tracking-widest text-muted-foreground">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.map((q) => (
                                        <TableRow key={q.id} className="h-24 border-border/40 hover:bg-muted/10 transition-all group">
                                            <TableCell className="pl-8 font-black text-muted-foreground/30 text-sm">#{q.id}</TableCell>
                                            <TableCell className="max-w-[400px]">
                                                <div className="flex flex-col gap-2">
                                                    <span className="font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{q.questionText}</span>
                                                    <div className="flex items-center gap-2">
                                                        {(() => {
                                                            const typeInfo = QUESTION_TYPES.find(t => t.value === q.questionType)
                                                            return (
                                                                <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[9px] font-black uppercase tracking-widest shadow-sm", typeInfo?.bg, typeInfo?.color, "border-current/20")}>
                                                                    {typeInfo && <typeInfo.icon className="h-2.5 w-2.5" />}
                                                                    {QUESTION_TYPE_LABELS[q.questionType]}
                                                                </div>
                                                            )
                                                        })()}
                                                        <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-tighter shrink-0">{q.options.length} ĐÁP ÁN</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-lg bg-muted/30 flex items-center justify-center shrink-0 border border-border/40">
                                                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-sm font-bold text-foreground/80 truncate max-w-[150px]">{q.lessonTitle || 'Unassigned'}</span>
                                                        <span className="text-[9px] font-black text-muted-foreground/20 uppercase">Lession Path</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/5 border border-primary/10 text-primary font-black text-xs shadow-inner">
                                                    {q.points}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-8">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary/10 text-muted-foreground/40 hover:text-primary transition-all" onClick={() => openEdit(q)}>
                                                        <Edit className="h-5 w-5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-destructive/10 text-muted-foreground/40 hover:text-destructive transition-all" onClick={() => { setDeleting(q); setDeleteOpen(true) }}>
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

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm() }}>
                <DialogContent className="max-w-4xl p-0 overflow-hidden border-none shadow-2xl rounded-[2.5rem]">
                    <div className="flex flex-col h-[90vh]">
                        <div className="p-10 pb-6 bg-gradient-to-r from-muted/50 to-background border-b border-border/40 shrink-0">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                    <Plus className="h-6 w-6" />
                                </div>
                                <DialogTitle className="text-3xl font-black uppercase tracking-tight italic">{editing ? 'Hiệu chỉnh câu hỏi' : 'Thiết lập câu hỏi mới'}</DialogTitle>
                            </div>
                            <DialogDescription className="font-medium text-muted-foreground/80 pl-16">Xây dựng nội dung học thuật cho ngân hàng tri thức.</DialogDescription>
                        </div>

                        <ScrollArea className="flex-1 p-10 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-8">
                                    <section className="space-y-4">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Thông tin cơ bản</h3>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-muted-foreground/50 tracking-widest pl-1">Phân loại câu hỏi</Label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {QUESTION_TYPES.map(type => (
                                                    <button 
                                                        key={type.value}
                                                        onClick={() => setForm({...form, questionType: type.value})}
                                                        className={cn(
                                                            "flex flex-col items-center justify-center gap-2 h-24 rounded-2xl border-2 transition-all group",
                                                            form.questionType === type.value ? "bg-primary/5 border-primary shadow-inner" : "bg-muted/10 border-transparent hover:bg-muted/20"
                                                        )}
                                                    >
                                                        <type.icon className={cn("h-6 w-6 transition-transform group-hover:scale-110", form.questionType === type.value ? "text-primary" : "text-muted-foreground/40")} />
                                                        <span className={cn("text-[10px] font-black uppercase tracking-widest", form.questionType === type.value ? "text-primary" : "text-muted-foreground/50")}>{type.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2 pt-2">
                                            <Label className="text-[10px] font-black uppercase text-muted-foreground/50 tracking-widest pl-1">Bài học liên kết</Label>
                                            <select 
                                                className="w-full h-12 bg-muted/20 rounded-2xl border border-border/50 px-4 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none"
                                                value={form.lessonId ?? ''} onChange={(e) => setForm({...form, lessonId: e.target.value ? Number(e.target.value) : undefined})}
                                            >
                                                <option value="">-- Chọn bài học --</option>
                                                {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-[10px] font-black uppercase text-muted-foreground/50 tracking-widest pl-1">Nội dung câu hỏi</Label>
                                            <textarea 
                                                rows={4} value={form.questionText} onChange={(e) => setForm({...form, questionText: e.target.value})}
                                                className="w-full bg-muted/20 border border-border/50 rounded-[2rem] p-5 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none resize-none shadow-inner"
                                                placeholder="Gõ nội dung câu hỏi tại đây..."
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase text-muted-foreground/50 tracking-widest pl-1">Điểm số</Label>
                                                <Input type="number" min={0} value={form.points} onChange={(e) => setForm({...form, points: Number(e.target.value)})} className="h-12 bg-muted/20 rounded-2xl border-border/50 font-black shadow-inner" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase text-muted-foreground/50 tracking-widest pl-1">Giải nghĩa (Tùy chọn)</Label>
                                                <Input value={form.explanation || ''} onChange={(e) => setForm({...form, explanation: e.target.value})} className="h-12 bg-muted/20 rounded-2xl border-border/50 font-bold shadow-inner" placeholder="Nhập giải thích..." />
                                            </div>
                                        </div>
                                    </section>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                            <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Thiết lập đáp án</h3>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={addOption} className="h-8 pr-3 rounded-xl gap-2 font-black text-[10px] uppercase tracking-widest text-primary hover:bg-primary/10">
                                            <Plus className="h-3 w-3" /> THÊM LỰA CHỌN
                                        </Button>
                                    </div>
                                    <div className="space-y-4">
                                        {form.options.map((option, index) => (
                                            <div key={index} className={cn(
                                                "relative group flex items-center gap-4 p-5 rounded-[2rem] border-2 transition-all shadow-sm",
                                                option.isCorrect ? "bg-emerald-500/5 border-emerald-500/30" : "bg-muted/10 border-transparent hover:border-border/40"
                                            )}>
                                                <div className="shrink-0 flex flex-col items-center gap-1">
                                                     <input 
                                                        type="checkbox" checked={option.isCorrect} onChange={(e) => updateOption(index, 'isCorrect', e.target.checked)}
                                                        className="h-6 w-6 rounded-lg accent-emerald-500 border-border bg-background"
                                                    />
                                                    <span className="text-[8px] font-black text-muted-foreground/40 uppercase">CORRECT</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <textarea 
                                                        rows={1} value={option.optionText} onChange={(e) => updateOption(index, 'optionText', e.target.value)}
                                                        className="w-full bg-transparent border-none text-sm font-black focus:ring-0 p-0 resize-none"
                                                        placeholder={`Đáp án ${index + 1}...`}
                                                    />
                                                </div>
                                                {form.options.length > 1 && (
                                                    <Button variant="ghost" size="icon" onClick={() => removeOption(index)} className="h-10 w-10 rounded-2xl text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100">
                                                        <X className="h-5 w-5" />
                                                    </Button>
                                                )}
                                                {option.isCorrect && (
                                                    <div className="absolute -top-3 -right-3 h-8 w-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 border-4 border-white dark:border-slate-900">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-3xl mt-10">
                                        <div className="flex gap-3">
                                            <HelpCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase text-amber-700 tracking-widest">Ghi chú quan trọng</p>
                                                <p className="text-[11px] font-bold text-amber-700/70 leading-relaxed uppercase">
                                                    Vui lòng chắc chắn rằng có ít nhất một đáp án được đánh dấu là <span className="text-emerald-700">Chính xác</span>. Thứ tự các đáp án sẽ được trộn ngẫu nhiên nếu được thiết lập trong đề thi.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollArea>

                        <div className="p-10 bg-muted/20 border-t border-border/40 flex justify-end gap-4 shrink-0">
                            <Button variant="ghost" onClick={resetForm} disabled={submitting} className="h-14 px-10 rounded-2xl font-black transition-all hover:bg-muted/50 uppercase tracking-widest">HỦY THIẾT LẬP</Button>
                            <Button onClick={handleSubmit} disabled={submitting} className="h-14 px-12 rounded-2xl font-black bg-primary shadow-2xl shadow-primary/30 uppercase tracking-widest">
                                {submitting ? <Loader2 className="h-6 w-6 animate-spin" /> : editing ? 'LƯU CẬP NHẬT' : 'XÁC NHẬN TẠO MỚI'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Alert */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="max-w-md rounded-[2.5rem] p-10 text-center gap-8 border-none shadow-2xl">
                    <div className="h-20 w-20 rounded-3xl bg-destructive/10 flex items-center justify-center text-destructive mx-auto scale-110 shadow-inner">
                        <Trash2 className="h-10 w-10" />
                    </div>
                    <div className="space-y-3">
                        <DialogTitle className="text-3xl font-black uppercase tracking-tight italic">Loại bỏ câu hỏi?</DialogTitle>
                        <DialogDescription className="font-medium text-muted-foreground/60 px-2 leading-relaxed">Câu hỏi <span className="text-foreground font-black italic underline">#{deleting?.id}</span> sẽ biến mất vĩnh viễn khỏi ngân hàng. Hành động này không thể hoàn tác.</DialogDescription>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <Button variant="outline" onClick={() => setDeleteOpen(false)} className="h-14 rounded-2xl font-black bg-muted/20 border-border/50 uppercase tracking-widest">GIỮ LẠI</Button>
                        <Button variant="destructive" onClick={handleDelete} className="h-14 rounded-2xl font-black shadow-xl shadow-destructive/30 uppercase tracking-widest">LOẠI BỎ NGAY</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}