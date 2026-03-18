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
    streakDays?: number
    isActive?: boolean
    createdAt?: string
    updatedAt?: string
    schoolId?: number
    schoolName?: string
    classId?: number
    className?: string
}

// ==================== School ====================
export interface School {
    id: number
    name: string
    address?: string
    phone?: string
    email?: string
    isActive?: boolean
    trialEndDate?: string
    createdAt?: string
    teacherCount?: number
    studentCount?: number
    classCount?: number
}

export interface SchoolRequest {
    name: string
    address?: string
    phone?: string
    email?: string
    trialEndDate?: string
    isActive?: boolean
    managerUsername?: string
    managerPassword?: string
}

// ==================== Lesson ====================
export interface Lesson {
    id: number
    title: string
    topicId?: number
    topicName?: string
    contentHtml?: string
    audioUrl?: string
    videoUrl?: string
    difficultyLevel?: number
    orderIndex?: number
    isPublished?: boolean
    vocabularyCount?: number
    questionCount?: number
    createdAt?: string
}

export interface LessonRequest {
    title: string
    topicId?: number
    contentHtml?: string
    audioUrl?: string
    videoUrl?: string
    difficultyLevel?: number
    orderIndex?: number
    isPublished?: boolean
}

// ==================== Exam ====================
export interface Exam {
    id: number
    title: string
    status: 'DRAFT' | 'PUBLISHED' | 'CLOSED'
    classId?: number
    className?: string
    teacherId?: number
    teacherName?: string
    startTime?: string
    endTime?: string
    durationMinutes?: number
    shuffleQuestions?: boolean
    shuffleAnswers?: boolean
    antiCheatEnabled?: boolean
    questionCount?: number
    totalPoints?: number
    submittedCount?: number
    averageScore?: number;
    questions?: Question[];
    createdAt?: string;
}

export interface ExamRequest {
    title: string
    classId: number
    startTime: string
    endTime: string
    durationMinutes: number
    shuffleQuestions?: boolean
    shuffleAnswers?: boolean
    antiCheatEnabled?: boolean
    questionIds?: number[]
}

// ==================== Exam Result ====================
export interface ExamResult {
    id: number
    examId?: number
    examTitle?: string
    studentId?: number
    studentName?: string
    score?: number
    correctCount?: number
    totalQuestions?: number
    percentage?: number
    submittedAt?: string
    violationCount?: number
    grade?: string
    status?: string
}

// ==================== Anti-Cheat Event ====================
export interface AntiCheatEvent {
    id: number
    examResultId?: number
    eventType: string
    timestamp?: string
    details?: string
}

// ==================== Question ====================
export interface QuestionOption {
    id: number
    optionText: string
    isCorrect: boolean
}

export interface Question {
    id: number
    questionType: string
    questionText: string
    points?: number
    explanation?: string
    lessonId?: number
    lessonTitle?: string
    options: QuestionOption[]
    createdAt?: string
}

export interface QuestionRequest {
    lessonId?: number
    questionType: string
    questionText: string
    points?: number
    explanation?: string
    options: { optionText: string; isCorrect: boolean }[]
}

// ==================== Vocabulary ====================
export interface Vocabulary {
    id: number
    word: string
    meaning: string
    pronunciation?: string
    exampleSentence?: string
    imageUrl?: string
    audioUrl?: string
    lessonId?: number
    lessonTitle?: string
    createdAt?: string
}

export interface VocabularyRequest {
    word: string
    meaning: string
    pronunciation?: string
    exampleSentence?: string
    imageUrl?: string
    audioUrl?: string
    lessonId?: number
}

// ==================== ClassRoom ====================
export interface ClassRoom {
    id: number
    name: string
    academicYear?: string
    isActive?: boolean
    schoolId?: number
    schoolName?: string
    teacherId?: number
    teacherName?: string
    studentCount?: number
    createdAt?: string
}

export interface ClassRoomRequest {
    name: string
    schoolId?: number
    teacherId?: number
    academicYear?: string
    isActive?: boolean
}

// ==================== Badge ====================
export interface Badge {
    id: number
    name: string
    description: string
    iconUrl?: string
    earnedAt?: string
}

export interface BadgeResponse {
    id: number
    name: string
    description: string
    iconUrl?: string
    earnedAt?: string
}

// ==================== Leaderboard ====================
export interface LeaderboardEntry {
    rank?: number
    userId: number
    username: string
    fullName?: string
    avatarUrl?: string
    totalCoins?: number
    streakDays?: number
    averageScore?: number
}

// ==================== Notification ====================
export interface Notification {
    id: number
    title: string
    message: string
    imageUrl?: string
    isRead: boolean
    createdAt?: string
}

// ==================== Progress ====================
export interface Progress {
    id: number
    userId: number
    lessonId?: number
    lessonTitle?: string
    completionPercentage?: number
    isCompleted?: boolean
    lastAccessed?: string
}

// ==================== DailyQuest ====================
export interface DailyQuest {
    id: number
    questDate: string
    isCompleted: boolean
    tasks: DailyQuestTask[]
    totalCoins?: number
}

export interface DailyQuestTask {
    id: number
    taskType: string
    targetCount: number
    currentProgress: number
    completed: boolean
    coins: number
}
