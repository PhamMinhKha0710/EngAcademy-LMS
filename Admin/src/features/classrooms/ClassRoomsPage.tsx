import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { GraduationCap, Plus, Search, Edit, Trash2, Loader2 } from 'lucide-react'
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

            let url = '/classes'
            if (me.roles.includes('ROLE_SCHOOL') && me.schoolId) {
                url = `/classes/school/${me.schoolId}`
            }

            const r = await api.get<ApiResponse<any>>(url) // Type 'any' because it might be Page or List

            // Handle pagination or list response
            const data = r.data.data
            if (Array.isArray(data)) {
                setRooms(data)
            } else if (data.content) {
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

    const filtered = rooms.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        (r.schoolName && r.schoolName.toLowerCase().includes(search.toLowerCase())) ||
        (r.teacherName && r.teacherName.toLowerCase().includes(search.toLowerCase()))
    )

    const selectClassName =
        'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý lớp học</h1>
                    <p className="text-muted-foreground mt-1">Quản lý các lớp học của trường</p>
                </div>
                <Button onClick={() => { resetForm(); setDialogOpen(true) }} className="gap-2 rounded-xl shadow-sm">
                    <Plus className="h-4 w-4" /> Thêm lớp
                </Button>
            </div>

            {/* Stat cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow">
                        <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Tổng lớp học</p>
                        <p className="text-2xl font-bold">{rooms.length}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow">
                        <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Đang hoạt động</p>
                        <p className="text-2xl font-bold text-emerald-600">{rooms.filter(r => r.isActive).length}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-sm">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow">
                        <GraduationCap className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Tổng học sinh</p>
                        <p className="text-2xl font-bold text-violet-600">{rooms.reduce((sum, r) => sum + (r.studentCount ?? 0), 0)}</p>
                    </div>
                </div>
            </div>

            <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <GraduationCap className="h-5 w-5 text-primary" />
                            Danh sách lớp học
                        </CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Tìm theo tên lớp, trường, giáo viên..."
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
                            <p className="font-medium">Không tìm thấy lớp học nào</p>
                            <p className="text-sm mt-1 text-muted-foreground/70">{search ? 'Thử thay đổi từ khóa' : 'Chưa có lớp học nào'}</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">ID</TableHead>
                                    <TableHead>Tên lớp</TableHead>
                                    <TableHead>Trường</TableHead>
                                    <TableHead>Giáo viên</TableHead>
                                    <TableHead>Năm học</TableHead>
                                    <TableHead>Sĩ số</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((r) => (
                                    <TableRow key={r.id}>
                                        <TableCell className="font-medium">{r.id}</TableCell>
                                        <TableCell className="font-semibold">{r.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{r.schoolName || '—'}</TableCell>
                                        <TableCell>{r.teacherName || '—'}</TableCell>
                                        <TableCell className="text-muted-foreground">{r.academicYear || '—'}</TableCell>
                                        <TableCell>
                                            <Button variant="link" className="p-0 h-auto font-normal" onClick={() => openStudentList(r)}>
                                                {r.studentCount ?? 0} học sinh
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={r.isActive ? 'default' : 'secondary'}>
                                                {r.isActive ? 'Hoạt động' : 'Tạm dừng'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => openEdit(r)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                {isAdmin && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive"
                                                        onClick={() => {
                                                            setDeleting(r)
                                                            setDeleteOpen(true)
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Create/Edit Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Chỉnh sửa lớp học' : 'Thêm lớp học mới'}</DialogTitle>
                        <DialogDescription>Điền thông tin lớp học bên dưới</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Tên lớp *</Label>
                            <Input
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="VD: 6A1"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Trường học</Label>
                                <select
                                    value={form.schoolId ?? ''}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            schoolId: e.target.value ? Number(e.target.value) : undefined,
                                        })
                                    }
                                    className={selectClassName}
                                >
                                    <option value="">-- Chọn trường --</option>
                                    {schools.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Giáo viên</Label>
                                <select
                                    value={form.teacherId ?? ''}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            teacherId: e.target.value ? Number(e.target.value) : undefined,
                                        })
                                    }
                                    className={selectClassName}
                                >
                                    <option value="">-- Chọn giáo viên --</option>
                                    {teachers.map((t) => (
                                        <option key={t.id} value={t.id}>
                                            {t.fullName || t.username}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Năm học</Label>
                                <Input
                                    value={form.academicYear || ''}
                                    onChange={(e) => setForm({ ...form, academicYear: e.target.value })}
                                    placeholder="VD: 2025-2026"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Trạng thái</Label>
                                <select
                                    value={form.isActive ? 'true' : 'false'}
                                    onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })}
                                    className={selectClassName}
                                >
                                    <option value="true">Hoạt động</option>
                                    <option value="false">Tạm dừng</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={resetForm} disabled={submitting}>
                            Hủy
                        </Button>
                        <Button onClick={handleSubmit} disabled={submitting}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {editing ? 'Cập nhật' : 'Tạo mới'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc muốn xóa lớp &quot;{deleting?.name}&quot;? Hành động này không thể hoàn tác.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={submitting}>
                            Hủy
                        </Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
                            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Xóa
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Student List Dialog */}
            <Dialog open={!!viewingStudents} onOpenChange={(open) => !open && setViewingStudents(null)}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle>Học sinh lớp {viewingStudents?.name}</DialogTitle>
                                <DialogDescription>Danh sách học sinh trong lớp</DialogDescription>
                            </div>
                            <Button size="sm" onClick={() => setAddingStudentOpen(true)}>
                                <Plus className="h-4 w-4 mr-1" /> Thêm học sinh
                            </Button>
                        </div>
                    </DialogHeader>
                    <div className="max-h-[60vh] overflow-y-auto">
                        {loadingStudents ? (
                            <div className="flex justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : classStudents.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">Lớp chưa có học sinh nào</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>Username</TableHead>
                                        <TableHead>Họ tên</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {classStudents.map((s) => (
                                        <TableRow key={s.id}>
                                            <TableCell>{s.id}</TableCell>
                                            <TableCell>{s.username}</TableCell>
                                            <TableCell className="font-medium">{s.fullName}</TableCell>
                                            <TableCell>{s.email}</TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive"
                                                    onClick={() => handleRemoveStudent(s.id)}
                                                    title="Xóa khỏi lớp"
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
                </DialogContent>
            </Dialog>

            {/* Add Student Search Dialog */}
            <Dialog open={addingStudentOpen} onOpenChange={setAddingStudentOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Thêm học sinh vào lớp {viewingStudents?.name}</DialogTitle>
                        <DialogDescription>Tìm kiếm học sinh theo tên, email hoặc username</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Nhập tên, email hoặc username..."
                                value={searchStudent}
                                onChange={(e) => setSearchStudent(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchStudents()}
                            />
                            <Button onClick={() => handleSearchStudents()} disabled={searchingStudent}>
                                {searchingStudent ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            </Button>
                        </div>

                        <div className="max-h-[300px] overflow-y-auto border rounded-md">
                            {searchingStudent ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : searchResult.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">
                                    {searchStudent ? 'Không tìm thấy học sinh nào' : 'Nhập từ khóa để tìm kiếm'}
                                </p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Họ tên</TableHead>
                                            <TableHead>Email</TableHead>
                                            <TableHead className="text-right">Hành động</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {searchResult.map((u) => {
                                            const isAlreadyInClass = classStudents.some(cs => cs.id === u.id);
                                            return (
                                                <TableRow key={u.id}>
                                                    <TableCell className="font-medium">
                                                        <div>{u.fullName}</div>
                                                        <div className="text-xs text-muted-foreground">{u.username}</div>
                                                    </TableCell>
                                                    <TableCell>{u.email}</TableCell>
                                                    <TableCell className="text-right">
                                                        {isAlreadyInClass ? (
                                                            <Badge variant="secondary">Đã trong lớp</Badge>
                                                        ) : (
                                                            <Button size="sm" onClick={() => handleAddStudent(u.id)}>
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
        </div>
    )
}
