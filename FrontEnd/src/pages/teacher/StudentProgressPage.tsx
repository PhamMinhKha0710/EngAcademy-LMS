import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '../../store/authStore'
import { classroomApi, ClassRoomResponse } from '../../services/api/classroomApi'
import { progressApi, ProgressResponse } from '../../services/api/progressApi'
import api from '../../services/api/axios'
import StatCard from '../../components/ui/StatCard'
import DataTable from '../../components/ui/DataTable'
import ProgressBar from '../../components/ui/ProgressBar'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import {
    Loader2,
    AlertTriangle,
    Users,
    BookOpen,
    CheckCircle,
    BarChart3,
    School,
    Inbox,
} from 'lucide-react'

interface StudentInfo {
    id: number
    username: string
    fullName: string
    email?: string
}

interface ApiResponse<T> {
    success: boolean
    message: string
    data: T
}

interface ProgressStats {
    totalLessons?: number
    completedLessons?: number
    inProgressLessons?: number
    averageCompletion?: number
    [key: string]: unknown
}

export default function StudentProgressPage() {
    const user = useAuthStore((s) => s.user)
    const [classes, setClasses] = useState<ClassRoomResponse[]>([])
    const [selectedClass, setSelectedClass] = useState<string>('')
    const [students, setStudents] = useState<StudentInfo[]>([])
    const [selectedStudent, setSelectedStudent] = useState<string>('')

    const [progress, setProgress] = useState<ProgressResponse[]>([])
    const [stats, setStats] = useState<ProgressStats | null>(null)

    const [classesLoading, setClassesLoading] = useState(true)
    const [studentsLoading, setStudentsLoading] = useState(false)
    const [progressLoading, setProgressLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchClasses = useCallback(async () => {
        if (!user?.id) return
        setClassesLoading(true)
        try {
            const data = await classroomApi.getByTeacher(user.id)
            setClasses(data)
        } catch {
            setError('Không thể tải danh sách lớp.')
        } finally {
            setClassesLoading(false)
        }
    }, [user?.id])

    useEffect(() => {
        fetchClasses()
    }, [fetchClasses])

    const fetchStudents = useCallback(async (classId: string) => {
        if (!classId) {
            setStudents([])
            return
        }
        setStudentsLoading(true)
        try {
            const res = await api.get<ApiResponse<StudentInfo[]>>(`/classes/${classId}/students`)
            setStudents(res.data.data || [])
        } catch {
            setStudents([])
        } finally {
            setStudentsLoading(false)
        }
    }, [])

    const fetchProgress = useCallback(async (studentId: string) => {
        if (!studentId) {
            setProgress([])
            setStats(null)
            return
        }
        setProgressLoading(true)
        setError(null)
        try {
            const [prog, st] = await Promise.all([
                progressApi.getAll(parseInt(studentId)),
                progressApi.getStats(parseInt(studentId)),
            ])
            setProgress(prog)
            setStats(st as ProgressStats)
        } catch {
            setError('Không thể tải tiến độ học sinh.')
        } finally {
            setProgressLoading(false)
        }
    }, [])

    const handleClassChange = (val: string) => {
        setSelectedClass(val)
        setSelectedStudent('')
        setProgress([])
        setStats(null)
        fetchStudents(val)
    }

    const handleStudentChange = (val: string) => {
        setSelectedStudent(val)
        fetchProgress(val)
    }

    const columns = [
        {
            key: 'lessonTitle',
            label: 'Bài học',
            render: (item: Record<string, unknown>) => (
                <span className="font-medium" style={{ color: 'var(--color-text)' }}>
                    {(item.lessonTitle as string) || `Lesson #${item.lessonId}`}
                </span>
            ),
        },
        {
            key: 'completionPercentage',
            label: 'Tiến độ',
            render: (item: Record<string, unknown>) => {
                const pct = (item.completionPercentage as number) ?? 0
                return (
                    <div className="w-32">
                        <ProgressBar
                            value={pct}
                            color={pct >= 100 ? 'from-emerald-500 to-emerald-600' : 'from-blue-500 to-blue-600'}
                        />
                        <span className="text-xs mt-0.5 block" style={{ color: 'var(--color-text-secondary)' }}>
                            {Math.round(pct)}%
                        </span>
                    </div>
                )
            },
        },
        {
            key: 'isCompleted',
            label: 'Trạng thái',
            render: (item: Record<string, unknown>) => (
                <Badge variant={item.isCompleted ? 'success' : 'info'}>
                    {item.isCompleted ? 'Hoàn thành' : 'Đang học'}
                </Badge>
            ),
        },
        {
            key: 'lastAccessed',
            label: 'Truy cập lần cuối',
            render: (item: Record<string, unknown>) => {
                const la = item.lastAccessed as string
                return (
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                        {la ? new Date(la).toLocaleDateString('vi-VN') : '—'}
                    </span>
                )
            },
        },
    ]

    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                    Tiến độ học sinh
                </h1>
                <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Xem tiến độ học tập của từng học sinh trong lớp
                </p>
            </div>

            {/* Selectors */}
            <div className="flex flex-wrap items-end gap-4">
                {/* Class selector */}
                <div>
                    <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                        Lớp học
                    </label>
                    <div className="flex items-center gap-2">
                        <School className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                        <select
                            value={selectedClass}
                            onChange={(e) => handleClassChange(e.target.value)}
                            disabled={classesLoading}
                            className="px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/40 min-w-[200px]"
                            style={{
                                backgroundColor: 'var(--color-bg-secondary)',
                                borderColor: 'var(--color-bg-secondary)',
                                color: 'var(--color-text)',
                            }}
                        >
                            <option value="">-- Chọn lớp --</option>
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </select>
                        {classesLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                    </div>
                </div>

                {/* Student selector */}
                {selectedClass && (
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                            Học sinh
                        </label>
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
                            <select
                                value={selectedStudent}
                                onChange={(e) => handleStudentChange(e.target.value)}
                                disabled={studentsLoading}
                                className="px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/40 min-w-[200px]"
                                style={{
                                    backgroundColor: 'var(--color-bg-secondary)',
                                    borderColor: 'var(--color-bg-secondary)',
                                    color: 'var(--color-text)',
                                }}
                            >
                                <option value="">-- Chọn học sinh --</option>
                                {students.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.fullName || s.username}
                                    </option>
                                ))}
                            </select>
                            {studentsLoading && <Loader2 className="w-4 h-4 animate-spin text-blue-500" />}
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            {!selectedClass ? (
                <EmptyState
                    icon={<Inbox className="w-8 h-8" />}
                    title="Chọn lớp học"
                    description="Vui lòng chọn một lớp học để xem danh sách học sinh."
                />
            ) : !selectedStudent ? (
                <EmptyState
                    icon={<Users className="w-8 h-8" />}
                    title="Chọn học sinh"
                    description={
                        students.length === 0 && !studentsLoading
                            ? 'Lớp này chưa có học sinh nào.'
                            : 'Vui lòng chọn một học sinh để xem tiến độ.'
                    }
                />
            ) : error ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <AlertTriangle className="w-10 h-10 text-red-400" />
                    <p style={{ color: 'var(--color-text-secondary)' }}>{error}</p>
                    <button
                        onClick={() => fetchProgress(selectedStudent)}
                        className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                        Thử lại
                    </button>
                </div>
            ) : progressLoading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
            ) : (
                <>
                    {/* Stat cards */}
                    {stats && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                icon={<BookOpen className="w-6 h-6" />}
                                label="Tổng bài học"
                                value={stats.totalLessons ?? progress.length}
                                color="text-blue-400"
                            />
                            <StatCard
                                icon={<CheckCircle className="w-6 h-6" />}
                                label="Hoàn thành"
                                value={stats.completedLessons ?? progress.filter((p) => p.isCompleted).length}
                                color="text-emerald-400"
                            />
                            <StatCard
                                icon={<Loader2 className="w-6 h-6" />}
                                label="Đang học"
                                value={stats.inProgressLessons ?? progress.filter((p) => !p.isCompleted).length}
                                color="text-orange-400"
                            />
                            <StatCard
                                icon={<BarChart3 className="w-6 h-6" />}
                                label="TB hoàn thành"
                                value={
                                    stats.averageCompletion != null
                                        ? `${Math.round(stats.averageCompletion)}%`
                                        : progress.length > 0
                                          ? `${Math.round(progress.reduce((s, p) => s + (p.completionPercentage || 0), 0) / progress.length)}%`
                                          : '0%'
                                }
                                color="text-purple-400"
                            />
                        </div>
                    )}

                    {/* Progress table */}
                    <DataTable
                        columns={columns}
                        data={progress as unknown as Record<string, unknown>[]}
                        loading={false}
                        emptyMessage="Học sinh chưa có tiến độ học tập nào"
                    />
                </>
            )}
        </div>
    )
}
