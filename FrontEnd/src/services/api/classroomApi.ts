import api from './axios'
interface ApiResponse<T> { success: boolean; message: string; data: T }

export interface ClassRoomResponse {
    id: number; name: string; academicYear?: string; isActive?: boolean;
    schoolId?: number; schoolName?: string; teacherId?: number; teacherName?: string;
    studentCount?: number; createdAt?: string;
}
export interface ClassRoomRequest {
    name: string; schoolId?: number; teacherId?: number; academicYear?: string; isActive?: boolean;
}
export interface ClassStudentResponse {
    id: number; username: string; fullName?: string; email?: string; avatarUrl?: string;
    status?: string; joinedAt?: string;
}

export const classroomApi = {
    getAll: async () => {
        const r = await api.get<ApiResponse<ClassRoomResponse[]>>('/classes')
        return r.data.data
    },
    getByTeacher: async (teacherId: number) => {
        const r = await api.get<ApiResponse<ClassRoomResponse[]>>(`/classes/teacher/${teacherId}`)
        return r.data.data
    },
    getById: async (id: number) => {
        const r = await api.get<ApiResponse<ClassRoomResponse>>(`/classes/${id}`)
        return r.data.data
    },
    getStudents: async (classId: number) => {
        const r = await api.get<ApiResponse<ClassStudentResponse[]>>(`/classes/${classId}/students`)
        return r.data.data
    },
    create: async (data: ClassRoomRequest) => {
        const r = await api.post<ApiResponse<ClassRoomResponse>>('/classes', data)
        return r.data.data
    },
    update: async (id: number, data: ClassRoomRequest) => {
        const r = await api.put<ApiResponse<ClassRoomResponse>>(`/classes/${id}`, data)
        return r.data.data
    },
    addStudent: async (classId: number, studentId: number) => {
        await api.post(`/classes/${classId}/students/${studentId}`)
    },
    removeStudent: async (classId: number, studentId: number) => {
        await api.delete(`/classes/${classId}/students/${studentId}`)
    },
    delete: async (id: number) => { await api.delete(`/classes/${id}`) },
}
