import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Award, Search } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import type { ApiResponse, Page } from '@/types/api'
import { useAppSelector } from '@/app/hooks'

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
    const user = useAppSelector((state) => state.auth.user)
    const [results, setResults] = useState<ExamResultResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    const fetchGrades = async () => {
        setLoading(true)
        try {
            const isTeacher = user?.roles?.includes('TEACHER')
            const teacherId = user?.id

            if (!isTeacher || !teacherId) {
                setResults([])
                return
            }

            const examsRes = await api.get<ApiResponse<Page<{ id: number; title: string }>>>(
                `/exams/teacher/${teacherId}?size=100&page=0`
            )
            const exams = examsRes.data?.data?.content ?? []

            const allResults: ExamResultResponse[] = []
            for (const exam of exams) {
                const res = await api.get<ApiResponse<ExamResultResponse[]>>(`/exams/${exam.id}/results`)
                const list = res.data?.data ?? []
                for (const r of list) {
                    allResults.push({
                        ...r,
                        score: Number(r.score),
                        percentage: Number(r.percentage ?? 0),
                        submittedAt: typeof r.submittedAt === 'string' ? r.submittedAt : '',
                    })
                }
            }

            setResults(allResults)
        } catch {
            toast.error('Không thể tải danh sách điểm')
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchGrades()
    }, [user?.id, user?.roles])

    const filtered = results.filter((r) =>
        r.studentName?.toLowerCase().includes(search.toLowerCase()) ||
        r.examTitle?.toLowerCase().includes(search.toLowerCase())
    )

    const getGradeBadge = (grade: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            'A': 'default',
            'B': 'secondary',
            'C': 'outline',
            'D': 'outline',
            'F': 'destructive',
        }
        return <Badge variant={variants[grade] || 'outline'}>{grade}</Badge>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý điểm</h1>
                    <p className="text-muted-foreground mt-1">Xem điểm thi của học sinh</p>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-primary" /> Bảng điểm
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
                            <Award className="h-10 w-10 mb-2" />
                            <p>Chưa có dữ liệu điểm</p>
                            <p className="text-sm mt-1">Chức năng đang được phát triển</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Học sinh</TableHead>
                                    <TableHead>Bài thi</TableHead>
                                    <TableHead>Điểm</TableHead>
                                    <TableHead>Đúng/Tổng</TableHead>
                                    <TableHead>Xếp loại</TableHead>
                                    <TableHead>Ngày thi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((result) => (
                                    <TableRow key={result.id}>
                                        <TableCell className="font-medium">{result.studentName}</TableCell>
                                        <TableCell>{result.examTitle}</TableCell>
                                        <TableCell className="font-semibold">{result.score.toFixed(2)}</TableCell>
                                        <TableCell>{result.correctCount}/{result.totalQuestions}</TableCell>
                                        <TableCell>{getGradeBadge(result.grade)}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {new Date(result.submittedAt).toLocaleDateString('vi-VN')}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
