import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { School, Plus, Search, Edit, Trash2, Loader2, Eye, TrendingUp, CheckCircle, ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn, formatDate } from '@/lib/utils'
import api from '@/lib/api'
import { toast } from 'sonner'
import { useRole } from '@/app/useRole'
import type { ApiResponse, School as SchoolType, SchoolRequest } from '@/types/api'

const emptyForm: SchoolRequest = {
    name: '',
    address: '',
    phone: '',
    email: '',
    trialEndDate: '',
    isActive: true,
    managerUsername: '',
    managerPassword: '',
}

export default function SchoolsPage() {
    const { isAdmin } = useRole()
    const [schools, setSchools] = useState<SchoolType[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingSchool, setEditingSchool] = useState<SchoolType | null>(null)
    const [form, setForm] = useState<SchoolRequest>({ ...emptyForm })
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deletingSchool, setDeletingSchool] = useState<SchoolType | null>(null)
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
    const [detailOpen, setDetailOpen] = useState(false)
    const [viewingSchool, setViewingSchool] = useState<SchoolType | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [statsData, setStatsData] = useState<any>(null)

    const fetchDashboardStats = async () => {
        try {
            const response = await api.get<ApiResponse<any>>('/dashboard/stats')
            if (response.data.success) {
                setStatsData(response.data.data)
            }
        } catch (error) {
            console.error('Error fetching dashboard stats:', error)
        }
    }

    const fetchSchools = async () => {
        setLoading(true)
        try {
            const response = await api.get<ApiResponse<SchoolType[]>>('/schools')
            setSchools(response.data.data)
        } catch {
            toast.error('Không thể tải danh sách trường học')
            setSchools([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSchools()
        fetchDashboardStats()
    }, [])

    const handleSubmit = async () => {
        if (!form.name.trim()) {
            toast.error('Vui lòng nhập tên trường')
            return
        }
        if (!editingSchool) {
            if (!form.managerUsername?.trim()) {
                toast.error('Vui lòng nhập tên đăng nhập quản lý')
                return
            }
            if (!form.managerPassword?.trim() || form.managerPassword.length < 6) {
                toast.error('Mật khẩu quản lý phải ít nhất 6 ký tự')
                return
            }
        }
        setSubmitting(true)
        try {
            if (editingSchool) {
                await api.put(`/schools/${editingSchool.id}`, form)
                toast.success('Cập nhật trường học thành công')
            } else {
                await api.post('/schools', form)
                toast.success('Thêm trường học thành công')
            }
            fetchSchools()
            resetForm()
        } catch {
            toast.error(editingSchool ? 'Cập nhật thất bại' : 'Thêm trường thất bại')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (!deletingSchool) return
        setSubmitting(true)
        try {
            await api.delete(`/schools/${deletingSchool.id}`)
            toast.success(`Đã xóa trường "${deletingSchool.name}"`)
            setDeleteDialogOpen(false)
            setDeletingSchool(null)
            fetchSchools()
        } catch {
            toast.error('Xóa trường thất bại')
        } finally {
            setSubmitting(false)
        }
    }

    const resetForm = () => {
        setDialogOpen(false)
        setEditingSchool(null)
        setForm({ ...emptyForm })
    }

    const openEdit = (school: SchoolType) => {
        setEditingSchool(school)
        setForm({
            name: school.name,
            address: school.address || '',
            phone: school.phone || '',
            email: school.email || '',
            trialEndDate: school.trialEndDate || '',
            isActive: school.isActive ?? true,
            managerUsername: '',
            managerPassword: '',
        })
        setDialogOpen(true)
    }

    const filtered = schools.filter((s) => {
        const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
            (s.email && s.email.toLowerCase().includes(search.toLowerCase()))
        
        const matchStatus = statusFilter === 'all' || 
            (statusFilter === 'active' && s.isActive) || 
            (statusFilter === 'inactive' && !s.isActive)
            
        return matchSearch && matchStatus
    })

    const stats = [
        { title: 'Tổng số trường', value: statsData?.totalSchools?.toString() || '0', change: '+12%', icon: School, color: 'text-primary', bg: 'bg-primary/10', trend: 'up' },
        { title: 'Trường đang hoạt động', value: statsData?.activeSchools?.toString() || '0', change: 'Đang hoạt động', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { title: 'Tổng số học sinh', value: statsData?.studentCount?.toLocaleString() || '0', change: 'Toàn hệ thống', icon: ClipboardList, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    ]

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Quản lý trường học</h1>
                    <p className="text-muted-foreground mt-1.5 font-medium">Theo dõi và quản lý mạng lưới các cơ sở giáo dục của bạn.</p>
                </div>
                {isAdmin && (
                    <Button onClick={() => { resetForm(); setDialogOpen(true) }} className="h-12 px-6 rounded-xl gap-2 font-bold transition-all hover:scale-[1.02] active:scale-[0.98] bg-primary">
                        <Plus className="h-5 w-5" /> Thêm trường học
                    </Button>
                )}
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
                                {stat.title.includes('đang hoạt động') && (
                                    <div className="text-muted-foreground/30 font-black text-[10px] uppercase tracking-widest pt-1">
                                        {stat.change}
                                    </div>
                                )}
                                {stat.title.includes('Yêu cầu') && (
                                    <div className="text-amber-500/60 font-black text-[10px] uppercase tracking-widest pt-1 border-b border-amber-500/20">
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
                                <ClipboardList className="h-5 w-5 text-primary" />
                            </div>
                            Danh sách hệ thống
                        </CardTitle>
                        <div className="flex items-center gap-4">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                <Input
                                    placeholder="Tìm trường..."
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
                            <p className="font-bold text-foreground/80 text-lg">Không tìm thấy trường học nào</p>
                            <p className="text-muted-foreground/60">Hãy thử tìm kiếm với từ khóa khác</p>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-border/50 overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-border/50 bg-muted/30">
                                        <TableHead className="w-20 h-14 font-black text-muted-foreground uppercase text-[10px] tracking-widest pl-8">ID</TableHead>
                                        <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-widest">Trường học</TableHead>
                                        <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-widest">Địa chỉ</TableHead>
                                        <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-widest">Liên hệ</TableHead>
                                        <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-widest text-center">Trạng thái</TableHead>
                                        <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-widest text-right pr-8">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.map((school) => (
                                        <TableRow key={school.id} className="hover:bg-muted/10 border-border/40 transition-colors h-24 group">
                                            <TableCell className="font-bold text-muted-foreground/30 text-sm pl-8">#{school.id}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 rounded-xl bg-muted/30 flex items-center justify-center shrink-0 border border-border/50 group-hover:border-primary/20 transition-colors">
                                                        <span className="text-primary font-black text-lg">{school.name.charAt(0)}</span>
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-foreground leading-tight">{school.name}</span>
                                                        <span className="text-[10px] font-black text-muted-foreground/30 mt-1 uppercase tracking-widest">CODE: {school.id.toString().padStart(3, '0')}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="max-w-[200px] truncate font-bold text-foreground/80 text-sm">
                                                    {school.address || 'Chưa cập nhật'}
                                                </div>
                                                <div className="text-[10px] font-black text-muted-foreground/20 mt-1 uppercase tracking-tighter">Hồ Chí Minh, VN</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-bold text-foreground/80 text-sm">{school.email || '—'}</div>
                                                <div className="text-[10px] font-bold text-muted-foreground/40 mt-1">{school.phone || '—'}</div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className={cn(
                                                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider",
                                                    school.isActive 
                                                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-500' 
                                                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-500'
                                                )}>
                                                    <div className={cn("h-1.5 w-1.5 rounded-full", school.isActive ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-amber-600 dark:bg-amber-500')} />
                                                    {school.isActive ? 'Hoạt động' : 'Tạm dừng'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <div className="flex justify-end gap-2">
                                                     <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-muted text-muted-foreground/60 hover:text-foreground transition-all" onClick={() => { setViewingSchool(school); setDetailOpen(true) }}>
                                                         <Eye className="h-4.5 w-4.5" />
                                                     </Button>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-muted text-muted-foreground/60 hover:text-foreground transition-all" onClick={() => openEdit(school)}>
                                                        <Edit className="h-4.5 w-4.5" />
                                                    </Button>
                                                    {isAdmin && (
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-9 w-9 rounded-lg hover:bg-destructive/10 text-muted-foreground/60 hover:text-destructive transition-all"
                                                            onClick={() => {
                                                                setDeletingSchool(school)
                                                                setDeleteDialogOpen(true)
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
                    
                    {/* Pagination - Placeholder for UI */}
                    <div className="flex items-center justify-between mt-8 px-2">
                        <p className="text-sm font-bold text-muted-foreground/60">
                            Hiển thị 1-3 của {filtered.length} kết quả
                        </p>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border text-muted-foreground/40 bg-background" disabled>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button className="h-10 w-10 rounded-xl font-bold bg-primary text-white">1</Button>
                            <Button variant="ghost" className="h-10 w-10 rounded-xl font-bold text-muted-foreground/60 hover:bg-muted">2</Button>
                            <Button variant="ghost" className="h-10 w-10 rounded-xl font-bold text-muted-foreground/60 hover:bg-muted">3</Button>
                            <span className="px-1 text-muted-foreground/40">...</span>
                            <Button variant="ghost" className="h-10 w-10 rounded-xl font-bold text-muted-foreground/60 hover:bg-muted">42</Button>
                            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border text-muted-foreground/60 bg-background hover:bg-muted">
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingSchool ? 'Chỉnh sửa trường học' : 'Thêm trường học mới'}</DialogTitle>
                        <DialogDescription>Điền thông tin trường học bên dưới</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Tên trường *</Label>
                            <Input
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="VD: THCS Nguyễn Du"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Địa chỉ</Label>
                            <Input
                                value={form.address || ''}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                                placeholder="Địa chỉ trường"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Số điện thoại</Label>
                                <Input
                                    value={form.phone || ''}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    placeholder="SĐT"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    value={form.email || ''}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="Email"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Ngày hết hạn dùng thử</Label>
                                <Input
                                    type="date"
                                    value={form.trialEndDate || ''}
                                    onChange={(e) => setForm({ ...form, trialEndDate: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Trạng thái</Label>
                                <select
                                    value={form.isActive ? 'true' : 'false'}
                                    onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                >
                                    <option value="true">Hoạt động</option>
                                    <option value="false">Tạm dừng</option>
                                </select>
                            </div>
                        </div>

                        {!editingSchool && (
                            <div className="pt-4 border-t border-border/50 space-y-4">
                                <Label className="text-xs font-black text-primary uppercase tracking-widest">Tài khoản quản lý trường</Label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Tên đăng nhập *</Label>
                                        <Input
                                            value={form.managerUsername}
                                            onChange={(e) => setForm({ ...form, managerUsername: e.target.value })}
                                            placeholder="username"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Mật khẩu *</Label>
                                        <Input
                                            type="password"
                                            value={form.managerPassword}
                                            onChange={(e) => setForm({ ...form, managerPassword: e.target.value })}
                                            placeholder="******"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={resetForm} disabled={submitting}>
                            Hủy
                        </Button>
                        <Button onClick={handleSubmit} disabled={submitting}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editingSchool ? 'Cập nhật' : 'Tạo mới'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc muốn xóa trường &quot;{deletingSchool?.name}&quot;? Hành động này không thể hoàn tác.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={submitting}>
                            Hủy
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Xóa
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* School Detail Dialog */}
            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black">Chi tiết trường học</DialogTitle>
                        <DialogDescription>Thông tin đầy đủ của cơ sở giáo dục</DialogDescription>
                    </DialogHeader>
                    {viewingSchool && (
                        <div className="space-y-6 py-4">
                            <div className="flex items-center gap-5 p-5 bg-muted/30 rounded-2xl border border-border/50">
                                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-3xl font-black">
                                    {viewingSchool.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-foreground">{viewingSchool.name}</h3>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">ID: #{viewingSchool.id}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Địa chỉ</Label>
                                    <p className="text-sm font-bold text-foreground leading-snug">{viewingSchool.address || '—'}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Trạng thái</Label>
                                    <div>
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider",
                                            viewingSchool.isActive ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                                        )}>
                                            {viewingSchool.isActive ? "Đang hoạt động" : "Tạm dừng"}
                                        </span>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Email liên hệ</Label>
                                    <p className="text-sm font-bold text-foreground">{viewingSchool.email || '—'}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Số điện thoại</Label>
                                    <p className="text-sm font-bold text-foreground">{viewingSchool.phone || '—'}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Hết hạn dùng thử</Label>
                                    <p className="text-sm font-bold text-foreground">{viewingSchool.trialEndDate || 'Vĩnh viễn'}</p>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Ngày tạo</Label>
                                    <p className="text-sm font-bold text-foreground">{formatDate(viewingSchool.createdAt)}</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button onClick={() => setDetailOpen(false)} variant="outline" className="w-full h-12 rounded-xl font-black transition-all hover:bg-muted">ĐÓNG</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
