import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, School, BookOpen, FileText, Languages, GraduationCap, TrendingUp, Activity } from 'lucide-react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'

// Mock data for dashboard
const stats = [
    { title: 'Tổng người dùng', value: '1,234', icon: Users, change: '+12%', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/50' },
    { title: 'Trường học', value: '45', icon: School, change: '+3', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/50' },
    { title: 'Bài học', value: '189', icon: BookOpen, change: '+15', color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/50' },
    { title: 'Bài thi', value: '67', icon: FileText, change: '+8', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/50' },
    { title: 'Từ vựng', value: '3,456', icon: Languages, change: '+120', color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/50' },
    { title: 'Lớp học', value: '78', icon: GraduationCap, change: '+5', color: 'text-cyan-600', bg: 'bg-cyan-50 dark:bg-cyan-950/50' },
]

const userGrowth = [
    { month: 'T1', users: 400 },
    { month: 'T2', users: 520 },
    { month: 'T3', users: 680 },
    { month: 'T4', users: 790 },
    { month: 'T5', users: 890 },
    { month: 'T6', users: 1020 },
    { month: 'T7', users: 1234 },
]

const roleDistribution = [
    { name: 'Học sinh', value: 850, color: '#3b82f6' },
    { name: 'Giáo viên', value: 280, color: '#10b981' },
    { name: 'Trường học', value: 45, color: '#f59e0b' },
    { name: 'Admin', value: 5, color: '#ef4444' },
]

const recentActivity = [
    { action: 'Người dùng mới đăng ký', detail: 'nguyenvana@email.com', time: '5 phút trước' },
    { action: 'Bài thi được tạo', detail: 'Kiểm tra Unit 5 - Grammar', time: '15 phút trước' },
    { action: 'Trường học được thêm', detail: 'THCS Nguyễn Du', time: '1 giờ trước' },
    { action: 'Bài học được cập nhật', detail: 'Present Simple Tense', time: '2 giờ trước' },
    { action: 'Từ vựng mới', detail: '50 từ vựng Unit 6 được thêm', time: '3 giờ trước' },
]

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* Page title */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <p className="text-muted-foreground mt-1">Tổng quan hệ thống English Learning Platform</p>
            </div>

            {/* Stats cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat) => (
                    <Card key={stat.title} className="hover:shadow-md transition-shadow">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg}`}>
                                <stat.icon className={`h-6 w-6 ${stat.color}`} />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm text-muted-foreground">{stat.title}</p>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                    <span className="text-xs font-medium text-emerald-600 flex items-center">
                                        <TrendingUp className="h-3 w-3 mr-0.5" />
                                        {stat.change}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts row */}
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
                                <Line type="monotone" dataKey="users" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ fill: 'hsl(var(--primary))' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Role distribution */}
                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Users className="h-5 w-5 text-primary" />
                            Phân bố vai trò
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={roleDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                                    {roleDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap justify-center gap-3 mt-2">
                            {roleDistribution.map((item) => (
                                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                                    <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-muted-foreground">{item.name}: {item.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent activity */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                        <Activity className="h-5 w-5 text-primary" />
                        Hoạt động gần đây
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {recentActivity.map((item, i) => (
                            <div key={i} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                                <div className="h-2 w-2 rounded-full bg-primary mt-2 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium">{item.action}</p>
                                    <p className="text-sm text-muted-foreground truncate">{item.detail}</p>
                                </div>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">{item.time}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
