import api from './axios'
interface ApiResponse<T> { success: boolean; message: string; data: T }
interface PageResponse<T> { content: T[]; totalElements: number; totalPages: number; size: number; number: number }

export interface LeaderboardEntry {
    rank?: number; userId: number; username: string; fullName?: string;
    avatarUrl?: string; totalCoins?: number; streakDays?: number; averageScore?: number;
}

export const leaderboardApi = {
    getGlobal: async (limit = 50) => {
        const r = await api.get<ApiResponse<LeaderboardEntry[]>>(`/leaderboard/global?limit=${limit}`)
        return r.data.data
    },
    getByCoins: async (page = 0, size = 50) => {
        const r = await api.get<ApiResponse<PageResponse<LeaderboardEntry>>>(`/leaderboard/coins?page=${page}&size=${size}`)
        return r.data.data
    },
    getByStreak: async (limit = 50) => {
        const r = await api.get<ApiResponse<LeaderboardEntry[]>>(`/leaderboard/streak?limit=${limit}`)
        return r.data.data
    },
    getTop: async (limit = 10) => {
        const r = await api.get<ApiResponse<LeaderboardEntry[]>>(`/leaderboard/top?limit=${limit}`)
        return r.data.data
    },
    getMyRank: async () => {
        const r = await api.get<ApiResponse<LeaderboardEntry>>('/leaderboard/me')
        return r.data.data
    },
    getAroundMe: async (rangeSize = 10) => {
        const r = await api.get<ApiResponse<LeaderboardEntry[]>>(`/leaderboard/around-me?rangeSize=${rangeSize}`)
        return r.data.data
    },
}
