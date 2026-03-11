import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Users, Search, Trash2, UserCheck, UserX, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { toast } from 'sonner'
import type { ApiResponse, User } from '@/types/api'

export default function StudentsPage() {
    const [students, setStudents] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [deleting, setDeleting] = useState<number | null>(null)

    const fetchStudents = async () => {
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

            // Filter only students
            const studentUsers = allUsers.filter(user =>
                user.roles && user.roles.includes('ROLE_STUDENT')
            )
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

    const filtered = students.filter((s) =>
        s.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        s.username.toLowerCase().includes(search.toLowerCase()) ||
        s.email?.toLowerCase().includes(search.toLowerCase())
    )

    const activeCount = students.filter(s => s.isActive !== false).length
    const inactiveCount = students.length - activeCount

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Quản lý học sinh</h1>
                <p className="text-muted-foreground mt-1">Quản lý danh sách học sinh của trường</p>
            </div>

            {/* Stat cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow">
                        <Users className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Tổng học sinh</p>
                        <p className="text-2xl font-bold">{students.length}</p>
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
                            <Users className="h-5 w-5 text-primary" /> Danh sách học sinh
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
                                <Users className="h-8 w-8 opacity-40" />
                            </div>
                            <p className="font-medium">Không tìm thấy học sinh nào</p>
                            <p className="text-sm mt-1 text-muted-foreground/70">
                                {search ? 'Thử thay đổi từ khóa tìm kiếm' : 'Chưa có học sinh được liên kết với trường'}
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
                                    {filtered.map((student) => (
                                        <TableRow key={student.id} className="group hover:bg-muted/30 transition-colors">
                                            <TableCell className="font-mono text-sm text-muted-foreground">{student.id}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white text-xs font-bold shadow-sm">
                                                        {(student.fullName || student.username).charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-medium">{student.username}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{student.fullName || '-'}</TableCell>
                                            <TableCell className="text-muted-foreground text-sm">{student.email || '-'}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={student.isActive !== false ? 'default' : 'destructive'}
                                                    className={student.isActive !== false
                                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100'
                                                        : ''
                                                    }
                                                >
                                                    {student.isActive !== false ? 'Hoạt động' : 'Đã khóa'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(student)}
                                                    disabled={deleting === student.id}
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    {deleting === student.id ? (
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
