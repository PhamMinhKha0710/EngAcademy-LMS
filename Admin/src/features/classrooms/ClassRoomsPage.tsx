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
                    <p className="text-muted-foreground mt-1">Tổng cộng {rooms.length} lớp học</p>
                </div>
                <Button onClick={() => { resetForm(); setDialogOpen(true) }} className="gap-2">
                    <Plus className="h-4 w-4" /> Thêm lớp
                </Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-primary" />
                            Danh sách lớp học
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
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex items-center justify-center h-40">
                            <p className="text-muted-foreground">Không tìm thấy lớp học nào</p>
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
                                        <TableCell>{r.studentCount ?? 0}</TableCell>
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
        </div>
    )
}
