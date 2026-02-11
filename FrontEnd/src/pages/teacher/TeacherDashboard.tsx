import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { classroomApi, ClassRoomResponse } from '../../services/api/classroomApi'
import { examApi, ExamResponse } from '../../services/api/examApi'
import StatCard from '../../components/ui/StatCard'
import Badge from '../../components/ui/Badge'
import {
    Users,
    FileText,
    TrendingUp,
    Plus,
    BarChart3,
    School,
    Loader2,
    AlertTriangle,
    ClipboardList,
    ArrowRight,
} from 'lucide-react'

export default function TeacherDashboard() {
    const navigate = useNavigate()
    const user = useAuthStore((s) => s.user)
    const [classes, setClasses] = useState<ClassRoomResponse[]>([])
    const [exams, setExams] = useState<ExamResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!user?.id) return
        const load = async () => {
            setLoading(true)
            setError(null)
            try {
                const [cls, examPage] = await Promise.all([
                    classroomApi.getByTeacher(user.id),
                    examApi.getByTeacher(user.id, 0, 100),
                ])
                setClasses(cls)
                setExams(examPage.content)
            } catch {
                setError('Không thể tải dữ liệu. Vui lòng thử lại.')
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [user?.id])

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
                <AlertTriangle className="w-10 h-10 text-red-400" />
                <p style={{ color: 'var(--color-text-secondary)' }}>{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                    Thử lại
                </button>
            </div>
        )
    }

    const totalStudents = classes.reduce((sum, c) => sum + (c.studentCount || 0), 0)
    const totalExams = exams.length
    const avgScore =
        exams.length > 0
            ? Math.round(
                  exams.reduce((sum, e) => sum + (e.averageScore || 0), 0) / exams.filter((e) => e.averageScore).length || 0,
              )
            : 0

    const recentExams = [...exams]
        .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
        .slice(0, 5)

    const quickActions = [
        { label: 'Tạo bài thi', icon: Plus, path: '/teacher/exams', color: 'bg-blue-600 hover:bg-blue-700' },
        { label: 'Xem kết quả', icon: BarChart3, path: '/teacher/exams', color: 'bg-emerald-600 hover:bg-emerald-700' },
        { label: 'Quản lý lớp', icon: School, path: '/teacher/classrooms', color: 'bg-purple-600 hover:bg-purple-700' },
    ]

    return (
        <div className="p-6 lg:p-8 space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                    Xin chào, {user?.fullName || 'Giáo viên'}!
                </h1>
                <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Tổng quan hoạt động giảng dạy của bạn
                </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<School className="w-6 h-6" />}
                    label="Số lớp học"
                    value={classes.length}
                    color="text-blue-400"
                />
                <StatCard
                    icon={<Users className="w-6 h-6" />}
                    label="Tổng học sinh"
                    value={totalStudents}
                    color="text-emerald-400"
                />
                <StatCard
                    icon={<FileText className="w-6 h-6" />}
                    label="Bài thi đã tạo"
                    value={totalExams}
                    color="text-purple-400"
                />
                <StatCard
                    icon={<TrendingUp className="w-6 h-6" />}
                    label="Điểm TB bài thi"
                    value={avgScore > 0 ? `${avgScore}%` : '—'}
                    color="text-orange-400"
                />
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text)' }}>
                    Thao tác nhanh
                </h2>
                <div className="flex flex-wrap gap-3">
                    {quickActions.map((action) => (
                        <button
                            key={action.label}
                            onClick={() => navigate(action.path)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-medium transition-colors ${action.color}`}
                        >
                            <action.icon className="w-4 h-4" />
                            {action.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Recent Exams */}
            <div className="card p-6">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                        Bài thi gần đây
                    </h2>
                    <button
                        onClick={() => navigate('/teacher/exams')}
                        className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                    >
                        Xem tất cả <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                {recentExams.length === 0 ? (
                    <div className="flex flex-col items-center py-10 gap-3">
                        <ClipboardList className="w-10 h-10 text-slate-500" />
                        <p style={{ color: 'var(--color-text-secondary)' }}>Chưa có bài thi nào</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--color-bg-secondary)' }}>
                        <table className="w-full text-left">
                            <thead>
                                <tr style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Tiêu đề</th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Lớp</th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Trạng thái</th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Đã nộp</th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>Điểm TB</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y" style={{ borderColor: 'var(--color-bg-secondary)' }}>
                                {recentExams.map((exam) => (
                                    <tr
                                        key={exam.id}
                                        className="transition-colors hover:bg-slate-800/30 cursor-pointer"
                                        style={{ backgroundColor: 'var(--color-bg)' }}
                                        onClick={() => navigate(`/teacher/exams/${exam.id}/results`)}
                                    >
                                        <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                                            {exam.title}
                                        </td>
                                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                            {exam.className || '—'}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <Badge
                                                variant={
                                                    exam.status === 'PUBLISHED'
                                                        ? 'success'
                                                        : exam.status === 'CLOSED'
                                                          ? 'danger'
                                                          : 'warning'
                                                }
                                            >
                                                {exam.status === 'PUBLISHED' ? 'Đang mở' : exam.status === 'CLOSED' ? 'Đã đóng' : 'Nháp'}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                            {exam.submittedCount ?? 0}
                                        </td>
                                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                            {exam.averageScore != null ? `${Math.round(exam.averageScore)}%` : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
