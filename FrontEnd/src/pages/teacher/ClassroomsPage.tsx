import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { classroomApi, ClassRoomResponse } from '../../services/api/classroomApi'
import api from '../../services/api/axios'
import Dialog from '../../components/ui/Dialog'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import {
    School,
    ChevronDown,
    ChevronUp,
    Plus,
    Trash2,
    UserPlus,
    Users,
    Loader2,
    AlertTriangle,
    Inbox,
} from 'lucide-react'

interface StudentInfo {
    id: number
    username: string
    fullName: string
    email?: string
}

interface ApiResponse<T> {
    success: boolean
    message: string
    data: T
}

export default function ClassroomsPage() {
    const user = useAuthStore((s) => s.user)
    const [classes, setClasses] = useState<ClassRoomResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Expanded class
    const [expandedId, setExpandedId] = useState<number | null>(null)
    const [students, setStudents] = useState<StudentInfo[]>([])
    const [studentsLoading, setStudentsLoading] = useState(false)

    // Create dialog
    const [createOpen, setCreateOpen] = useState(false)
    const [createName, setCreateName] = useState('')
    const [createYear, setCreateYear] = useState('')
    const [creating, setCreating] = useState(false)

    // Add student
    const [addStudentId, setAddStudentId] = useState('')
    const [addingStudent, setAddingStudent] = useState(false)

    const fetchClasses = async () => {
        if (!user?.id) return
        setLoading(true)
        setError(null)
        try {
            const data = await classroomApi.getByTeacher(user.id)
            setClasses(data)
        } catch {
            setError('Không thể tải danh sách lớp học.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchClasses()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id])

    const fetchStudents = async (classId: number) => {
        setStudentsLoading(true)
        try {
            const res = await api.get<ApiResponse<StudentInfo[]>>(`/classes/${classId}/students`)
            setStudents(res.data.data || [])
        } catch {
            setStudents([])
        } finally {
            setStudentsLoading(false)
        }
    }

    const toggleExpand = (classId: number) => {
        if (expandedId === classId) {
            setExpandedId(null)
            setStudents([])
        } else {
            setExpandedId(classId)
            fetchStudents(classId)
        }
    }

    const handleCreate = async () => {
        if (!createName.trim() || !user?.id) return
        setCreating(true)
        try {
            await classroomApi.create({
                name: createName.trim(),
                teacherId: user.id,
                academicYear: createYear.trim() || undefined,
            })
            setCreateOpen(false)
            setCreateName('')
            setCreateYear('')
            await fetchClasses()
        } catch {
            alert('Tạo lớp thất bại. Vui lòng thử lại.')
        } finally {
            setCreating(false)
        }
    }

    const handleAddStudent = async (classId: number) => {
        const sid = parseInt(addStudentId)
        if (isNaN(sid)) return
        setAddingStudent(true)
        try {
            await classroomApi.addStudent(classId, sid)
            setAddStudentId('')
            await fetchStudents(classId)
            await fetchClasses()
        } catch {
            alert('Thêm học sinh thất bại. Kiểm tra lại mã học sinh.')
        } finally {
            setAddingStudent(false)
        }
    }

    const handleRemoveStudent = async (classId: number, studentId: number) => {
        if (!confirm('Xóa học sinh khỏi lớp?')) return
        try {
            await classroomApi.removeStudent(classId, studentId)
            await fetchStudents(classId)
            await fetchClasses()
        } catch {
            alert('Xóa học sinh thất bại.')
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-32">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
                <AlertTriangle className="w-10 h-10 text-red-400" />
                <p style={{ color: 'var(--color-text-secondary)' }}>{error}</p>
                <button
                    onClick={fetchClasses}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                    Thử lại
                </button>
            </div>
        )
    }

    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                        Quản lý lớp học
                    </h1>
                    <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                        {classes.length} lớp học
                    </p>
                </div>
                <button
                    onClick={() => setCreateOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Tạo lớp mới
                </button>
            </div>

            {/* Class list */}
            {classes.length === 0 ? (
                <EmptyState
                    icon={<Inbox className="w-8 h-8" />}
                    title="Chưa có lớp học nào"
                    description="Tạo lớp học đầu tiên để bắt đầu quản lý học sinh."
                    action={
                        <button
                            onClick={() => setCreateOpen(true)}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        >
                            Tạo lớp học
                        </button>
                    }
                />
            ) : (
                <div className="space-y-4">
                    {classes.map((cls) => (
                        <div
                            key={cls.id}
                            className="card overflow-hidden"
                        >
                            {/* Class header row */}
                            <button
                                onClick={() => toggleExpand(cls.id)}
                                className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-slate-800/20"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-xl bg-blue-500/15 flex items-center justify-center">
                                        <School className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>
                                            {cls.name}
                                        </h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            {cls.academicYear && (
                                                <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                                    {cls.academicYear}
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                                <Users className="w-3 h-3" />
                                                {cls.studentCount ?? 0} học sinh
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge variant={cls.isActive !== false ? 'success' : 'default'}>
                                        {cls.isActive !== false ? 'Hoạt động' : 'Ngừng'}
                                    </Badge>
                                    {expandedId === cls.id ? (
                                        <ChevronUp className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                                    ) : (
                                        <ChevronDown className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                                    )}
                                </div>
                            </button>

                            {/* Expanded student list */}
                            {expandedId === cls.id && (
                                <div
                                    className="border-t px-5 py-4"
                                    style={{ borderColor: 'var(--color-bg-secondary)', backgroundColor: 'var(--color-bg-secondary)' }}
                                >
                                    {/* Add student row */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <input
                                            type="number"
                                            placeholder="Mã học sinh (ID)"
                                            value={addStudentId}
                                            onChange={(e) => setAddStudentId(e.target.value)}
                                            className="flex-1 max-w-[200px] px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
                                            style={{
                                                backgroundColor: 'var(--color-bg)',
                                                borderColor: 'var(--color-bg-secondary)',
                                                color: 'var(--color-text)',
                                            }}
                                        />
                                        <button
                                            onClick={() => handleAddStudent(cls.id)}
                                            disabled={addingStudent || !addStudentId}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                        >
                                            {addingStudent ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <UserPlus className="w-4 h-4" />
                                            )}
                                            Thêm
                                        </button>
                                    </div>

                                    {studentsLoading ? (
                                        <div className="flex items-center justify-center py-8">
                                            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                                        </div>
                                    ) : students.length === 0 ? (
                                        <p className="text-sm py-4 text-center" style={{ color: 'var(--color-text-secondary)' }}>
                                            Lớp chưa có học sinh nào.
                                        </p>
                                    ) : (
                                        <div className="space-y-2">
                                            {students.map((st) => (
                                                <div
                                                    key={st.id}
                                                    className="flex items-center justify-between p-3 rounded-lg"
                                                    style={{ backgroundColor: 'var(--color-bg)' }}
                                                >
                                                    <div>
                                                        <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                                                            {st.fullName || st.username}
                                                        </p>
                                                        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                                            ID: {st.id} {st.email ? `· ${st.email}` : ''}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveStudent(cls.id, st.id)}
                                                        className="p-2 rounded-lg text-red-400 hover:bg-red-500/15 transition-colors"
                                                        title="Xóa khỏi lớp"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Create Classroom Dialog */}
            <Dialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                title="Tạo lớp học mới"
                footer={
                    <>
                        <button
                            onClick={() => setCreateOpen(false)}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-slate-700/50"
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={creating || !createName.trim()}
                            className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                            Tạo lớp
                        </button>
                    </>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                            Tên lớp <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="text"
                            value={createName}
                            onChange={(e) => setCreateName(e.target.value)}
                            placeholder="VD: 6A1, 7B2..."
                            className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
                            style={{
                                backgroundColor: 'var(--color-bg-secondary)',
                                borderColor: 'var(--color-bg-secondary)',
                                color: 'var(--color-text)',
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                            Năm học
                        </label>
                        <input
                            type="text"
                            value={createYear}
                            onChange={(e) => setCreateYear(e.target.value)}
                            placeholder="VD: 2025-2026"
                            className="w-full px-3 py-2 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
                            style={{
                                backgroundColor: 'var(--color-bg-secondary)',
                                borderColor: 'var(--color-bg-secondary)',
                                color: 'var(--color-text)',
                            }}
                        />
                    </div>
                </div>
            </Dialog>
        </div>
    )
}
