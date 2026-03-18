import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, School, BookOpen, GraduationCap, TrendingUp, Trophy, Loader2 } from 'lucide-react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { useRole } from '@/app/useRole'
import api from '@/lib/api'
import type { ApiResponse, Page, User, School as SchoolType, Lesson, ClassRoom, LeaderboardEntry } from '@/types/api'

interface UserGrowthPoint {
    month: string
    users: number
}

interface DashboardStats {
    userCount: number
    schoolCount: number
    lessonCount: number
    classroomCount: number
}

export default function DashboardPage() {
    const { isAdmin, isSchool } = useRole()
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<DashboardStats>({ userCount: 0, schoolCount: 0, lessonCount: 0, classroomCount: 0 })
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
    const [userGrowth] = useState<UserGrowthPoint[]>([])
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (isAdmin) {
            fetchAdminData()
        } else {
            setLoading(false)
        }
    }, [isAdmin])

    const fetchAdminData = async () => {
        setLoading(true)
        setError(null)
        try {
            const [usersRes, schoolsRes, lessonsRes, classesRes, leaderboardRes] = await Promise.allSettled([
                api.get<ApiResponse<Page<User>>>('/users', { params: { page: 0, size: 1 } }),
                api.get<ApiResponse<SchoolType[]>>('/schools'),
                api.get<ApiResponse<Page<Lesson>>>('/lessons', { params: { page: 0, size: 1 } }),
                api.get<ApiResponse<ClassRoom[]>>('/classes'),
                api.get<ApiResponse<LeaderboardEntry[]>>('/leaderboard/top', { params: { limit: 5 } }),
            ])

            const userCount = usersRes.status === 'fulfilled' ? usersRes.value.data.data.totalElements : 0
            const schoolCount = schoolsRes.status === 'fulfilled' ? schoolsRes.value.data.data.length : 0
            const lessonCount = lessonsRes.status === 'fulfilled' ? lessonsRes.value.data.data.totalElements : 0
            const classroomCount = classesRes.status === 'fulfilled' ? classesRes.value.data.data.length : 0

            setStats({ userCount, schoolCount, lessonCount, classroomCount })

            if (leaderboardRes.status === 'fulfilled') {
                setLeaderboard(leaderboardRes.value.data.data)
            }
        } catch {
            setError('Không thể tải dữ liệu. Vui lòng thử lại.')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                </div>
            </div>
        )
    }

    if (isSchool) {
        return <SchoolDashboard />
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-1">Tổng quan hệ thống English Learning Platform</p>
            </div>

            {error && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                </div>
            )}

            {/* Stats cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Tổng người dùng"
                    value={stats.userCount}
                    icon={Users}
                    color="text-blue-600"
                    bg="bg-blue-50 dark:bg-blue-950/50"
                />
                <StatCard
                    title="Trường học"
                    value={stats.schoolCount}
                    icon={School}
                    color="text-emerald-600"
                    bg="bg-emerald-50 dark:bg-emerald-950/50"
                />
                <StatCard
                    title="Bài học"
                    value={stats.lessonCount}
                    icon={BookOpen}
                    color="text-purple-600"
                    bg="bg-purple-50 dark:bg-purple-950/50"
                />
                <StatCard
                    title="Lớp học"
                    value={stats.classroomCount}
                    icon={GraduationCap}
                    color="text-cyan-600"
                    bg="bg-cyan-50 dark:bg-cyan-950/50"
                />
            </div>

            {/* Charts & Leaderboard row */}
            <div className="grid gap-4 lg:grid-cols-7">
                {/* User growth chart */}
                <Card className="lg:col-span-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Tăng trưởng người dùng
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {userGrowth.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
                                <TrendingUp className="h-12 w-12 mb-2 opacity-50" />
                                <p className="text-sm">Chưa có dữ liệu tăng trưởng</p>
                                <p className="text-xs mt-1">Dữ liệu sẽ hiển thị khi có API thống kê theo tháng</p>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={userGrowth}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                    <XAxis dataKey="month" className="text-xs" />
                                    <YAxis className="text-xs" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '8px',
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="users"
                                        stroke="hsl(var(--primary))"
                                        strokeWidth={3}
                                        dot={{ fill: 'hsl(var(--primary))' }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        )}
                    </CardContent>
                </Card>

                {/* Top 5 Leaderboard */}
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            Top 5 Bảng xếp hạng
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {leaderboard.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">Chưa có dữ liệu</p>
                        ) : (
                            <div className="space-y-3">
                                {leaderboard.map((entry, index) => (
                                    <div
                                        key={entry.userId}
                                        className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                                    >
                                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${getRankStyle(index)}`}>
                                            {entry.rank ?? index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {entry.fullName || entry.username}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                @{entry.username}
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-bold text-primary">
                                                {entry.totalCoins?.toLocaleString() ?? 0}
                                            </p>
                                            <p className="text-xs text-muted-foreground">xu</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function getRankStyle(index: number): string {
    switch (index) {
        case 0:
            return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400'
        case 1:
            return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300'
        case 2:
            return 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-400'
        default:
            return 'bg-muted text-muted-foreground'
    }
}

interface StatCardProps {
    title: string
    value: number
    icon: React.ElementType
    color: string
    bg: string
}

function StatCard({ title, value, icon: Icon, color, bg }: StatCardProps) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="flex items-center gap-4 p-6">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${bg}`}>
                    <Icon className={`h-6 w-6 ${color}`} />
                </div>
                <div className="flex-1">
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="text-2xl font-bold">{value.toLocaleString()}</p>
                </div>
            </CardContent>
        </Card>
    )
}

function SchoolDashboard() {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [schoolName, setSchoolName] = useState('')
    const [schoolStats, setSchoolStats] = useState({
        classCount: 0,
        teacherCount: 0,
        studentCount: 0,
    })
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])

    useEffect(() => {
        const fetchAll = async () => {
            setLoading(true)
            setError(null)
            try {
                // Fetch school info
                const schoolRes = await api.get<ApiResponse<SchoolType[]>>('/schools')
                const schools = schoolRes.data?.data ?? []
                const school = schools[0]

                if (school) {
                    setSchoolName(school.name ?? 'Trường học')
                    setSchoolStats({
                        classCount: school.classCount ?? 0,
                        teacherCount: school.teacherCount ?? 0,
                        studentCount: school.studentCount ?? 0,
                    })

                    // Fetch school leaderboard
                    try {
                        const lbRes = await api.get<ApiResponse<LeaderboardEntry[]>>(
                            '/leaderboard/top',
                            { params: { limit: 5, schoolId: school.id } }
                        )
                        setLeaderboard(lbRes.data?.data ?? [])
                    } catch {
                        setLeaderboard([])
                    }
                } else {
                    setSchoolName('Chưa liên kết trường')
                }
            } catch {
                setError('Không thể tải thống kê trường học.')
            } finally {
                setLoading(false)
            }
        }
        fetchAll()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header with gradient accent */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white shadow-xl">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzAtOS45NC04LjA2LTE4LTE4LTE4UzAgOC4wNiAwIDE4czguMDYgMTggMTggMTggMTgtOC4wNiAxOC0xOCIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                            <School className="h-7 w-7" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">{schoolName}</h1>
                            <p className="text-blue-100 text-sm">Trang quản lý trường học</p>
                        </div>
                    </div>
                </div>
            </div>

            {error && (
                <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
                    {error}
                </div>
            )}

            {/* Stats cards with gradients */}
            <div className="grid gap-5 md:grid-cols-3">
                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg shadow-emerald-500/20 transition-transform hover:scale-[1.02]">
                    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
                    <div className="absolute -right-2 -top-2 h-16 w-16 rounded-full bg-white/10" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                <GraduationCap className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-emerald-100">Lớp học</p>
                                <p className="text-3xl font-bold">{schoolStats.classCount}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-6 text-white shadow-lg shadow-blue-500/20 transition-transform hover:scale-[1.02]">
                    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
                    <div className="absolute -right-2 -top-2 h-16 w-16 rounded-full bg-white/10" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-blue-100">Giáo viên</p>
                                <p className="text-3xl font-bold">{schoolStats.teacherCount}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 p-6 text-white shadow-lg shadow-violet-500/20 transition-transform hover:scale-[1.02]">
                    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
                    <div className="absolute -right-2 -top-2 h-16 w-16 rounded-full bg-white/10" />
                    <div className="relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                <BookOpen className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-violet-100">Học sinh</p>
                                <p className="text-3xl font-bold">{schoolStats.studentCount}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Leaderboard & Quick Links */}
            <div className="grid gap-5 lg:grid-cols-5">
                {/* Leaderboard */}
                <Card className="lg:col-span-3 border-0 shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            Top học sinh xuất sắc
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {leaderboard.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                <Trophy className="h-12 w-12 mb-3 opacity-30" />
                                <p className="text-sm font-medium">Chưa có dữ liệu xếp hạng</p>
                                <p className="text-xs mt-1">Khi học sinh tích lũy xu, bảng xếp hạng sẽ hiển thị</p>
                            </div>
                        ) : (
                            <div className="space-y-2.5">
                                {leaderboard.map((entry, index) => (
                                    <div
                                        key={entry.userId}
                                        className="flex items-center gap-3 rounded-xl border p-3.5 transition-all hover:bg-muted/50 hover:shadow-sm"
                                    >
                                        <div className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold shrink-0 ${getRankStyle(index)}`}>
                                            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : entry.rank ?? index + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold truncate">
                                                {entry.fullName || entry.username}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                🔥 {entry.streakDays ?? 0} ngày liên tiếp
                                            </p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className="text-sm font-bold text-primary">
                                                {entry.totalCoins?.toLocaleString() ?? 0}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">xu</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick navigation */}
                <Card className="lg:col-span-2 border-0 shadow-lg">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg">⚡ Truy cập nhanh</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {[
                            { label: 'Quản lý lớp học', href: '/classrooms', icon: GraduationCap, gradient: 'from-emerald-500 to-teal-500' },
                            { label: 'Quản lý giáo viên', href: '/teachers', icon: Users, gradient: 'from-blue-500 to-indigo-500' },
                            { label: 'Quản lý học sinh', href: '/students', icon: BookOpen, gradient: 'from-violet-500 to-purple-500' },
                            { label: 'Xem bảng điểm', href: '/grades', icon: Trophy, gradient: 'from-amber-500 to-orange-500' },
                        ].map((item) => {
                            const Icon = item.icon
                            return (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    className="flex items-center gap-3 rounded-xl border p-3.5 transition-all hover:shadow-md hover:-translate-y-0.5 group"
                                >
                                    <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${item.gradient} text-white shadow-sm`}>
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <span className="text-sm font-semibold group-hover:text-primary transition-colors">
                                        {item.label}
                                    </span>
                                </a>
                            )
                        })}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
