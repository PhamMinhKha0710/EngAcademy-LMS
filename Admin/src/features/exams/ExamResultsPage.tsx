import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ArrowLeft, ChevronDown, ChevronRight, ClipboardList, ShieldAlert } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'sonner'
import type { ApiResponse, ExamResult, AntiCheatEvent } from '@/types/api'

export default function ExamResultsPage() {
    const { examId } = useParams()
    const navigate = useNavigate()

    const [results, setResults] = useState<ExamResult[]>([])
    const [loading, setLoading] = useState(true)
    const [expandedRow, setExpandedRow] = useState<number | null>(null)
    const [antiCheatEvents, setAntiCheatEvents] = useState<Record<number, AntiCheatEvent[]>>({})
    const [loadingEvents, setLoadingEvents] = useState<number | null>(null)

    const fetchResults = async () => {
        setLoading(true)
        try {
            const response = await api.get<ApiResponse<ExamResult[]>>(`/exams/${examId}/results`)
            setResults(Array.isArray(response.data.data) ? response.data.data : [])
        } catch {
            toast.error('Không thể tải kết quả bài thi')
            setResults([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (examId) {
            fetchResults()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [examId])

    const fetchAntiCheatEvents = async (resultId: number) => {
        if (antiCheatEvents[resultId]) return
        setLoadingEvents(resultId)
        try {
            const response = await api.get<ApiResponse<AntiCheatEvent[]>>(
                `/exams/results/${resultId}/anti-cheat-events`
            )
            setAntiCheatEvents((prev) => ({
                ...prev,
                [resultId]: Array.isArray(response.data.data) ? response.data.data : [],
            }))
        } catch {
            toast.error('Không thể tải dữ liệu chống gian lận')
            setAntiCheatEvents((prev) => ({
                ...prev,
                [resultId]: [],
            }))
        } finally {
            setLoadingEvents(null)
        }
    }

    const toggleRow = (resultId: number) => {
        if (expandedRow === resultId) {
            setExpandedRow(null)
        } else {
            setExpandedRow(resultId)
            fetchAntiCheatEvents(resultId)
        }
    }

    const getGradeBadge = (grade?: string) => {
        if (!grade) return <Badge variant="outline">-</Badge>
        const config: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            A: 'default',
            B: 'default',
            C: 'secondary',
            D: 'outline',
            F: 'destructive',
        }
        return <Badge variant={config[grade.toUpperCase()] || 'outline'}>{grade}</Badge>
    }

    const getStatusBadge = (status?: string) => {
        if (!status) return <Badge variant="outline">-</Badge>
        const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
            SUBMITTED: { label: 'Đã nộp', variant: 'default' },
            IN_PROGRESS: { label: 'Đang làm', variant: 'secondary' },
            GRADED: { label: 'Đã chấm', variant: 'default' },
            FLAGGED: { label: 'Nghi vấn', variant: 'destructive' },
        }
        const c = config[status] || { label: status, variant: 'outline' as const }
        return <Badge variant={c.variant}>{c.label}</Badge>
    }

    const formatDateTime = (dt?: string) => {
        if (!dt) return '-'
        try {
            return new Date(dt).toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            })
        } catch {
            return dt
        }
    }

    const examTitle = results.length > 0 ? results[0].examTitle : `Bài thi #${examId}`

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" onClick={() => navigate('/exams')}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Kết quả bài thi</h1>
                    <p className="text-muted-foreground mt-1">
                        {examTitle} &middot; {results.length} bài nộp
                    </p>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-primary" /> Danh sách kết quả
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        </div>
                    ) : results.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                            <ClipboardList className="h-10 w-10 mb-2" />
                            <p>Chưa có kết quả nào</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-10"></TableHead>
                                    <TableHead>Học sinh</TableHead>
                                    <TableHead>Điểm</TableHead>
                                    <TableHead>Đúng/Tổng</TableHead>
                                    <TableHead>Phần trăm</TableHead>
                                    <TableHead>Xếp loại</TableHead>
                                    <TableHead>Vi phạm</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {results.map((r) => (
                                    <>
                                        <TableRow
                                            key={r.id}
                                            className="cursor-pointer hover:bg-muted/50"
                                            onClick={() => toggleRow(r.id)}
                                        >
                                            <TableCell>
                                                {expandedRow === r.id ? (
                                                    <ChevronDown className="h-4 w-4" />
                                                ) : (
                                                    <ChevronRight className="h-4 w-4" />
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {r.studentName || `Học sinh #${r.studentId}`}
                                            </TableCell>
                                            <TableCell className="font-semibold">
                                                {r.score !== undefined && r.score !== null ? r.score : '-'}
                                            </TableCell>
                                            <TableCell>
                                                {r.correctCount !== undefined && r.totalQuestions !== undefined
                                                    ? `${r.correctCount}/${r.totalQuestions}`
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>
                                                {r.percentage !== undefined && r.percentage !== null
                                                    ? `${r.percentage}%`
                                                    : '-'}
                                            </TableCell>
                                            <TableCell>{getGradeBadge(r.grade)}</TableCell>
                                            <TableCell>
                                                {r.violationCount !== undefined && r.violationCount > 0 ? (
                                                    <Badge variant="destructive" className="gap-1">
                                                        <ShieldAlert className="h-3 w-3" />
                                                        {r.violationCount}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-muted-foreground">0</span>
                                                )}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(r.status)}</TableCell>
                                        </TableRow>

                                        {/* Expanded Anti-Cheat Events */}
                                        {expandedRow === r.id && (
                                            <TableRow key={`${r.id}-events`}>
                                                <TableCell colSpan={8} className="bg-muted/30 p-0">
                                                    <div className="p-4">
                                                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                                            <ShieldAlert className="h-4 w-4 text-destructive" />
                                                            Sự kiện chống gian lận
                                                        </h4>
                                                        {loadingEvents === r.id ? (
                                                            <div className="flex items-center justify-center py-4">
                                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                                                            </div>
                                                        ) : (antiCheatEvents[r.id] ?? []).length === 0 ? (
                                                            <p className="text-sm text-muted-foreground py-2">
                                                                Không có sự kiện nào được ghi nhận
                                                            </p>
                                                        ) : (
                                                            <Table>
                                                                <TableHeader>
                                                                    <TableRow>
                                                                        <TableHead className="w-12">ID</TableHead>
                                                                        <TableHead>Loại sự kiện</TableHead>
                                                                        <TableHead>Thời gian</TableHead>
                                                                        <TableHead>Chi tiết</TableHead>
                                                                    </TableRow>
                                                                </TableHeader>
                                                                <TableBody>
                                                                    {(antiCheatEvents[r.id] ?? []).map((evt) => (
                                                                        <TableRow key={evt.id}>
                                                                            <TableCell className="font-medium">
                                                                                {evt.id}
                                                                            </TableCell>
                                                                            <TableCell>
                                                                                <Badge variant="outline">
                                                                                    {evt.eventType}
                                                                                </Badge>
                                                                            </TableCell>
                                                                            <TableCell className="text-sm">
                                                                                {formatDateTime(evt.timestamp)}
                                                                            </TableCell>
                                                                            <TableCell className="max-w-[300px] text-sm text-muted-foreground">
                                                                                {evt.details || '-'}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
