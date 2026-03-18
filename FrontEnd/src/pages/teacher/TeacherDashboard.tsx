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
    CalendarDays,
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
        { label: 'Tạo bài thi', icon: Plus, path: '/teacher/exams', tone: 'text-blue-600 bg-blue-50 border-blue-100' },
        { label: 'Xem kết quả', icon: BarChart3, path: '/teacher/exams', tone: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
        { label: 'Quản lý lớp', icon: School, path: '/teacher/management', tone: 'text-violet-600 bg-violet-50 border-violet-100' },
    ]

    return (
        <div className="p-6 lg:p-8 space-y-8 bg-[#F8FAFC] dark:bg-slate-950 min-h-full">
            <section className="rounded-3xl border border-slate-200/70 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 p-6 md:p-8 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-wider font-semibold text-blue-600">Teacher Dashboard</p>
                        <h1 className="text-2xl md:text-3xl font-black mt-2" style={{ color: 'var(--color-text)' }}>
                            Xin chào, {user?.fullName || 'Giáo viên'}!
                        </h1>
                        <p className="mt-2 text-sm md:text-base" style={{ color: 'var(--color-text-secondary)' }}>
                            Tổng quan lớp học, bài thi và hiệu quả học tập.
                        </p>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-semibold">
                        <CalendarDays className="w-4 h-4" />
                        Hôm nay
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatCard icon={<School className="w-6 h-6" />} label="Số lớp học" value={classes.length} color="text-blue-500" />
                <StatCard icon={<Users className="w-6 h-6" />} label="Tổng học sinh" value={totalStudents} color="text-emerald-500" />
                <StatCard icon={<FileText className="w-6 h-6" />} label="Bài thi đã tạo" value={totalExams} color="text-violet-500" />
                <StatCard icon={<TrendingUp className="w-6 h-6" />} label="Điểm TB bài thi" value={avgScore > 0 ? `${avgScore}%` : '—'} color="text-orange-500" />
            </section>

            <section className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 md:p-6 shadow-sm">
                <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--color-text)' }}>
                    Thao tác nhanh
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {quickActions.map((action) => (
                        <button
                            key={action.label}
                            onClick={() => navigate(action.path)}
                            className={`h-12 rounded-xl border font-semibold text-sm transition-all hover:-translate-y-0.5 ${action.tone}`}
                        >
                            <span className="inline-flex items-center gap-2">
                                <action.icon className="w-4 h-4" />
                                {action.label}
                            </span>
                        </button>
                    ))}
                </div>
            </section>

            <section className="rounded-2xl border border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 md:p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
                        Bài thi gần đây
                    </h2>
                    <button
                        onClick={() => navigate('/teacher/exams')}
                        className="text-sm font-semibold text-blue-600 hover:text-blue-500 flex items-center gap-1 transition-colors"
                    >
                        Xem tất cả <ArrowRight className="w-4 h-4" />
                    </button>
                </div>

                {recentExams.length === 0 ? (
                    <div className="flex flex-col items-center py-10 gap-3">
                        <ClipboardList className="w-10 h-10 text-slate-400" />
                        <p style={{ color: 'var(--color-text-secondary)' }}>Chưa có bài thi nào</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-800/60">
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Tiêu đề</th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Lớp</th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Trạng thái</th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Đã nộp</th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Điểm TB</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {recentExams.map((exam) => (
                                    <tr
                                        key={exam.id}
                                        className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer"
                                        onClick={() => navigate(`/teacher/exams/${exam.id}/results`)}
                                    >
                                        <td className="px-4 py-3 text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
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
                                        <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                                            {exam.submittedCount ?? 0}
                                        </td>
                                        <td className="px-4 py-3 text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>
                                            {exam.averageScore != null ? `${Math.round(exam.averageScore)}%` : '—'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    )
}
