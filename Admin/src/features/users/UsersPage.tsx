import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Users, Search, ChevronLeft, ChevronRight, Coins, Eye, Flame } from 'lucide-react'
import { toast } from 'sonner'
import api from '@/lib/api'
import type { ApiResponse, Page, User } from '@/types/api'

const ROLE_OPTIONS = [
    { value: '', label: 'Tất cả' },
    { value: 'ROLE_ADMIN', label: 'Admin' },
    { value: 'ROLE_SCHOOL', label: 'Trường' },
    { value: 'ROLE_TEACHER', label: 'Giáo viên' },
    { value: 'ROLE_STUDENT', label: 'Học sinh' },
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

    useEffect(() => { fetchUsers() }, [page])

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

    const getRoleBadge = (role: string) => {
        const config: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
            ROLE_ADMIN: { label: 'Admin', variant: 'destructive' },
            ROLE_SCHOOL: { label: 'Trường', variant: 'default' },
            ROLE_TEACHER: { label: 'Giáo viên', variant: 'secondary' },
            ROLE_STUDENT: { label: 'Học sinh', variant: 'outline' },
        }
        const c = config[role] || { label: role, variant: 'outline' as const }
        return <Badge variant={c.variant}>{c.label}</Badge>
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý người dùng</h1>
                    <p className="text-muted-foreground mt-1">Tổng cộng {totalElements} người dùng</p>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Danh sách người dùng
                        </CardTitle>
                        <div className="flex items-center gap-3">
                            {/* Role filter */}
                            <select
                                className="flex h-9 rounded-md border border-input bg-background px-3 text-sm"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                {ROLE_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            {/* Search */}
                            <div className="relative w-64">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input placeholder="Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-12">ID</TableHead>
                                        <TableHead>Username</TableHead>
                                        <TableHead>Họ tên</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Vai trò</TableHead>
                                        <TableHead className="text-center">Xu</TableHead>
                                        <TableHead className="text-center">Streak</TableHead>
                                        <TableHead>Trạng thái</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.length === 0 ? (
                                        <TableRow><TableCell colSpan={9} className="text-center text-muted-foreground py-8">Không có người dùng</TableCell></TableRow>
                                    ) : filtered.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.id}</TableCell>
                                            <TableCell className="font-medium">{user.username}</TableCell>
                                            <TableCell>{user.fullName}</TableCell>
                                            <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-1 flex-wrap">{user.roles.map((r) => <span key={r}>{getRoleBadge(r)}</span>)}</div>
                                            </TableCell>
                                            <TableCell className="text-center font-medium text-amber-600">{user.coins ?? 0}</TableCell>
                                            <TableCell className="text-center">
                                                <span className="flex items-center justify-center gap-1 text-orange-500">
                                                    <Flame className="h-3.5 w-3.5" /> {user.streakDays ?? 0}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={user.isActive !== false ? 'default' : 'secondary'}>
                                                    {user.isActive !== false ? 'Hoạt động' : 'Bị khóa'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Xem chi tiết" onClick={() => { setDetailUser(user); setDetailOpen(true) }}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" title="Thêm xu" onClick={() => { setSelectedUser(user); setCoinsDialogOpen(true) }}>
                                                        <Coins className="h-4 w-4 text-amber-500" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-sm text-muted-foreground">
                                    Trang {page + 1} / {Math.max(totalPages, 1)}
                                </p>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page >= totalPages - 1}>
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* User Detail Dialog */}
            <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Chi tiết người dùng</DialogTitle>
                        <DialogDescription>Thông tin đầy đủ của {detailUser?.fullName}</DialogDescription>
                    </DialogHeader>
                    {detailUser && (
                        <div className="space-y-3 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-muted-foreground text-xs">ID</Label>
                                    <p className="font-medium">{detailUser.id}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-xs">Username</Label>
                                    <p className="font-medium">{detailUser.username}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-xs">Họ tên</Label>
                                    <p className="font-medium">{detailUser.fullName}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-xs">Email</Label>
                                    <p className="font-medium">{detailUser.email}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-xs">Vai trò</Label>
                                    <div className="flex gap-1 mt-1">{detailUser.roles.map((r) => <span key={r}>{getRoleBadge(r)}</span>)}</div>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-xs">Trạng thái</Label>
                                    <p>
                                        <Badge variant={detailUser.isActive !== false ? 'default' : 'secondary'}>
                                            {detailUser.isActive !== false ? 'Hoạt động' : 'Bị khóa'}
                                        </Badge>
                                    </p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-xs">Xu</Label>
                                    <p className="font-bold text-amber-600">{detailUser.coins ?? 0}</p>
                                </div>
                                <div>
                                    <Label className="text-muted-foreground text-xs">Chuỗi ngày</Label>
                                    <p className="font-bold text-orange-500 flex items-center gap-1"><Flame className="h-4 w-4" />{detailUser.streakDays ?? 0} ngày</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDetailOpen(false)}>Đóng</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Coins Dialog */}
            <Dialog open={coinsDialogOpen} onOpenChange={setCoinsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Thêm xu cho {selectedUser?.fullName}</DialogTitle>
                        <DialogDescription>Nhập số xu muốn thêm cho người dùng</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="coins">Số xu</Label>
                            <Input id="coins" type="number" placeholder="Nhập số xu" value={coinsAmount} onChange={(e) => setCoinsAmount(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCoinsDialogOpen(false)}>Hủy</Button>
                        <Button onClick={handleAddCoins}>Thêm xu</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
