import api from './axios'
interface ApiResponse<T> { success: boolean; message: string; data: T }

export interface QuestTask {
    id: number
    taskType: string
    targetCount: number
    currentProgress?: number
    currentCount?: number
    completed?: boolean
    isCompleted?: boolean
    coins?: number
}
export interface DailyQuestResponse {
    id: number
    questDate: string
    isCompleted?: boolean
    completed?: boolean
    tasks: QuestTask[]
    totalCoins?: number
}

export const questApi = {
    getToday: async () => {
        const r = await api.get<ApiResponse<DailyQuestResponse>>('/quests/today')
        return r.data.data
    },
    updateTaskProgress: async (taskId: number, progress: number) => {
        const r = await api.patch<ApiResponse<DailyQuestResponse>>(`/quests/tasks/${taskId}?progress=${progress}`)
        return r.data.data
    },
    completeQuest: async () => {
        const r = await api.post<ApiResponse<DailyQuestResponse>>('/quests/complete')
        return r.data.data
    },
    getHistory: async () => {
        const r = await api.get<ApiResponse<DailyQuestResponse[]>>('/quests/history')
        return r.data.data
    },
}
