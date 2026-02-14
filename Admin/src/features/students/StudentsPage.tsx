import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Users, Search, Trash2 } from 'lucide-react'
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý học sinh</h1>
                    <p className="text-muted-foreground mt-1">Tổng cộng {students.length} học sinh</p>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" /> Danh sách học sinh
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
                            <Users className="h-10 w-10 mb-2" />
                            <p>Không tìm thấy học sinh nào</p>
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
                                {filtered.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-medium">{student.id}</TableCell>
                                        <TableCell>{student.username}</TableCell>
                                        <TableCell>{student.fullName || '-'}</TableCell>
                                        <TableCell className="text-muted-foreground">{student.email || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">Học sinh</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDelete(student)}
                                                disabled={deleting === student.id}
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
