import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Users, Search, ChevronLeft, ChevronRight, Coins, Eye, Flame, UserPlus, EyeOff, Trash2, CheckCircle, Edit } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import api from '@/lib/api'
import type { ApiResponse, Page, User } from '@/types/api'
import { useRole } from '@/app/useRole'

const ROLE_OPTIONS = [
    { label: 'Tất cả vai trò', value: '' },
    { label: 'Admin', value: 'ROLE_ADMIN' },
    { label: 'Học sinh', value: 'ROLE_STUDENT' },
    { label: 'Giáo viên', value: 'ROLE_TEACHER' },
    { label: 'Trường học', value: 'ROLE_SCHOOL' },
]

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [roleFilter, setRoleFilter] = useState('')
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)

    // Coins dialog
    const [coinsDialogOpen, setCoinsDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [coinsAmount, setCoinsAmount] = useState('')

    // Detail dialog
    const [detailOpen, setDetailOpen] = useState(false)
    const [detailUser, setDetailUser] = useState<User | null>(null)

    // Create user dialog
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [newUser, setNewUser] = useState({
        username: '',
        email: '',
        password: '',
        fullName: '',
        roles: [] as string[]
    })
    const [showPassword, setShowPassword] = useState(false)

    // Role-based permissions
    const { canCreateUser, canDeleteUser } = useRole()

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const response = await api.get<ApiResponse<Page<User>>>(`/users?page=${page}&size=10&sort=id,asc`)
            setUsers(response.data.data.content)
            setTotalPages(response.data.data.totalPages)
            setTotalElements(response.data.data.totalElements)
        } catch {
            setUsers([])
            toast.error('Không thể tải danh sách người dùng')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchUsers() }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

    const handleAddCoins = async () => {
        if (!selectedUser || !coinsAmount) return
        try {
            await api.post(`/users/${selectedUser.id}/coins?amount=${coinsAmount}`)
            toast.success(`Đã thêm ${coinsAmount} xu cho ${selectedUser.fullName}`)
            fetchUsers()
        } catch {
            toast.error('Thêm xu thất bại')
        }
        setCoinsDialogOpen(false)
        setCoinsAmount('')
    }

    const handleCreateUser = async () => {
        // Validation
        if (!newUser.username || !newUser.email || !newUser.password || !newUser.fullName) {
            toast.error('Vui lòng điền đầy đủ thông tin')
            return
        }
        if (newUser.roles.length === 0) {
            toast.error('Vui lòng chọn ít nhất một vai trò')
            return
        }

        try {
            await api.post('/users', newUser)
            toast.success(`Đã tạo người dùng ${newUser.username}`)
            setCreateDialogOpen(false)
            setNewUser({ username: '', email: '', password: '', fullName: '', roles: [] })
            fetchUsers()
        } catch (error: unknown) {
            const msg = error && typeof error === 'object' && 'response' in error
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                : null
            toast.error(msg || 'Tạo người dùng thất bại')
        }
    }

    const toggleRole = (role: string) => {
        setNewUser(prev => ({
            ...prev,
            roles: prev.roles.includes(role)
                ? prev.roles.filter(r => r !== role)
                : [...prev.roles, role]
        }))
    }

    const handleDeleteUser = async (userId: number, username: string) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa người dùng "${username}"?`)) {
            return
        }

        try {
            await api.delete(`/users/${userId}`)
            toast.success(`Đã xóa người dùng ${username}`)
            fetchUsers()
        } catch (error: unknown) {
            const msg = error && typeof error === 'object' && 'response' in error
                ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
                : null
            toast.error(msg || 'Xóa người dùng thất bại')
        }
    }

    const getRoleBadge = (role: string) => {
        const config: Record<string, { label: string; bg: string; text: string }> = {
            ROLE_ADMIN: { label: 'ADMIN', bg: 'bg-red-500/10 dark:bg-red-500/20', text: 'text-red-600 dark:text-red-400' },
            ROLE_SCHOOL: { label: 'TRƯỜNG', bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-400' },
            ROLE_TEACHER: { label: 'GIÁO VIÊN', bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400' },
            ROLE_STUDENT: { label: 'HỌC SINH', bg: 'bg-indigo-500/10 dark:bg-indigo-500/20', text: 'text-indigo-600 dark:text-indigo-400' },
        }
        const c = config[role] || { label: role, bg: 'bg-muted', text: 'text-muted-foreground' }
        return <span className={cn("px-2 py-1 rounded-md text-[10px] font-black tracking-wider uppercase", c.bg, c.text)}>{c.label}</span>
    }

    // Apply client-side filters
    const filtered = users.filter((u) => {
        const matchSearch =
            u.username.toLowerCase().includes(search.toLowerCase()) ||
            u.fullName.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
        const matchRole = !roleFilter || u.roles.includes(roleFilter)
        return matchSearch && matchRole
    })

    const stats = [
        { title: 'Tổng người dùng', value: '1,284', icon: Users, color: 'text-primary', bg: 'bg-primary/10' },
        { title: 'Đang hoạt động', value: '1,150', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { title: 'Streak cao nhất', value: '45 ngày', icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { title: 'Tổng xu hệ thống', value: '82.5K', icon: Coins, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    ]

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-foreground">Quản lý người dùng</h1>
                    <p className="text-muted-foreground mt-2 font-medium">Quản lý và theo dõi thông tin học sinh, giáo viên trong hệ thống.</p>
                </div>
                {canCreateUser && (
                    <Button onClick={() => setCreateDialogOpen(true)} className="h-12 px-6 rounded-xl gap-2 font-black shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] bg-primary">
                        <UserPlus className="h-5 w-5" /> Tạo người dùng mới
                    </Button>
                )}
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.title} className="premium-card border-none shadow-xl dark:shadow-none overflow-hidden">
                        <CardContent className="p-7">
                            <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-5", stat.bg)}>
                                <stat.icon className={cn("h-6 w-6", stat.color)} />
                            </div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">{stat.title}</p>
                            <p className="text-3xl font-black text-foreground tracking-tight">{stat.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Main Content Area */}
            <Card className="premium-card border-none shadow-xl dark:shadow-none bg-card overflow-hidden">
                <CardHeader className="p-8 pb-3">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                         <div className="flex items-center gap-2">
                              <div className="flex bg-muted/30 p-1.5 rounded-2xl border border-border/50">
                                 {ROLE_OPTIONS.map((opt) => (
                                     <button
                                         key={opt.value}
                                         onClick={() => setRoleFilter(opt.value)}
                                         className={cn(
                                             "px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                                             roleFilter === opt.value 
                                                 ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" 
                                                 : "text-muted-foreground/60 hover:text-foreground hover:bg-muted/50"
                                         )}
                                     >
                                         {opt.label}
                                     </button>
                                 ))}
                              </div>
                         </div>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input 
                                placeholder="Tìm kiếm..." 
                                value={search} 
                                onChange={(e) => setSearch(e.target.value)} 
                                className="pl-11 pr-4 h-11 w-80 bg-muted/30 border-border/50 rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium" 
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8 pt-5">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-80 gap-4">
                            <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                            <p className="font-bold text-muted-foreground">Đang tải dữ liệu...</p>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-border/50 bg-muted/30">
                                        <TableHead className="h-14 font-black text-muted-foreground uppercase text-[10px] tracking-widest pl-8">Người dùng</TableHead>
                                        <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-widest text-center">Vai trò</TableHead>
                                        <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-widest text-center">Thống kê</TableHead>
                                        <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-widest text-center">Trạng thái</TableHead>
                                        <TableHead className="font-black text-muted-foreground uppercase text-[10px] tracking-widest text-right pr-8">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-20 font-bold">Không có người dùng nào được tìm thấy</TableCell></TableRow>
                                    ) : filtered.map((user) => (
                                        <TableRow key={user.id} className="hover:bg-muted/10 border-border/40 transition-colors h-24 group">
                                            <TableCell className="pl-8">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="h-12 w-12 border-none shadow-xl dark:shadow-none ring-1 ring-border/50 group-hover:ring-primary/30 transition-all">
                                                        <AvatarImage src={user.avatarUrl} alt={user.fullName} />
                                                        <AvatarFallback className="bg-muted text-primary text-[10px] font-black">
                                                            {user.username.substring(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-foreground leading-tight">{user.fullName}</span>
                                                        <span className="text-[10px] font-black text-muted-foreground/30 mt-1 uppercase tracking-tight truncate max-w-[200px]">@{user.username} · {user.email}</span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex justify-center gap-1.5 flex-wrap">
                                                    {user.roles.map((r) => <div key={r}>{getRoleBadge(r)}</div>)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <div className="flex items-center gap-1.5 font-black text-sm text-foreground">
                                                        <Coins className="h-4 w-4 text-amber-500" /> {user.coins?.toLocaleString() ?? 0}
                                                    </div>
                                                    <div className="flex items-center gap-1.5 font-bold text-xs text-orange-500">
                                                        <Flame className="h-3.5 w-3.5" /> {user.streakDays ?? 0}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                 <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-muted/30 border border-border/50">
                                                    <div className={cn("h-1.5 w-1.5 rounded-full", user.isActive !== false ? 'bg-emerald-500 animate-pulse' : 'bg-muted-foreground/30')} />
                                                    <span className={user.isActive !== false ? 'text-emerald-500' : 'text-muted-foreground/30'}>
                                                        {user.isActive !== false ? 'Hoạt động' : 'Bị khóa'}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-8">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all" onClick={() => { setDetailUser(user); setDetailOpen(true) }}>
                                                        <Eye className="h-4.5 w-4.5" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-blue-500/10 text-muted-foreground hover:text-blue-500 transition-all" onClick={() => { setSelectedUser(user); setCoinsDialogOpen(true) }}>
                                                        <Edit className="h-4.5 w-4.5" />
                                                    </Button>
                                                    {canDeleteUser && (
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all" onClick={() => handleDeleteUser(user.id, user.username)}>
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

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-8 px-2">
                        <p className="text-xs font-black text-muted-foreground/30 uppercase tracking-widest">
                            Hiển thị {page * 10 + 1}-{Math.min((page + 1) * 10, totalElements)} / {totalElements}
                        </p>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border/50 text-muted-foreground/40 bg-background hover:bg-muted" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button className="h-10 w-10 rounded-xl font-black bg-primary shadow-lg shadow-primary/20">{page+1}</Button>
                            {page + 1 < totalPages && <Button variant="ghost" className="h-10 w-10 rounded-xl font-black text-muted-foreground/40 hover:bg-muted" onClick={() => setPage(page + 1)}>{page + 2}</Button>}
                            {page + 2 < totalPages && <Button variant="ghost" className="h-10 w-10 rounded-xl font-bold text-muted-foreground" onClick={() => setPage(page + 2)}>{page + 3}</Button>}
                            {totalPages > 4 && <span className="px-1 text-muted-foreground/30">...</span>}
                            {totalPages > 1 && page < totalPages - 3 && <Button variant="ghost" className="h-10 w-10 rounded-xl font-bold text-muted-foreground" onClick={() => setPage(totalPages - 1)}>{totalPages}</Button>}
                            <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-border text-muted-foreground" onClick={() => setPage(page + 1)} disabled={page >= totalPages - 1}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Create User Dialog */}
            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Tạo người dùng mới</DialogTitle>
                        <DialogDescription>Nhập thông tin chi tiết cho người dùng mới trong hệ thống.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="fullName" className="font-bold">Họ và tên</Label>
                            <Input id="fullName" value={newUser.fullName} onChange={(e) => setNewUser({...newUser, fullName: e.target.value})} className="rounded-xl h-11" placeholder="VD: Nguyễn Văn A" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="username" className="font-bold">Username</Label>
                            <Input id="username" value={newUser.username} onChange={(e) => setNewUser({...newUser, username: e.target.value})} className="rounded-xl h-11" placeholder="VD: langmaster01" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email" className="font-bold">Email</Label>
                            <Input id="email" type="email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} className="rounded-xl h-11" placeholder="VD: user@example.com" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password" className="font-bold">Mật khẩu</Label>
                            <div className="relative">
                                <Input id="password" type={showPassword ? "text" : "password"} value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} className="rounded-xl h-11 pr-10" placeholder="••••••••" />
                                <Button size="sm" variant="ghost" className="absolute right-0 top-0 h-full px-3 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>
                    <div className="grid gap-2">
                        <Label className="font-bold">Vai trò</Label>
                        <div className="flex flex-wrap gap-2 pt-1">
                            {ROLE_OPTIONS.filter(o => o.value).map(opt => (
                                <Button key={opt.value} variant={newUser.roles.includes(opt.value) ? 'default' : 'outline'} className="rounded-xl h-10 px-4" onClick={() => toggleRole(opt.value)}>
                                    {opt.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={() => setCreateDialogOpen(false)} className="rounded-xl h-11 px-6 font-bold">Hủy</Button>
                    <Button onClick={handleCreateUser} className="rounded-xl h-11 px-8 font-bold">Xác nhận tạo</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* User Detail Dialog */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
            <DialogContent className="sm:max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Chi tiết người dùng</DialogTitle>
                </DialogHeader>
                {detailUser && (
                    <div className="space-y-6 py-2">
                        <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-2xl border border-border">
                            <Avatar className="h-16 w-16 border-2 border-background shadow-md">
                                <AvatarImage src={detailUser.avatarUrl} />
                                <AvatarFallback>{detailUser.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <h3 className="font-black text-foreground text-lg">{detailUser.fullName}</h3>
                                <p className="text-sm font-bold text-muted-foreground">@{detailUser.username}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">Email</p>
                                <p className="text-sm font-bold text-foreground truncate">{detailUser.email}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">Trạng thái</p>
                                <p className="text-sm font-bold text-emerald-600">Đang hoạt động</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">Tổng xu</p>
                                <p className="text-sm font-bold text-amber-600 flex items-center gap-1"><Coins className="h-4 w-4" /> {detailUser.coins ?? 0}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">Chuỗi streak</p>
                                <p className="text-sm font-bold text-orange-500 flex items-center gap-1"><Flame className="h-4 w-4" /> {detailUser.streakDays ?? 0} ngày</p>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">Vai trò hệ thống</p>
                            <div className="flex gap-2 mt-2">
                                {detailUser.roles.map(r => getRoleBadge(r))}
                            </div>
                        </div>
                    </div>
                )}
                <DialogFooter>
                    <Button onClick={() => setDetailOpen(false)} variant="outline" className="w-full h-11 rounded-xl font-bold">Đóng</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Add Coins Dialog */}
        <Dialog open={coinsDialogOpen} onOpenChange={setCoinsDialogOpen}>
            <DialogContent className="sm:max-w-[400px] rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Thêm xu cho người dùng</DialogTitle>
                    <DialogDescription>Cộng xu trực tiếp cho {selectedUser?.fullName}</DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="amount" className="font-bold mb-2 block text-sm">Số lượng xu cần thêm</Label>
                    <Input id="amount" type="number" value={coinsAmount} onChange={(e) => setCoinsAmount(e.target.value)} placeholder="Nhập số xu..." className="rounded-xl h-11" />
                </div>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="ghost" onClick={() => setCoinsDialogOpen(false)} className="rounded-xl h-11 font-bold">Hủy</Button>
                    <Button onClick={handleAddCoins} className="rounded-xl h-11 px-8 font-bold bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-100">Xác nhận</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    </div>
)
}
