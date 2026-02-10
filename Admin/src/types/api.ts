// ============================================================
// Shared TypeScript types for the Admin panel
// Matches the Spring Boot backend DTOs
// ============================================================

// Generic API response wrapper from Spring Boot
export interface ApiResponse<T> {
    success: boolean
    message: string
    data: T
    timestamp?: string
}

// Paginated response
export interface Page<T> {
    content: T[]
    totalElements: number
    totalPages: number
    size: number
    number: number
    first: boolean
    last: boolean
    empty: boolean
}

// ==================== Auth ====================
export interface LoginRequest {
    username: string
    password: string
}

export interface RegisterRequest {
    username: string
    email: string
    password: string
    fullName: string
}

export interface AuthResponse {
    id: number
    username: string
    email: string
    accessToken: string
    refreshToken: string
    roles: string[]
}

// ==================== User ====================
export interface User {
    id: number
    username: string
    email: string
    fullName: string
    avatarUrl?: string
    roles: string[]
    coins?: number
    createdAt?: string
    updatedAt?: string
}

// ==================== School ====================
export interface School {
    id: number
    name: string
    address?: string
    phone?: string
    email?: string
    principalName?: string
    active: boolean
    createdAt?: string
}

export interface SchoolRequest {
    name: string
    address?: string
    phone?: string
    email?: string
    principalName?: string
}

// ==================== Lesson ====================
export interface Lesson {
    id: number
    title: string
    description?: string
    content?: string
    level?: string
    orderIndex?: number
    published: boolean
    createdAt?: string
}

export interface LessonRequest {
    title: string
    description?: string
    content?: string
    level?: string
    orderIndex?: number
    published?: boolean
}

// ==================== Exam ====================
export interface Exam {
    id: number
    title: string
    description?: string
    duration: number
    totalQuestions: number
    passingScore: number
    status: 'DRAFT' | 'PUBLISHED' | 'CLOSED'
    shuffleQuestions: boolean
    shuffleOptions: boolean
    antiCheatEnabled: boolean
    createdAt?: string
    teacherId?: number
    classId?: number
}

export interface ExamRequest {
    title: string
    description?: string
    duration: number
    passingScore: number
    shuffleQuestions?: boolean
    shuffleOptions?: boolean
    antiCheatEnabled?: boolean
    classId?: number
    questionIds?: number[]
}

// ==================== Question ====================
export interface QuestionOption {
    id: number
    content: string
    isCorrect: boolean
}

export interface Question {
    id: number
    content: string
    type: string
    difficulty?: string
    explanation?: string
    lessonId?: number
    options: QuestionOption[]
    createdAt?: string
}

export interface QuestionRequest {
    content: string
    type: string
    difficulty?: string
    explanation?: string
    lessonId?: number
    options: { content: string; isCorrect: boolean }[]
}

// ==================== Vocabulary ====================
export interface Vocabulary {
    id: number
    word: string
    meaning: string
    pronunciation?: string
    example?: string
    imageUrl?: string
    audioUrl?: string
    lessonId?: number
    topicId?: number
    createdAt?: string
}

export interface VocabularyRequest {
    word: string
    meaning: string
    pronunciation?: string
    example?: string
    imageUrl?: string
    audioUrl?: string
    lessonId?: number
    topicId?: number
}

// ==================== ClassRoom ====================
export interface ClassRoom {
    id: number
    name: string
    description?: string
    schoolId?: number
    teacherId?: number
    schoolName?: string
    teacherName?: string
    studentCount?: number
    active: boolean
    createdAt?: string
}

export interface ClassRoomRequest {
    name: string
    description?: string
    schoolId?: number
    teacherId?: number
}

// ==================== Badge ====================
export interface Badge {
    id: number
    name: string
    description: string
    iconUrl?: string
    userId: number
    createdAt?: string
}

// ==================== Progress ====================
export interface Progress {
    id: number
    userId: number
    lessonId?: number
    completionRate: number
    score?: number
    streak?: number
    totalVocabularyLearned?: number
    createdAt?: string
}

// ==================== DailyQuest ====================
export interface DailyQuest {
    id: number
    date: string
    userId: number
    completed: boolean
    tasks: DailyQuestTask[]
}

export interface DailyQuestTask {
    id: number
    title: string
    description?: string
    type: string
    target: number
    progress: number
    completed: boolean
    reward: number
}
