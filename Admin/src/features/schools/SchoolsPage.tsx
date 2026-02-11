import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { School, Plus, Search, Edit, Trash2, Loader2 } from 'lucide-react'
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
    const [submitting, setSubmitting] = useState(false)

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
    }, [])

    const handleSubmit = async () => {
        if (!form.name.trim()) {
            toast.error('Vui lòng nhập tên trường')
            return
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
        })
        setDialogOpen(true)
    }

    const filtered = schools.filter((s) =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        (s.email && s.email.toLowerCase().includes(search.toLowerCase()))
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý trường học</h1>
                    <p className="text-muted-foreground mt-1">Tổng cộng {schools.length} trường học</p>
                </div>
                {isAdmin && (
                    <Button onClick={() => { resetForm(); setDialogOpen(true) }} className="gap-2">
                        <Plus className="h-4 w-4" /> Thêm trường
                    </Button>
                )}
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <School className="h-5 w-5 text-primary" />
                            Danh sách trường học
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
                            <p className="text-muted-foreground">Không tìm thấy trường học nào</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">ID</TableHead>
                                    <TableHead>Tên trường</TableHead>
                                    <TableHead>Địa chỉ</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>SĐT</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((school) => (
                                    <TableRow key={school.id}>
                                        <TableCell className="font-medium">{school.id}</TableCell>
                                        <TableCell className="font-medium">{school.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{school.address || '—'}</TableCell>
                                        <TableCell className="text-muted-foreground">{school.email || '—'}</TableCell>
                                        <TableCell className="text-muted-foreground">{school.phone || '—'}</TableCell>
                                        <TableCell>
                                            <Badge variant={school.isActive ? 'default' : 'secondary'}>
                                                {school.isActive ? 'Hoạt động' : 'Tạm dừng'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => openEdit(school)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                {isAdmin && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive"
                                                        onClick={() => {
                                                            setDeletingSchool(school)
                                                            setDeleteDialogOpen(true)
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
        </div>
    )
}
