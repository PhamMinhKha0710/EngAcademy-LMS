import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { GraduationCap, Plus, Search, Edit, Trash2, Loader2, TrendingUp, CheckCircle, Users, BookOpen, ChevronLeft, ChevronRight, School } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import api from '@/lib/api'
import { toast } from 'sonner'
import { useRole } from '@/app/useRole'
import type { ApiResponse, ClassRoom, ClassRoomRequest, School as SchoolType, Page, User } from '@/types/api'

const emptyForm: ClassRoomRequest = {
    name: '',
    schoolId: undefined,
    teacherId: undefined,
    academicYear: '',
    isActive: true,
}

export default function ClassRoomsPage() {
    const { isAdmin } = useRole()
    const [rooms, setRooms] = useState<ClassRoom[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editing, setEditing] = useState<ClassRoom | null>(null)
    const [form, setForm] = useState<ClassRoomRequest>({ ...emptyForm })
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleting, setDeleting] = useState<ClassRoom | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
    const [currentUser, setCurrentUser] = useState<User | null>(null)

    // Dropdown data
    const [schools, setSchools] = useState<SchoolType[]>([])
    const [teachers, setTeachers] = useState<User[]>([])

    const fetchRooms = async () => {
        setLoading(true)
        try {
            // Check for SCHOOL role and get schoolId from user profile (we need to fetch profile first or get from context)
            // Ideally useRole should provide schoolId if present in user object in Redux
            // For now, let's fetch user profile 'me' to be sure or use the existing logic if backend filters automatically on /classes

            // NOTE: We updated backend /classes to automatic filter for SCHOOL role.
            // So calling /classes is enough.
            // BUT requirement said: "When calling GET /classes use GET /classes/school/{schoolId} instead"
            // So we will try to implement that logic.

            // We need schoolId. Let's assume we can get it from an API call to /users/me or check if user object in redux has it.
            // Since we updated UserResponse, let's try to get it from current user info if available.
            // For this implementation, I will call /users/me first if I don't have schoolId, or just rely on backend filter on /classes.
            // To strictly follow "use GET /classes/school/{schoolId}", I need schoolId.

            // Let's call /users/me to get fresh info including schoolId
            const meRes = await api.get<ApiResponse<User>>('/users/me')
            const me = meRes.data.data
            setCurrentUser(me)

            let url = '/classes?size=1000'
            if (me.roles.includes('ROLE_SCHOOL') && me.schoolId) {
                url = `/classes/school/${me.schoolId}?size=1000`
            }

            const r = await api.get<ApiResponse<any>>(url)
            const data = r.data.data
            if (Array.isArray(data)) {
                setRooms(data)
            } else if (data && data.content) {
                setRooms(data.content)
            } else {
                setRooms([])
            }
        } catch {
            toast.error('Không thể tải danh sách lớp học')
            setRooms([])
        } finally {
            setLoading(false)
        }
    }

    const fetchDropdownData = async () => {
        try {
            const [schoolsRes, usersRes] = await Promise.allSettled([
                api.get<ApiResponse<SchoolType[]>>('/schools'),
                api.get<ApiResponse<Page<User>>>('/users', { params: { page: 0, size: 100 } }),
            ])

            if (schoolsRes.status === 'fulfilled') {
                setSchools(schoolsRes.value.data.data)
            }

            if (usersRes.status === 'fulfilled') {
                const allUsers = usersRes.value.data.data.content
                const teacherList = allUsers.filter((u) =>
                    u.roles.includes('ROLE_TEACHER')
                )
                setTeachers(teacherList)
            }
        } catch {
            // Silently fail - dropdowns will just be empty
        }
    }

    useEffect(() => {
        fetchRooms()
        fetchDropdownData()
    }, [])

    const handleSubmit = async () => {
        if (!form.name.trim()) {
            toast.error('Vui lòng nhập tên lớp')
            return
        }
        setSubmitting(true)
        try {
            if (editing) {
                await api.put(`/classes/${editing.id}`, form)
                toast.success('Cập nhật lớp học thành công')
            } else {
                await api.post('/classes', form)
                toast.success('Thêm lớp học thành công')
            }
            fetchRooms()
            resetForm()
        } catch {
            toast.error(editing ? 'Cập nhật thất bại' : 'Thêm lớp thất bại')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!deleting) return
        setSubmitting(true)
        try {
            await api.delete(`/classes/${deleting.id}`)
            toast.success(`Đã xóa lớp "${deleting.name}"`)
            setDeleteOpen(false)
            setDeleting(null)
            fetchRooms()
        } catch {
            toast.error('Xóa lớp thất bại')
        } finally {
            setSubmitting(false)
        }
    }

    const resetForm = () => {
        setDialogOpen(false)
        setEditing(null)
        setForm({ ...emptyForm })
    }

    const openEdit = (r: ClassRoom) => {
        setEditing(r)
        setForm({
            name: r.name,
            schoolId: r.schoolId,
            teacherId: r.teacherId,
            academicYear: r.academicYear || '',
            isActive: r.isActive ?? true,
        })
        setDialogOpen(true)
    }

    const [viewingStudents, setViewingStudents] = useState<ClassRoom | null>(null)
    const [classStudents, setClassStudents] = useState<User[]>([])
    const [loadingStudents, setLoadingStudents] = useState(false)

    const fetchClassStudents = async (classId: number) => {
        setLoadingStudents(true)
        try {
            const res = await api.get<ApiResponse<User[]>>(`/classes/${classId}/students`)
            setClassStudents(res.data.data)
        } catch {
            toast.error('Không thể tải danh sách học sinh')
            setClassStudents([])
        } finally {
            setLoadingStudents(false)
        }
    }

    const openStudentList = (r: ClassRoom) => {
        setViewingStudents(r)
        fetchClassStudents(r.id)
    }

    const [addingStudentOpen, setAddingStudentOpen] = useState(false)
    const [searchStudent, setSearchStudent] = useState('')
    const [searchResult, setSearchResult] = useState<User[]>([])
    const [searchingStudent, setSearchingStudent] = useState(false)

    const handleSearchStudents = async () => {
        if (!searchStudent.trim()) return
        setSearchingStudent(true)
        try {
            const res = await api.get<ApiResponse<Page<User>>>('/users/students', {
                params: { keyword: searchStudent, size: 5 }
            })
            setSearchResult(res.data.data.content)
        } catch {
            setSearchResult([])
        } finally {
            setSearchingStudent(false)
        }
    }

    const handleAddStudent = async (studentId: number) => {
        if (!viewingStudents) return
        try {
            await api.post(`/classes/${viewingStudents.id}/students/${studentId}`)
            toast.success('Đã thêm học sinh vào lớp')
            // Refresh list
            fetchClassStudents(viewingStudents.id)
            fetchRooms()
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Không thể thêm học sinh')
        }
    }

    const handleRemoveStudent = async (studentId: number) => {
        if (!viewingStudents) return
        if (!confirm('Bạn có chắc muốn xóa học sinh này khỏi lớp?')) return

        try {
            await api.delete(`/classes/${viewingStudents.id}/students/${studentId}`)
            toast.success('Đã xóa học sinh khỏi lớp')
            fetchClassStudents(viewingStudents.id)
            fetchRooms() // Refresh student count
        } catch {
            toast.error('Xóa học sinh thất bại')
        }
    }

    const filtered = rooms.filter((r) => {
        const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
            (r.schoolName && r.schoolName.toLowerCase().includes(search.toLowerCase())) ||
            (r.teacherName && r.teacherName.toLowerCase().includes(search.toLowerCase()))
        
        const matchStatus = statusFilter === 'all' || 
            (statusFilter === 'active' && r.isActive) || 
            (statusFilter === 'inactive' && !r.isActive)
            
        return matchSearch && matchStatus
    })

    const stats = [
        { title: 'Tổng số lớp', value: rooms.length.toString(), change: '+3 trường mới', icon: BookOpen, color: 'text-primary', bg: 'bg-primary/10', trend: 'up' },
        { title: 'Lớp đang dạy', value: rooms.filter(r => r.isActive).length.toString(), change: 'Đang hoạt động', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { title: 'Tổng học viên', value: rooms.reduce((sum, r) => sum + (r.studentCount ?? 0), 0).toString(), change: 'Toàn hệ thống', icon: Users, color: 'text-violet-500', bg: 'bg-violet-500/10' },
    ]

    const selectClassName =
        'flex h-11 w-full rounded-xl border border-border/50 bg-muted/20 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-bold'

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Quản lý lớp học</h1>
                    <p className="text-muted-foreground mt-1.5 font-medium">Theo dõi và quản lý các lớp học và sĩ số học sinh.</p>
                </div>
                <Button onClick={() => { 
                    resetForm(); 
                    if (currentUser?.schoolId) {
                        setForm(f => ({ ...f, schoolId: currentUser.schoolId }));
                    }
                    setDialogOpen(true) 
                }} className="h-12 px-6 rounded-xl gap-2 font-bold transition-all hover:scale-[1.02] active:scale-[0.98] bg-primary">
                    <Plus className="h-5 w-5" /> Thêm lớp học
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
                                {(stat.title.includes('dạy') || stat.title.includes('học viên')) && (
                                    <div className="text-muted-foreground/30 font-black text-[10px] uppercase tracking-widest pt-1">
                                        {stat.change}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="premium-card border-none shadow-xl dark:shadow-none overflow-hidden">
                <CardHeader className="p-8 pb-0">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <CardTitle className="flex items-center gap-3 text-xl font-black">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <GraduationCap className="h-5 w-5 text-primary" />
                            </div>
                            Danh sách lớp học
                        </CardTitle>
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                <Input
                                    placeholder="Tìm lớp học..."
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
                                    Tạm dừng
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
                                <Search className="h-8 w-8 text-muted-foreground/40" />
                            </div>
                            <p className="font-bold text-foreground/80 text-lg">Không tìm thấy lớp học nào</p>
                            <p className="text-muted-foreground/60">Hãy thử tìm kiếm với từ khóa khác</p>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-border/50 overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-border/50 bg-muted/30">
                                        <TableHead className="w-20 h-14 font-black text-muted-foreground uppercase text-[10px] tracking-widest pl-8">ID</TableHead>
                                        <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-widest">Lớp học</TableHead>
                                        <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-widest">Quản lý</TableHead>
                                        <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-widest text-center">Sĩ số</TableHead>
                                        <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-widest text-center">Trạng thái</TableHead>
                                        <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-widest text-right pr-8">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.map((room) => (
                                        <TableRow key={room.id} className="hover:bg-muted/10 border-border/40 transition-colors h-24 group">
                                            <TableCell className="font-bold text-muted-foreground/30 text-sm pl-8">#{room.id}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-xl bg-muted/30 flex items-center justify-center shrink-0 border border-border/50 group-hover:border-primary/20 transition-colors">
                                                        <span className="text-primary font-black text-lg">{room.name.charAt(0)}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                         <span className="font-bold text-foreground leading-tight">{room.name}</span>
                                                         <div className="flex items-center gap-2 mt-1">
                                                             <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">{room.academicYear || 'Chưa rõ năm học'}</span>
                                                             <span className="text-[8px] font-black text-muted-foreground/20 uppercase tracking-widest">•</span>
                                                             <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">Tạo: {formatDate(room.createdAt)}</span>
                                                         </div>
                                                     </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-sm font-bold text-foreground/80">
                                                        <School className="h-3.5 w-3.5 text-muted-foreground/40" />
                                                        {room.schoolName || '—'}
                                                    </div>
                                                    <div className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-tighter flex items-center gap-2">
                                                        <div className="h-1 w-1 rounded-full bg-muted-foreground/40" />
                                                        GV: {room.teacherName || 'Chưa phân công'}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <button 
                                                    onClick={() => openStudentList(room)}
                                                    className="inline-flex flex-col items-center hover:bg-muted/50 p-2 rounded-xl transition-all"
                                                >
                                                    <span className="text-lg font-black text-primary">{room.studentCount ?? 0}</span>
                                                    <span className="text-[8px] font-black text-muted-foreground/40 uppercase tracking-widest">Học sinh</span>
                                                </button>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className={cn(
                                                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider",
                                                    room.isActive 
                                                        ? 'bg-emerald-500/10 text-emerald-600' 
                                                        : 'bg-amber-500/10 text-amber-600'
                                                )}>
                                                    <div className={cn("h-1.5 w-1.5 rounded-full", room.isActive ? 'bg-emerald-600' : 'bg-amber-600')} />
                                                    {room.isActive ? 'Hoạt động' : 'Tạm dừng'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-muted text-muted-foreground/60 hover:text-foreground transition-all" onClick={() => openEdit(room)}>
                                                        <Edit className="h-4.5 w-4.5" />
                                                    </Button>
                                                    {isAdmin && (
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-9 w-9 rounded-lg hover:bg-destructive/10 text-muted-foreground/60 hover:text-destructive transition-all"
                                                            onClick={() => {
                                                                setDeleting(room)
                                                                setDeleteOpen(true)
                                                            }}
                                                        >
                                                            <Trash2 className="h-4.5 w-4.5" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                    
                    {/* Pagination Placeholder */}
                    <div className="flex items-center justify-between mt-8 px-2">
                        <p className="text-sm font-bold text-muted-foreground/60">
                            Hiển thị {filtered.length} kết quả
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

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-3xl p-8 border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">{editing ? 'Chỉnh sửa lớp học' : 'Thêm lớp học mới'}</DialogTitle>
                        <DialogDescription className="font-medium text-muted-foreground">Điền thông tin lớp học bên dưới</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-5 py-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Tên lớp *</Label>
                            <Input
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="VD: 6A1, IELTS 01..."
                                className="h-12 rounded-xl bg-muted/20 border-border/50 focus-visible:ring-primary/20 font-bold"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Trường học</Label>
                                <select
                                    value={form.schoolId ?? ''}
                                    onChange={(e) => setForm({ ...form, schoolId: e.target.value ? Number(e.target.value) : undefined })}
                                    className={cn(selectClassName, !isAdmin && "opacity-60 cursor-not-allowed")}
                                    disabled={!isAdmin}
                                >
                                    <option value="">-- Chọn trường --</option>
                                    {schools.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Giáo viên chủ nhiệm</Label>
                                <select
                                    value={form.teacherId ?? ''}
                                    onChange={(e) => setForm({ ...form, teacherId: e.target.value ? Number(e.target.value) : undefined })}
                                    className={selectClassName}
                                >
                                    <option value="">-- Chọn giáo viên --</option>
                                    {teachers.map((t) => <option key={t.id} value={t.id}>{t.fullName || t.username}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Năm học</Label>
                                <Input
                                    value={form.academicYear || ''}
                                    onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                                    placeholder="2024-2025"
                                    className="h-11 rounded-xl bg-muted/20 border-border/50 font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Trạng thái</Label>
                                <select
                                    value={form.isActive ? 'true' : 'false'}
                                    onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                                    className={selectClassName}
                                >
                                    <option value="true">Đang hoạt động</option>
                                    <option value="false">Tạm dừng</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter className="gap-3 pt-4">
                        <Button variant="outline" onClick={resetForm} disabled={submitting} className="h-12 rounded-xl flex-1 font-black transition-all hover:bg-muted border-2">HỦY</Button>
                        <Button onClick={handleSubmit} disabled={submitting} className="h-12 rounded-xl flex-1 font-black bg-primary">
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editing ? 'CẬP NHẬT' : 'TẠO MỚI'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Student List Dialog */}
            <Dialog open={!!viewingStudents} onOpenChange={(open) => !open && setViewingStudents(null)}>
                <DialogContent className="max-w-4xl rounded-3xl p-8 border-none shadow-2xl">
                    <DialogHeader className="flex flex-row items-center justify-between pb-4">
                        <div>
                            <DialogTitle className="text-2xl font-black">Học sinh lớp {viewingStudents?.name}</DialogTitle>
                            <DialogDescription className="font-bold text-primary/60 uppercase text-[10px] tracking-widest mt-1">Danh sách học viên đang theo học</DialogDescription>
                        </div>
                        <Button onClick={() => setAddingStudentOpen(true)} className="rounded-xl h-10 px-4 bg-primary/10 text-primary hover:bg-primary hover:text-white font-bold transition-all gap-2">
                            <Plus className="h-4 w-4" /> Thêm học sinh
                        </Button>
                    </DialogHeader>
                    
                    <div className="max-h-[50vh] overflow-y-auto rounded-2xl border border-border/50">
                        {loadingStudents ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                                <Loader2 className="h-10 w-10 animate-spin text-primary/40" />
                                <p className="font-bold text-sm tracking-widest uppercase">Đang tải danh sách...</p>
                            </div>
                        ) : classStudents.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground">
                                <Users className="h-12 w-12 opacity-20" />
                                <p className="font-bold text-sm">Lớp chưa có học sinh nào</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30">
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest pl-6">ID</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest">Học sinh</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest">Email</TableHead>
                                        <TableHead className="font-black text-[10px] uppercase tracking-widest text-right pr-6">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {classStudents.map((s) => (
                                        <TableRow key={s.id} className="h-16 group hover:bg-muted/10 transition-colors">
                                            <TableCell className="font-bold text-muted-foreground/30 pl-6 text-xs">#{s.id}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs uppercase">
                                                        {(s.fullName || s.username).charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-sm leading-tight">{s.fullName || s.username}</span>
                                                        <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">@{s.username}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs font-bold text-muted-foreground">{s.email || '—'}</TableCell>
                                            <TableCell className="text-right pr-6">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-lg text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all"
                                                    onClick={() => handleRemoveStudent(s.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </div>
                    <DialogFooter className="pt-4">
                        <Button onClick={() => setViewingStudents(null)} variant="outline" className="w-full h-12 rounded-xl font-black tracking-widest transition-all hover:bg-muted border-2">ĐÓNG</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Student Search Dialog */}
            <Dialog open={addingStudentOpen} onOpenChange={setAddingStudentOpen}>
                <DialogContent className="sm:max-w-[550px] rounded-3xl p-8 border-none shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black">Thêm học sinh</DialogTitle>
                        <DialogDescription className="font-bold text-primary/60 uppercase text-[10px] tracking-widest mt-1">Tìm học viên thêm vào lớp {viewingStudents?.name}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 py-4">
                        <div className="flex gap-3">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                <Input
                                    placeholder="Nhập tên, email hoặc username..."
                                    value={searchStudent}
                                    onChange={(e) => setSearchStudent(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearchStudents()}
                                    className="pl-11 h-12 rounded-xl bg-muted/20 border-border/50 font-bold"
                                />
                            </div>
                            <Button onClick={() => handleSearchStudents()} disabled={searchingStudent} className="h-12 w-12 rounded-xl bg-primary shadow-lg shadow-primary/20">
                                {searchingStudent ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
                            </Button>
                        </div>

                        <div className="max-h-[300px] overflow-y-auto rounded-2xl border border-border/50">
                            {searchingStudent ? (
                                <div className="flex justify-center py-12">
                                    <Loader2 className="h-10 w-10 animate-spin text-primary/20" />
                                </div>
                            ) : searchResult.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground/40 font-bold text-xs uppercase tracking-widest">
                                    {searchStudent ? 'Không tìm thấy học sinh nào' : 'Bắt đầu tìm kiếm học sinh'}
                                </div>
                            ) : (
                                <Table>
                                    <TableBody>
                                        {searchResult.map((u) => {
                                            const isAlreadyInClass = classStudents.some(cs => cs.id === u.id);
                                            return (
                                                <TableRow key={u.id} className="h-16 group hover:bg-muted/10 transition-colors border-border/40">
                                                    <TableCell className="pl-6">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-sm">{u.fullName || u.username}</span>
                                                            <span className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest">@{u.username}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right pr-6">
                                                        {isAlreadyInClass ? (
                                                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600">
                                                                <CheckCircle className="h-3 w-3" /> Trong lớp
                                                            </div>
                                                        ) : (
                                                            <Button size="sm" onClick={() => handleAddStudent(u.id)} className="rounded-lg h-9 bg-primary/10 text-primary hover:bg-primary hover:text-white font-bold transition-all px-4">
                                                                Thêm
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="rounded-3xl p-8 border-none shadow-2xl space-y-4">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black">Xác nhận xóa lớp</DialogTitle>
                        <DialogDescription className="font-medium">
                            Bạn có chắc muốn xóa lớp &quot;<span className="text-foreground font-bold">{deleting?.name}</span>&quot;? Tận cả dữ liệu sĩ số sẽ bị ảnh hưởng.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-3 pt-2">
                        <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={submitting} className="h-12 rounded-xl flex-1 font-black transition-all hover:bg-muted border-2">HỦY</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={submitting} className="h-12 rounded-xl flex-1 font-black">
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            XÓA LỚP
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
