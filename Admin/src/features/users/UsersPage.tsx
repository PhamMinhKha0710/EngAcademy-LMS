import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Users, Search, ChevronLeft, ChevronRight, Edit, Coins } from 'lucide-react'
import api from '@/lib/api'
import type { ApiResponse, Page, User } from '@/types/api'

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(0)
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const [coinsDialogOpen, setCoinsDialogOpen] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [coinsAmount, setCoinsAmount] = useState('')

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const response = await api.get<ApiResponse<Page<User>>>(`/users?page=${page}&size=10&sort=id,asc`)
            setUsers(response.data.data.content)
            setTotalPages(response.data.data.totalPages)
            setTotalElements(response.data.data.totalElements)
        } catch {
            // Use mock data for development
            setUsers([
                { id: 1, username: 'admin', email: 'admin@example.com', fullName: 'Administrator', roles: ['ROLE_ADMIN'], coins: 0 },
                { id: 2, username: 'teacher1', email: 'teacher1@example.com', fullName: 'Nguyễn Văn A', roles: ['ROLE_TEACHER'], coins: 100 },
                { id: 3, username: 'student1', email: 'student1@example.com', fullName: 'Trần Thị B', roles: ['ROLE_STUDENT'], coins: 250 },
                { id: 4, username: 'school1', email: 'school1@example.com', fullName: 'THCS Nguyễn Du', roles: ['ROLE_SCHOOL'], coins: 0 },
                { id: 5, username: 'student2', email: 'student2@example.com', fullName: 'Lê Văn C', roles: ['ROLE_STUDENT'], coins: 500 },
            ])
            setTotalPages(1)
            setTotalElements(5)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [page])

    const handleAddCoins = async () => {
        if (!selectedUser || !coinsAmount) return
        try {
            await api.post(`/users/${selectedUser.id}/coins?amount=${coinsAmount}`)
            fetchUsers()
        } catch { /* ignore */ }
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

    const filtered = users.filter(
        (u) =>
            u.username.toLowerCase().includes(search.toLowerCase()) ||
            u.fullName.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase())
    )

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
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Danh sách người dùng
                        </CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
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
                                        <TableHead className="text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.id}</TableCell>
                                            <TableCell className="font-medium">{user.username}</TableCell>
                                            <TableCell>{user.fullName}</TableCell>
                                            <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">{user.roles.map((r) => <span key={r}>{getRoleBadge(r)}</span>)}</div>
                                            </TableCell>
                                            <TableCell className="text-center">{user.coins ?? 0}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setSelectedUser(user); setCoinsDialogOpen(true) }}>
                                                        <Coins className="h-4 w-4 text-amber-500" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <Edit className="h-4 w-4" />
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
