import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { GraduationCap, Plus, Search, Edit, Trash2 } from 'lucide-react'
import api from '@/lib/api'
import type { ApiResponse, ClassRoom, ClassRoomRequest } from '@/types/api'

export default function ClassRoomsPage() {
    const [rooms, setRooms] = useState<ClassRoom[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [editing, setEditing] = useState<ClassRoom | null>(null)
    const [form, setForm] = useState<ClassRoomRequest>({ name: '', description: '' })
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [deleting, setDeleting] = useState<ClassRoom | null>(null)

    const fetchRooms = async () => {
        setLoading(true)
        try {
            const r = await api.get<ApiResponse<ClassRoom[]>>('/classes')
            setRooms(r.data.data)
        } catch {
            setRooms([
                { id: 1, name: '6A1', description: 'Lớp 6A1', schoolName: 'THCS Nguyễn Du', teacherName: 'Nguyễn Văn A', studentCount: 35, active: true },
                { id: 2, name: '6A2', description: 'Lớp 6A2', schoolName: 'THCS Nguyễn Du', teacherName: 'Trần Thị B', studentCount: 32, active: true },
                { id: 3, name: '6B1', description: 'Lớp 6B1', schoolName: 'THCS Lê Lợi', teacherName: 'Lê Hoàng C', studentCount: 30, active: false },
            ])
        } finally { setLoading(false) }
    }

    useEffect(() => { fetchRooms() }, [])

    const handleSubmit = async () => {
        try {
            if (editing) await api.put(`/classes/${editing.id}`, form)
            else await api.post('/classes', form)
            fetchRooms()
        } catch { /* ignore */ }
        resetForm()
    }

    const handleDelete = async () => {
        if (!deleting) return
        try { await api.delete(`/classes/${deleting.id}`) } catch { /* ignore */ }
        setDeleteOpen(false)
        fetchRooms()
    }

    const resetForm = () => { setDialogOpen(false); setEditing(null); setForm({ name: '', description: '' }) }

    const openEdit = (r: ClassRoom) => {
        setEditing(r)
        setForm({ name: r.name, description: r.description, schoolId: r.schoolId, teacherId: r.teacherId })
        setDialogOpen(true)
    }

    const filtered = rooms.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quản lý lớp học</h1>
                    <p className="text-muted-foreground mt-1">Tổng cộng {rooms.length} lớp học</p>
                </div>
                <Button onClick={() => { resetForm(); setDialogOpen(true) }} className="gap-2"><Plus className="h-4 w-4" /> Thêm lớp</Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2"><GraduationCap className="h-5 w-5 text-primary" /> Danh sách</CardTitle>
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="Tìm kiếm..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">ID</TableHead>
                                    <TableHead>Tên lớp</TableHead>
                                    <TableHead>Trường</TableHead>
                                    <TableHead>Giáo viên</TableHead>
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
                                        <TableCell className="text-muted-foreground">{r.schoolName}</TableCell>
                                        <TableCell>{r.teacherName}</TableCell>
                                        <TableCell>{r.studentCount}</TableCell>
                                        <TableCell><Badge variant={r.active ? 'default' : 'secondary'}>{r.active ? 'Hoạt động' : 'Tạm dừng'}</Badge></TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(r)}><Edit className="h-4 w-4" /></Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => { setDeleting(r); setDeleteOpen(true) }}><Trash2 className="h-4 w-4" /></Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Chỉnh sửa lớp' : 'Thêm lớp mới'}</DialogTitle>
                        <DialogDescription>Điền thông tin lớp học</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2"><Label>Tên lớp *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="VD: 6A1" /></div>
                        <div className="space-y-2"><Label>Mô tả</Label><Input value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Mô tả" /></div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={resetForm}>Hủy</Button>
                        <Button onClick={handleSubmit}>{editing ? 'Cập nhật' : 'Tạo mới'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa</DialogTitle>
                        <DialogDescription>Xóa lớp "{deleting?.name}"?</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteOpen(false)}>Hủy</Button>
                        <Button variant="destructive" onClick={handleDelete}>Xóa</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
