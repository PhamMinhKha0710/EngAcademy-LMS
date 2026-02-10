import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { School, Plus, Search, Edit, Trash2 } from 'lucide-react'
import api from '@/lib/api'
import type { ApiResponse, School as SchoolType, SchoolRequest } from '@/types/api'

export default function SchoolsPage() {
    const [schools, setSchools] = useState<SchoolType[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingSchool, setEditingSchool] = useState<SchoolType | null>(null)
    const [form, setForm] = useState<SchoolRequest>({ name: '', address: '', phone: '', email: '', principalName: '' })
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deletingSchool, setDeletingSchool] = useState<SchoolType | null>(null)

    const fetchSchools = async () => {
        setLoading(true)
        try {
            const response = await api.get<ApiResponse<SchoolType[]>>('/schools')
            setSchools(response.data.data)
        } catch {
            setSchools([
                { id: 1, name: 'THCS Nguyễn Du', address: '123 Nguyễn Du, Q.1', phone: '028-1234567', email: 'nguyendu@edu.vn', principalName: 'Trần Văn Minh', active: true },
                { id: 2, name: 'THCS Lê Lợi', address: '456 Lê Lợi, Q.3', phone: '028-7654321', email: 'leloi@edu.vn', principalName: 'Nguyễn Thị Hoa', active: true },
                { id: 3, name: 'THCS Trần Phú', address: '789 Trần Phú, Q.5', phone: '028-1112233', email: 'tranphu@edu.vn', principalName: 'Lê Hoàng Nam', active: false },
            ])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchSchools() }, [])

    const handleSubmit = async () => {
        try {
            if (editingSchool) {
                await api.put(`/schools/${editingSchool.id}`, form)
            } else {
                await api.post('/schools', form)
            }
            fetchSchools()
        } catch { /* ignore */ }
        resetForm()
    }

    const handleDelete = async () => {
        if (!deletingSchool) return
        try { await api.delete(`/schools/${deletingSchool.id}`) } catch { /* ignore */ }
        setDeleteDialogOpen(false)
        setDeletingSchool(null)
        fetchSchools()
    }

    const resetForm = () => {
        setDialogOpen(false)
        setEditingSchool(null)
        setForm({ name: '', address: '', phone: '', email: '', principalName: '' })
    }

    const openEdit = (school: SchoolType) => {
        setEditingSchool(school)
        setForm({ name: school.name, address: school.address, phone: school.phone, email: school.email, principalName: school.principalName })
        setDialogOpen(true)
    }

    const filtered = schools.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý trường học</h1>
                    <p className="text-muted-foreground mt-1">Tổng cộng {schools.length} trường học</p>
                </div>
                <Button onClick={() => { resetForm(); setDialogOpen(true) }} className="gap-2">
                    <Plus className="h-4 w-4" /> Thêm trường
                </Button>
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
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">ID</TableHead>
                                    <TableHead>Tên trường</TableHead>
                                    <TableHead>Địa chỉ</TableHead>
                                    <TableHead>Hiệu trưởng</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead className="text-right">Thao tác</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filtered.map((school) => (
                                    <TableRow key={school.id}>
                                        <TableCell className="font-medium">{school.id}</TableCell>
                                        <TableCell className="font-medium">{school.name}</TableCell>
                                        <TableCell className="text-muted-foreground">{school.address}</TableCell>
                                        <TableCell>{school.principalName}</TableCell>
                                        <TableCell className="text-muted-foreground">{school.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={school.active ? 'default' : 'secondary'}>
                                                {school.active ? 'Hoạt động' : 'Tạm dừng'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(school)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setDeletingSchool(school); setDeleteDialogOpen(true) }}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
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
                        <DialogDescription>Điền thông tin trường học</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Tên trường *</Label>
                            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VD: THCS Nguyễn Du" />
                        </div>
                        <div className="space-y-2">
                            <Label>Địa chỉ</Label>
                            <Input value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Địa chỉ trường" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Số điện thoại</Label>
                                <Input value={form.phone || ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="SĐT" />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Hiệu trưởng</Label>
                            <Input value={form.principalName || ''} onChange={(e) => setForm({ ...form, principalName: e.target.value })} placeholder="Tên hiệu trưởng" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={resetForm}>Hủy</Button>
                        <Button onClick={handleSubmit}>{editingSchool ? 'Cập nhật' : 'Tạo mới'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc muốn xóa trường "{deletingSchool?.name}"? Hành động này không thể hoàn tác.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
                        <Button variant="destructive" onClick={handleDelete}>Xóa</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
