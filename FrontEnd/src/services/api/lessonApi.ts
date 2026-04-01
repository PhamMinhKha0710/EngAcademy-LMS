import api from './axios'

// ===== Types matching Backend DTOs =====

export interface Lesson {
    id: number
    title: string
    topicId?: number
    topicName?: string
    contentHtml?: string
    grammarHtml?: string
    audioUrl?: string
    videoUrl?: string
    /** Optional cover image URL for lesson banner. When missing or invalid, a gradient + icon placeholder is shown. */
    coverImageUrl?: string
    difficultyLevel?: number
    orderIndex?: number
    isPublished?: boolean
    vocabularyCount?: number
    questionCount?: number
}

export interface LessonRequest {
    title: string
    topicId?: number
    contentHtml?: string
    grammarHtml?: string
    audioUrl?: string
    videoUrl?: string
    difficultyLevel?: number
    orderIndex?: number
    isPublished?: boolean
}

export interface ApiResponse<T> {
    success: boolean
    message: string
    data: T
    timestamp: string
}

export interface PageResponse<T> {
    content: T[]
    totalElements: number
    totalPages: number
    size: number
    number: number // current page (0-indexed)
}

// ===== Lesson API Functions =====

export const lessonApi = {
    /**
     * GET /api/v1/lessons - Get all lessons (paginated)
     */
    getAll: async (page = 0, size = 10): Promise<PageResponse<Lesson>> => {
        const response = await api.get<ApiResponse<PageResponse<Lesson>>>('/lessons', {
            params: { page, size }
        })
        return response.data.data
    },

    /**
     * GET /api/v1/lessons?published=true - Get published lessons
     */
    getPublished: async (): Promise<Lesson[]> => {
        const response = await api.get<ApiResponse<Lesson[]>>('/lessons', {
            params: { published: true }
        })
        return response.data.data
    },

    /**
     * GET /api/v1/lessons/{id} - Get lesson by ID
     */
    getById: async (id: number): Promise<Lesson> => {
        const response = await api.get<ApiResponse<Lesson>>(`/lessons/${id}`)
        return response.data.data
    },

    /**
     * GET /api/v1/topics/{topicId}/lessons - Get lessons by topic
     */
    getByTopic: async (topicId: number): Promise<Lesson[]> => {
        const response = await api.get<ApiResponse<Lesson[]>>(`/topics/${topicId}/lessons`)
        return response.data.data
    },

    /**
     * POST /api/v1/lessons - Create new lesson
     */
    create: async (data: LessonRequest): Promise<Lesson> => {
        const response = await api.post<ApiResponse<Lesson>>('/lessons', data)
        return response.data.data
    },

    /**
     * PUT /api/v1/lessons/{id} - Update lesson
     */
    update: async (id: number, data: LessonRequest): Promise<Lesson> => {
        const response = await api.put<ApiResponse<Lesson>>(`/lessons/${id}`, data)
        return response.data.data
    },

    /**
     * DELETE /api/v1/lessons/{id} - Delete lesson
     */
    delete: async (id: number): Promise<void> => {
        await api.delete(`/lessons/${id}`)
    },
}
