import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Award, Search, TrendingUp, CheckCircle, Target, ChevronLeft, ChevronRight, User as UserIcon } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import api from '@/lib/api'
import type { ApiResponse, Page } from '@/types/api'
import { useAppSelector } from '@/app/hooks'
import { Button } from '@/components/ui/button'

interface ExamResultResponse {
    id: number
    examId: number
    examTitle: string
    studentId: number
    studentName: string
    score: number
    correctCount: number
    totalQuestions: number
    percentage: number
    submittedAt: string
    violationCount: number
    grade: string
}

export default function GradesPage() {
    const userSnapshot = useAppSelector((state) => state.auth.user)
    const [results, setResults] = useState<ExamResultResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    const fetchGrades = async () => {
        setLoading(true)
        try {
            const isTeacher = userSnapshot?.roles?.includes('ROLE_TEACHER')
            const isAdmin = userSnapshot?.roles?.includes('ROLE_ADMIN')
            const isSchool = userSnapshot?.roles?.includes('ROLE_SCHOOL')
            
            let allResults: ExamResultResponse[] = []

            if (isTeacher) {
                const examsRes = await api.get<ApiResponse<Page<{ id: number; title: string }>>>(
                    `/exams/teacher/${userSnapshot?.id}?size=100&page=0`
                )
                const exams = examsRes.data?.data?.content ?? []

                for (const exam of exams) {
                    const res = await api.get<ApiResponse<ExamResultResponse[]>>(`/exams/${exam.id}/results`)
                    const list = res.data?.data ?? []
                    allResults.push(...list)
                }
            } else if (isAdmin || isSchool) {
                 const examsRes = await api.get<ApiResponse<Page<{ id: number; title: string }>>>(
                    `/exams?size=100&page=0`
                )
                const exams = examsRes.data?.data?.content ?? []
                for (const exam of exams) {
                    const res = await api.get<ApiResponse<ExamResultResponse[]>>(`/exams/${exam.id}/results`)
                    allResults.push(...(res.data?.data ?? []))
                }
            }

            setResults(allResults.map(r => ({
                ...r,
                score: Number(r.score),
                percentage: Number(r.percentage ?? 0),
                submittedAt: typeof r.submittedAt === 'string' ? r.submittedAt : '',
            })))
        } catch {
            toast.error('Không thể tải danh sách điểm')
            setResults([])
        } finally {
            setLoading(false)
        }
    }

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

    useEffect(() => {
        fetchGrades()
        fetchDashboardStats()
    }, [userSnapshot?.id])

    const filtered = results.filter((r) =>
        r.studentName?.toLowerCase().includes(search.toLowerCase()) ||
        r.examTitle?.toLowerCase().includes(search.toLowerCase())
    )

    const stats = [
        { title: 'Tổng lượt thi', value: statsData?.totalAttempts?.toLocaleString() || results.length.toString(), change: '+12% tuần này', icon: Target, color: 'text-primary', bg: 'bg-primary/10', trend: 'up' },
        { title: 'Điểm trung bình', value: (statsData?.averageScore || 0).toFixed(1), change: 'Toàn hệ thống', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { title: 'Xếp loại A/B', value: results.filter(r => ['A', 'B'].includes(r.grade)).length.toString(), change: 'Học viên giỏi', icon: Award, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    ]

    const getGradeStyles = (grade: string) => {
        const styles: Record<string, string> = {
            'A': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
            'B': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
            'C': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
            'D': 'bg-orange-500/10 text-orange-600 border-orange-500/20',
            'F': 'bg-destructive/10 text-destructive border-destructive/20',
        }
        return styles[grade] || 'bg-muted/50 text-muted-foreground border-border/50'
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Quản lý điểm số</h1>
                    <p className="text-muted-foreground mt-1.5 font-medium">Theo dõi kết quả học tập và đánh giá năng lực học sinh.</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.title} className="premium-card border-none shadow-xl dark:shadow-none overflow-hidden">
                        <CardContent className="p-7 flex justify-between items-start">
                            <div className="flex flex-col">
                                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-5", stat.bg)}>
                                    <stat.icon className={cn("h-6 w-6", stat.color)} />
                                </div>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{stat.title}</p>
                                <p className="text-4xl font-black mt-2 text-foreground">{stat.value}</p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                {stat.trend === 'up' && (
                                    <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs bg-emerald-500/10 px-2 rounded-lg py-1 uppercase tracking-wider">
                                        <TrendingUp className="h-3 w-3" /> {stat.change}
                                    </div>
                                )}
                                {!stat.trend && (
                                    <div className="text-muted-foreground/30 font-black text-[10px] uppercase tracking-widest pt-1">
                                        {stat.change}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Card */}
            <Card className="premium-card border-none shadow-xl dark:shadow-none overflow-hidden">
                <CardHeader className="p-8 pb-0">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <CardTitle className="flex items-center gap-3 text-xl font-black">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Award className="h-5 w-5 text-primary" />
                            </div>
                            Bảng điểm chi tiết
                        </CardTitle>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                            <Input
                                placeholder="Tìm học sinh hoặc bài thi..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-11 pr-4 h-11 w-80 bg-muted/30 border-border/50 rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-80 gap-4">
                            <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                            <p className="font-bold text-muted-foreground/60 tracking-widest uppercase text-xs">Đang xử lý dữ liệu điểm...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-80 gap-2">
                             <div className="h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center mb-2">
                                <Search className="h-8 w-8 text-muted-foreground/40" />
                            </div>
                            <p className="font-bold text-foreground/80 text-lg">Không tìm thấy kết quả nào</p>
                            <p className="text-muted-foreground/60">Chưa có dữ liệu bài thi nào được ghi nhận</p>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-border/50 overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-border/50 bg-muted/30">
                                        <TableHead className="h-14 font-black text-muted-foreground uppercase text-[10px] tracking-widest pl-8">Học sinh</TableHead>
                                        <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-widest">Bài thi</TableHead>
                                        <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-widest text-center">Kết quả</TableHead>
                                        <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-widest text-center">Xếp loại</TableHead>
                                        <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-widest text-right pr-8">Thời gian nộp</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.map((result) => (
                                        <TableRow key={result.id} className="hover:bg-muted/10 border-border/40 transition-colors h-20 group">
                                            <TableCell className="pl-8">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                                                        <UserIcon className="h-4 w-4 text-primary/60" />
                                                    </div>
                                                    <span className="font-bold text-foreground">{result.studentName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-foreground/80 leading-tight">{result.examTitle}</span>
                                                    <span className="text-[10px] font-black text-muted-foreground/30 mt-1 uppercase tracking-widest">#{result.examId}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex flex-col items-center">
                                                    <span className="text-lg font-black text-foreground">{result.score.toFixed(1)}</span>
                                                    <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-tighter">
                                                        {result.correctCount}/{result.totalQuestions} Câu đúng
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className={cn(
                                                    "inline-flex items-center justify-center min-w-[40px] h-10 rounded-xl text-lg font-black border transition-all shadow-sm",
                                                    getGradeStyles(result.grade)
                                                )}>
                                                    {result.grade}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-8">
                                                <p className="text-sm font-bold text-muted-foreground">
                                                    {new Date(result.submittedAt).toLocaleDateString('vi-VN', {
                                                        day: '2-digit',
                                                        month: '2-digit',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                                <p className="text-[10px] font-black text-muted-foreground/20 uppercase tracking-widest mt-0.5">
                                                    {new Date(result.submittedAt).toLocaleTimeString('vi-VN', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                    
                    {/* Pagination Placeholder */}
                    <div className="flex items-center justify-between mt-8 px-2">
                        <p className="text-sm font-bold text-muted-foreground/60 uppercase tracking-widest text-[10px]">
                            Tổng số {filtered.length} bản ghi
                        </p>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border text-muted-foreground/40 bg-background" disabled>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button className="h-10 w-10 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/20">1</Button>
                            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border text-muted-foreground/60 bg-background hover:bg-muted" disabled>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
