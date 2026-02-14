import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { GraduationCap, Search, Trash2 } from 'lucide-react'
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý giáo viên</h1>
                    <p className="text-muted-foreground mt-1">Tổng cộng {teachers.length} giáo viên</p>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-primary" /> Danh sách giáo viên
                        </CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                            <GraduationCap className="h-10 w-10 mb-2" />
                            <p>Không tìm thấy giáo viên nào</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">ID</TableHead>
                                    <TableHead>Tên đăng nhập</TableHead>
                                    <TableHead>Họ tên</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead className="w-20">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((teacher) => (
                                    <TableRow key={teacher.id}>
                                        <TableCell className="font-medium">{teacher.id}</TableCell>
                                        <TableCell>{teacher.username}</TableCell>
                                        <TableCell>{teacher.fullName || '-'}</TableCell>
                                        <TableCell className="text-muted-foreground">{teacher.email || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant="default">Giáo viên</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(teacher)}
                                                disabled={deleting === teacher.id}
                                                className="h-8 w-8 text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
