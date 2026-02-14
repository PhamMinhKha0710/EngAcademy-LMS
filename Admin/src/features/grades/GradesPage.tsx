import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Award, Search } from 'lucide-react'
import { toast } from 'sonner'

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
    const [results, setResults] = useState<ExamResultResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    const fetchGrades = async () => {
        setLoading(true)
        try {
            // Mock data for demonstration
            const mockResults: ExamResultResponse[] = [
                {
                    id: 1,
                    examId: 1,
                    examTitle: 'Kiểm tra giữa kỳ - Tiếng Anh 6',
                    studentId: 101,
                    studentName: 'Nguyễn Văn An',
                    score: 9.5,
                    correctCount: 19,
                    totalQuestions: 20,
                    percentage: 95,
                    submittedAt: '2026-02-10T14:30:00',
                    violationCount: 0,
                    grade: 'A'
                },
                {
                    id: 2,
                    examId: 1,
                    examTitle: 'Kiểm tra giữa kỳ - Tiếng Anh 6',
                    studentId: 102,
                    studentName: 'Trần Thị Bình',
                    score: 8.0,
                    correctCount: 16,
                    totalQuestions: 20,
                    percentage: 80,
                    submittedAt: '2026-02-10T14:25:00',
                    violationCount: 0,
                    grade: 'B'
                },
                {
                    id: 3,
                    examId: 2,
                    examTitle: 'Bài tập về nhà - Unit 1',
                    studentId: 101,
                    studentName: 'Nguyễn Văn An',
                    score: 10.0,
                    correctCount: 10,
                    totalQuestions: 10,
                    percentage: 100,
                    submittedAt: '2026-02-09T10:15:00',
                    violationCount: 0,
                    grade: 'A'
                },
                {
                    id: 4,
                    examId: 2,
                    examTitle: 'Bài tập về nhà - Unit 1',
                    studentId: 103,
                    studentName: 'Lê Minh Châu',
                    score: 7.5,
                    correctCount: 15,
                    totalQuestions: 20,
                    percentage: 75,
                    submittedAt: '2026-02-09T11:00:00',
                    violationCount: 1,
                    grade: 'B'
                },
                {
                    id: 5,
                    examId: 3,
                    examTitle: 'Kiểm tra cuối kỳ - Tiếng Anh 6',
                    studentId: 104,
                    studentName: 'Phạm Thị Dung',
                    score: 6.5,
                    correctCount: 13,
                    totalQuestions: 20,
                    percentage: 65,
                    submittedAt: '2026-02-08T15:45:00',
                    violationCount: 0,
                    grade: 'C'
                },
                {
                    id: 6,
                    examId: 3,
                    examTitle: 'Kiểm tra cuối kỳ - Tiếng Anh 6',
                    studentId: 102,
                    studentName: 'Trần Thị Bình',
                    score: 8.5,
                    correctCount: 17,
                    totalQuestions: 20,
                    percentage: 85,
                    submittedAt: '2026-02-08T15:30:00',
                    violationCount: 0,
                    grade: 'A'
                },
                {
                    id: 7,
                    examId: 4,
                    examTitle: 'Bài kiểm tra 15 phút - Grammar',
                    studentId: 105,
                    studentName: 'Hoàng Văn Em',
                    score: 5.0,
                    correctCount: 5,
                    totalQuestions: 10,
                    percentage: 50,
                    submittedAt: '2026-02-07T09:20:00',
                    violationCount: 2,
                    grade: 'D'
                },
                {
                    id: 8,
                    examId: 4,
                    examTitle: 'Bài kiểm tra 15 phút - Grammar',
                    studentId: 101,
                    studentName: 'Nguyễn Văn An',
                    score: 9.0,
                    correctCount: 9,
                    totalQuestions: 10,
                    percentage: 90,
                    submittedAt: '2026-02-07T09:15:00',
                    violationCount: 0,
                    grade: 'A'
                },
            ]

            setResults(mockResults)
        } catch {
            toast.error('Không thể tải danh sách điểm')
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchGrades()
    }, [])

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
