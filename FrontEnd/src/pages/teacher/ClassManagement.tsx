import { useState, useEffect } from 'react'
import { useAuthStore } from '../../store/authStore'
import { classroomApi, ClassRoomResponse } from '../../services/api/classroomApi'
import { Users, Plus, LayoutGrid, GraduationCap, X, Search, Loader2 } from 'lucide-react'

export default function ClassManagement() {
    const { user } = useAuthStore()
    const [classes, setClasses] = useState<ClassRoomResponse[]>([])
    const [selectedClass, setSelectedClass] = useState<ClassRoomResponse | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isAddStudentOpen, setIsAddStudentOpen] = useState(false)
    const [studentId, setStudentId] = useState('')
    const [actionMsg, setActionMsg] = useState({ type: '', text: '' })
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        if (user?.id) {
            fetchClasses()
        } else if (!isLoading) {
            setIsLoading(false)
        }
    }, [user?.id])

    const fetchClasses = async () => {
        setIsLoading(true)
        setActionMsg({ type: '', text: '' })
        try {
            const data = await classroomApi.getByTeacher(user!.id)
            setClasses(data)
            if (data.length > 0) {
                if (!selectedClass || !data.find(c => c.id === selectedClass.id)) {
                    setSelectedClass(data[0])
                }
            }
        } catch (error: any) {
            console.error('Failed to fetch classes:', error)
            setActionMsg({ type: 'error', text: 'Không thể tải danh sách lớp học.' })
        } finally {
            setIsLoading(false)
        }
    }

    const handleAddStudent = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedClass || !studentId) return
        
        setIsSubmitting(true)
        setActionMsg({ type: '', text: '' })
        try {
            await classroomApi.addStudent(selectedClass.id, parseInt(studentId))
            setActionMsg({ type: 'success', text: 'Thêm học sinh vào lớp thành công!' })
            setStudentId('')
            setIsAddStudentOpen(false)
            // Refresh class data if student count increases
            fetchClasses()
        } catch (err: any) {
            setActionMsg({ type: 'error', text: err.response?.data?.message || 'Có lỗi xảy ra khi thêm học sinh.' })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: 'var(--color-text)' }}>
                        <Users className="w-8 h-8 text-blue-500" />
                        Quản lý lớp học
                    </h1>
                    <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                        Quản lý danh sách lớp và học viên của bạn.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar danh sách lớp */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider px-2" style={{ color: 'var(--color-text-secondary)' }}>
                        Danh sách lớp ({classes.length})
                    </h3>
                    <div className="space-y-2">
                        {classes.map((cls) => (
                            <button
                                key={cls.id}
                                onClick={() => setSelectedClass(cls)}
                                className={`w-full text-left p-4 rounded-xl transition-all border ${
                                    selectedClass?.id === cls.id
                                        ? 'bg-blue-500/10 border-blue-500 shadow-sm'
                                        : 'bg-card border-transparent hover:border-blue-500/30'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${selectedClass?.id === cls.id ? 'bg-blue-500 text-white' : 'bg-blue-500/10 text-blue-500'}`}>
                                        <LayoutGrid className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>{cls.name}</p>
                                        <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{cls.academicYear || 'N/A'}</p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Nội dung chi tiết lớp học */}
                <div className="lg:col-span-3">
                    {selectedClass ? (
                        <div className="card h-full flex flex-col">
                            <div className="p-6 border-b" style={{ borderColor: 'var(--color-border)' }}>
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-500 text-white rounded-xl flex items-center justify-center">
                                            <GraduationCap className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>{selectedClass.name}</h2>
                                            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                                Niên khóa: {selectedClass.academicYear} | Sĩ số: {selectedClass.studentCount || 0}
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setIsAddStudentOpen(true)}
                                        className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Thêm học sinh
                                    </button>
                                </div>
                            </div>

                            <div className="p-8 flex-1 flex flex-col items-center justify-center text-center opacity-70">
                                <div className="bg-blue-500/10 p-6 rounded-full mb-4">
                                    <Users className="w-12 h-12 text-blue-500/50" />
                                </div>
                                <h3 className="text-lg font-bold mb-2">Danh sách học sinh</h3>
                                <p className="max-w-sm mb-2" style={{ color: 'var(--color-text-secondary)' }}>
                                    Hiện chưa có danh sách học sinh chi tiết. Bạn có thể thêm học sinh mới vào lớp này bằng ID của họ.
                                </p>
                                <p className="text-xs italic text-orange-400">
                                    (Lưu ý: Chức năng hiển thị danh sách học viên hiện chưa có API từ Backend)
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="card h-full flex flex-col items-center justify-center py-20 text-center">
                            <Search className="w-12 h-12 text-gray-400 mb-4" />
                            <p style={{ color: 'var(--color-text-secondary)' }}>Chọn một lớp để xem chi tiết.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Thêm học sinh */}
            {isAddStudentOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="card w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                        <button 
                            onClick={() => setIsAddStudentOpen(false)}
                            className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Plus className="w-5 h-5 text-blue-500" />
                            Thêm học sinh vào lớp
                        </h2>

                        <form onSubmit={handleAddStudent} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                                    Nhập ID học sinh
                                </label>
                                <input
                                    type="number"
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    className="input-field"
                                    placeholder="Ví dụ: 123"
                                    required
                                    autoFocus
                                />
                                <p className="mt-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                    ID này được cấp khi học sinh đăng ký tài khoản.
                                </p>
                            </div>

                            {actionMsg.text && (
                                <div className={`p-3 rounded-lg text-sm border ${
                                    actionMsg.type === 'success' 
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
                                        : 'bg-red-500/10 border-red-500/30 text-red-500'
                                }`}>
                                    {actionMsg.text}
                                </div>
                            )}

                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button"
                                    onClick={() => setIsAddStudentOpen(false)}
                                    className="flex-1 py-2 rounded-xl border border-gray-300 dark:border-gray-700 font-medium"
                                >
                                    Hủy
                                </button>
                                <button 
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 btn-primary py-2 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    Thêm ngay
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
