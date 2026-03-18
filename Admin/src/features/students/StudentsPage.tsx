import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Users, Search, Trash2, UserX, Loader2, TrendingUp, CheckCircle, ChevronLeft, ChevronRight, Mail, Calendar, Plus, Edit } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import api from '@/lib/api'
import { toast } from 'sonner'
import type { ApiResponse, User } from '@/types/api'
import { UserDialog } from '@/components/shared/UserDialog'

export default function StudentsPage() {
    const [students, setStudents] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [deleting, setDeleting] = useState<number | null>(null)
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<User | null>(null)

    const fetchStudents = async () => {
        setLoading(true)
        try {
            const response = await api.get<ApiResponse<User[] | { content: User[] }>>('/users/students')
            const data = response.data.data

            // Handle both array and paginated response
            let studentUsers: User[] = []
            if (Array.isArray(data)) {
                studentUsers = data
            } else if (data && 'content' in data) {
                studentUsers = data.content
            }

            setStudents(studentUsers)
        } catch (error) {
            console.error('Failed to fetch students:', error)
            toast.error('Không thể tải danh sách học sinh')
            setStudents([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStudents()
    }, [])

    const handleDelete = async (student: User) => {
        if (!confirm(`Bạn có chắc muốn xóa học sinh "${student.fullName || student.username}"?`)) {
            return
        }

        setDeleting(student.id)
        try {
            await api.delete(`/users/${student.id}`)
            toast.success('Xóa học sinh thành công')
            fetchStudents()
        } catch {
            toast.error('Xóa học sinh thất bại')
        } finally {
            setDeleting(null)
        }
    }

    const filtered = students.filter((s) => {
        const matchSearch = s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
            s.username.toLowerCase().includes(search.toLowerCase()) ||
            s.email?.toLowerCase().includes(search.toLowerCase())
        
        const matchStatus = statusFilter === 'all' || 
            (statusFilter === 'active' && s.isActive !== false) || 
            (statusFilter === 'inactive' && s.isActive === false)
            
        return matchSearch && matchStatus
    })

    const activeCount = students.filter(s => s.isActive !== false).length
    const inactiveCount = students.length - activeCount

    const stats = [
        { title: 'Tổng học sinh', value: students.length.toString(), change: '+5.2%', icon: Users, color: 'text-primary', bg: 'bg-primary/10', trend: 'up' },
        { title: 'Đang hoạt động', value: activeCount.toString(), change: 'Ổn định', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { title: 'Tạm khóa', value: inactiveCount.toString(), change: 'Cần kiểm tra', icon: UserX, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    ]

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Quản lý học sinh</h1>
                    <p className="text-muted-foreground mt-1.5 font-medium">Theo dõi và quản lý danh sách học sinh trong hệ thống.</p>
                </div>
                <Button 
                    onClick={() => {
                        setEditingUser(null)
                        setDialogOpen(true)
                    }}
                    className="h-12 px-6 rounded-xl gap-2 font-bold transition-all hover:scale-[1.02] active:scale-[0.98] bg-primary shadow-lg shadow-primary/20"
                >
                    <Plus className="h-5 w-5" /> Thêm học sinh
                </Button>
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
                                {stat.title.includes('hoạt động') && (
                                    <div className="text-muted-foreground/30 font-black text-[10px] uppercase tracking-widest pt-1">
                                        {stat.change}
                                    </div>
                                )}
                                {stat.title.includes('Tạm khóa') && (
                                    <div className="text-rose-500/60 font-black text-[10px] uppercase tracking-widest pt-1">
                                        {stat.change}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Area */}
            <Card className="premium-card border-none shadow-xl dark:shadow-none overflow-hidden">
                <CardHeader className="p-8 pb-0">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <CardTitle className="flex items-center gap-3 text-xl font-black">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Users className="h-5 w-5 text-primary" />
                            </div>
                            Danh sách học sinh
                        </CardTitle>
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                <Input
                                    placeholder="Tìm học sinh..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-11 pr-4 h-11 w-72 bg-muted/30 border-border/50 rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium"
                                />
                            </div>
                            <div className="flex bg-muted/30 p-1 rounded-xl border border-border/50">
                                <button 
                                    onClick={() => setStatusFilter('all')}
                                    className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", statusFilter === 'all' ? "bg-primary text-white shadow-md shadow-primary/20" : "text-muted-foreground/40 hover:text-foreground")}
                                >
                                    Tất cả
                                </button>
                                <button 
                                    onClick={() => setStatusFilter('active')}
                                    className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", statusFilter === 'active' ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" : "text-muted-foreground/40 hover:text-foreground")}
                                >
                                    Hoạt động
                                </button>
                                <button 
                                    onClick={() => setStatusFilter('inactive')}
                                    className={cn("px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all", statusFilter === 'inactive' ? "bg-amber-500 text-white shadow-md shadow-amber-500/20" : "text-muted-foreground/40 hover:text-foreground")}
                                >
                                    Đã khóa
                                </button>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-80 gap-4">
                            <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                            <p className="font-bold text-muted-foreground/60">Đang tải dữ liệu...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-80 gap-2">
                             <div className="h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center mb-2">
                                <Users className="h-8 w-8 text-muted-foreground/40" />
                            </div>
                            <p className="font-bold text-foreground/80 text-lg">Không tìm thấy học sinh nào</p>
                            <p className="text-muted-foreground/60">Hãy thử tìm kiếm với từ khóa khác</p>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-border/50 overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-border/50 bg-muted/30">
                                        <TableHead className="w-20 h-14 font-black text-muted-foreground uppercase text-[10px] tracking-widest pl-8">ID</TableHead>
                                        <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-widest">Học sinh</TableHead>
                                        <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-widest">Thông tin tài khoản</TableHead>
                                        <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-widest text-center">Lớp học</TableHead>
                                        <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-widest text-center">Trạng thái</TableHead>
                                        <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-widest text-right pr-8">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.map((student) => (
                                        <TableRow key={student.id} className="hover:bg-muted/10 border-border/40 transition-colors h-24 group">
                                            <TableCell className="font-bold text-muted-foreground/30 text-sm pl-8">#{student.id}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-xl bg-muted/30 flex items-center justify-center shrink-0 border border-border/50 group-hover:border-primary/20 transition-colors relative">
                                                        <span className="text-primary font-black text-lg">
                                                            {(student.fullName || student.username).charAt(0).toUpperCase()}
                                                        </span>
                                                        {student.isActive !== false && (
                                                            <div className="absolute -top-1 -right-1 h-3 w-3 bg-emerald-500 rounded-full border-2 border-background" />
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-foreground leading-tight">{student.fullName || student.username}</span>
                                                        <span className="text-[10px] font-black text-muted-foreground/30 mt-1 uppercase tracking-widest">@{student.username}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-sm font-bold text-foreground/80">
                                                        <Mail className="h-3.5 w-3.5 text-muted-foreground/40" />
                                                        {student.email || '—'}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground/30 uppercase tracking-tight">
                                                        <Calendar className="h-3 w-3" /> Gia nhập: {formatDate(student.createdAt)}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {student.className ? (
                                                    <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[11px] font-black uppercase tracking-wider border border-primary/20">
                                                        {student.className}
                                                    </div>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest italic">Chưa chọn lớp</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className={cn(
                                                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider",
                                                    student.isActive !== false 
                                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' 
                                                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-500'
                                                )}>
                                                    <div className={cn("h-1.5 w-1.5 rounded-full", student.isActive !== false ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-rose-600 dark:bg-rose-500')} />
                                                    {student.isActive !== false ? 'Hoạt động' : 'Đã khóa'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <div className="flex justify-end gap-2">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-9 w-9 rounded-lg hover:bg-muted text-muted-foreground/60 hover:text-foreground transition-all"
                                                        onClick={() => {
                                                            setEditingUser(student)
                                                            setDialogOpen(true)
                                                        }}
                                                    >
                                                        <Edit className="h-4.5 w-4.5" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-9 w-9 rounded-lg hover:bg-destructive/10 text-muted-foreground/60 hover:text-destructive transition-all"
                                                        onClick={() => handleDelete(student)}
                                                        disabled={deleting === student.id}
                                                    >
                                                        {deleting === student.id ? (
                                                            <Loader2 className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="h-4.5 w-4.5" />
                                                        )}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                    
                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-8 px-2">
                        <p className="text-sm font-bold text-muted-foreground/60">
                            Hiển thị 1-{filtered.length} của {students.length} kết quả
                        </p>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border text-muted-foreground/40 bg-background" disabled>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button className="h-10 w-10 rounded-xl font-bold bg-primary text-white">1</Button>
                            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border text-muted-foreground/60 bg-background hover:bg-muted" disabled>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <UserDialog 
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                user={editingUser}
                onSuccess={fetchStudents}
                role="ROLE_STUDENT"
            />
        </div>
    )
}
