import api from './axios'

interface ApiResponse<T> { success: boolean; message: string; data: T }
interface PageResponse<T> { content: T[]; totalElements: number; totalPages: number; size: number; number: number }

export interface ExamResponse {
    id: number; title: string; status: string; classId?: number; className?: string;
    teacherId?: number; teacherName?: string; startTime?: string; endTime?: string;
    durationMinutes?: number; shuffleQuestions?: boolean; shuffleAnswers?: boolean;
    antiCheatEnabled?: boolean; questionCount?: number; totalPoints?: number;
    submittedCount?: number; averageScore?: number; createdAt?: string;
}
export interface ExamRequest {
    title: string; classId: number; startTime: string; endTime: string;
    durationMinutes: number; shuffleQuestions?: boolean; shuffleAnswers?: boolean;
    antiCheatEnabled?: boolean; questionIds?: number[];
}
export interface ExamResultResponse {
    id: number; examId?: number; examTitle?: string; studentId?: number; studentName?: string;
    score?: number; correctCount?: number; totalQuestions?: number; percentage?: number;
    submittedAt?: string; violationCount?: number; grade?: string; status?: string;
}
export interface ExamTakeDTO { id: number; examResultId: number; [key: string]: unknown; }
export interface SubmitExamRequest { examResultId: number; answers: { questionId: number; selectedOptionIds: number[] }[] }
export interface AntiCheatEventDTO { examResultId: number; eventType: string; details?: string }
export interface AntiCheatEvent { id: number; examResultId?: number; eventType: string; timestamp?: string; details?: string }

export const examApi = {
    getByClass: async (classId: number, page = 0, size = 20) => {
        const r = await api.get<ApiResponse<PageResponse<ExamResponse>>>(`/exams/class/${classId}?page=${page}&size=${size}`)
        return r.data.data
    },
    getActiveByClass: async (classId: number) => {
        const r = await api.get<ApiResponse<ExamResponse[]>>(`/exams/class/${classId}/active`)
        return r.data.data
    },
    getByTeacher: async (teacherId: number, page = 0, size = 20) => {
        const r = await api.get<ApiResponse<PageResponse<ExamResponse>>>(`/exams/teacher/${teacherId}?page=${page}&size=${size}`)
        return r.data.data
    },
    getById: async (id: number) => {
        const r = await api.get<ApiResponse<ExamResponse>>(`/exams/${id}`)
        return r.data.data
    },
    getForTake: async (id: number) => {
        const r = await api.get<ApiResponse<ExamResponse>>(`/exams/${id}/take`)
        return r.data.data
    },
    create: async (teacherId: number, data: ExamRequest) => {
        const r = await api.post<ApiResponse<ExamResponse>>(`/exams?teacherId=${teacherId}`, data)
        return r.data.data
    },
    update: async (id: number, data: ExamRequest) => {
        const r = await api.put<ApiResponse<ExamResponse>>(`/exams/${id}`, data)
        return r.data.data
    },
    publish: async (id: number) => {
        const r = await api.post<ApiResponse<ExamResponse>>(`/exams/${id}/publish`)
        return r.data.data
    },
    close: async (id: number) => {
        const r = await api.post<ApiResponse<ExamResponse>>(`/exams/${id}/close`)
        return r.data.data
    },
    delete: async (id: number) => { await api.delete(`/exams/${id}`) },
    startExam: async (examId: number, studentId: number) => {
        const r = await api.post<ApiResponse<ExamTakeDTO>>(`/exams/${examId}/start?studentId=${studentId}`)
        return r.data.data
    },
    submitExam: async (examId: number, data: SubmitExamRequest) => {
        const r = await api.post<ApiResponse<ExamResultResponse>>(`/exams/${examId}/submit-anticheat`, data)
        return r.data.data
    },
    logAntiCheatEvent: async (examId: number, data: AntiCheatEventDTO) => {
        await api.post(`/exams/${examId}/anti-cheat-event`, data)
    },
    getResults: async (examId: number) => {
        const r = await api.get<ApiResponse<ExamResultResponse[]>>(`/exams/${examId}/results`)
        return r.data.data
    },
    getAntiCheatEvents: async (examResultId: number) => {
        const r = await api.get<ApiResponse<AntiCheatEvent[]>>(`/exams/results/${examResultId}/anti-cheat-events`)
        return r.data.data
    },
}
