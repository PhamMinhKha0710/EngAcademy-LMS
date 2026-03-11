import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { GraduationCap, Search, Trash2, UserCheck, UserX, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { toast } from 'sonner'
import type { ApiResponse, User } from '@/types/api'

export default function TeachersPage() {
    const [teachers, setTeachers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [deleting, setDeleting] = useState<number | null>(null)

    const fetchTeachers = async () => {
        setLoading(true)
        try {
            const response = await api.get<ApiResponse<any>>('/users')
            const data = response.data.data

            // Handle both array and paginated response
            let allUsers: User[] = []
            if (Array.isArray(data)) {
                allUsers = data
            } else if (data && 'content' in data) {
                allUsers = data.content
            }

            // Filter only teachers
            const teacherUsers = allUsers.filter(user =>
                user.roles && user.roles.includes('ROLE_TEACHER')
            )
            setTeachers(teacherUsers)
        } catch (error) {
            console.error('Failed to fetch teachers:', error)
            toast.error('Không thể tải danh sách giáo viên')
            setTeachers([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTeachers()
    }, [])

    const handleDelete = async (teacher: User) => {
        if (!confirm(`Bạn có chắc muốn xóa giáo viên "${teacher.fullName || teacher.username}"?`)) {
            return
        }

        setDeleting(teacher.id)
        try {
            await api.delete(`/users/${teacher.id}`)
            toast.success('Xóa giáo viên thành công')
            fetchTeachers()
        } catch {
            toast.error('Xóa giáo viên thất bại')
        } finally {
            setDeleting(null)
        }
    }

    const filtered = teachers.filter((t) =>
        t.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        t.username.toLowerCase().includes(search.toLowerCase()) ||
        t.email?.toLowerCase().includes(search.toLowerCase())
    )

    const activeCount = teachers.filter(t => t.isActive !== false).length
    const inactiveCount = teachers.length - activeCount

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Quản lý giáo viên</h1>
                <p className="text-muted-foreground mt-1">Quản lý đội ngũ giáo viên của trường</p>
            </div>

            {/* Stat cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow">
                        <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Tổng giáo viên</p>
                        <p className="text-2xl font-bold">{teachers.length}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow">
                        <UserCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Đang hoạt động</p>
                        <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow">
                        <UserX className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Ngừng hoạt động</p>
                        <p className="text-2xl font-bold text-rose-600">{inactiveCount}</p>
                    </div>
                </div>
            </div>

            {/* Main table */}
            <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <GraduationCap className="h-5 w-5 text-primary" /> Danh sách giáo viên
                        </CardTitle>
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Tìm theo tên, username, email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 rounded-xl"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                            <p className="text-sm">Đang tải dữ liệu...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 mb-4">
                                <GraduationCap className="h-8 w-8 opacity-40" />
                            </div>
                            <p className="font-medium">Không tìm thấy giáo viên nào</p>
                            <p className="text-sm mt-1 text-muted-foreground/70">
                                {search ? 'Thử thay đổi từ khóa tìm kiếm' : 'Chưa có giáo viên được liên kết với trường'}
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-xl border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                                        <TableHead className="w-12 font-semibold">ID</TableHead>
                                        <TableHead className="font-semibold">Tên đăng nhập</TableHead>
                                        <TableHead className="font-semibold">Họ tên</TableHead>
                                        <TableHead className="font-semibold">Email</TableHead>
                                        <TableHead className="font-semibold">Trạng thái</TableHead>
                                        <TableHead className="w-20 font-semibold text-center">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.map((teacher) => (
                                        <TableRow key={teacher.id} className="group hover:bg-muted/30 transition-colors">
                                            <TableCell className="font-mono text-sm text-muted-foreground">{teacher.id}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-xs font-bold shadow-sm">
                                                        {(teacher.fullName || teacher.username).charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-medium">{teacher.username}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{teacher.fullName || '-'}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{teacher.email || '-'}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={teacher.isActive !== false ? 'default' : 'destructive'}
                                                    className={teacher.isActive !== false
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100'
                                                        : ''
                                                    }
                                                >
                                                    {teacher.isActive !== false ? 'Hoạt động' : 'Đã khóa'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(teacher)}
                                                    disabled={deleting === teacher.id}
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    {deleting === teacher.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
