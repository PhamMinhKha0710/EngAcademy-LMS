import api from './axios'
interface ApiResponse<T> { success: boolean; message: string; data: T }

export interface BadgeResponse {
    id: number; name: string; description: string; iconUrl?: string; earnedAt?: string;
}

/** DTO cho badge mới (hệ thống 24 badge) */
export interface BadgeDTO {
    id: number
    badgeKey: string
    name: string
    description: string
    iconEmoji?: string
    groupName: string
    difficulty: string
    isSecret?: boolean
    earnedAt?: string | null
}

/** DTO tiến trình badge chưa đạt */
export interface BadgeProgressDTO {
    badgeKey: string
    badgeName: string
    iconEmoji?: string
    currentValue: number
    requiredValue: number
    percentComplete: number
    description: string
}

/** Response khi gọi check & trao badge */
export interface CheckBadgeResponse {
    newlyEarnedBadges: BadgeDTO[]
    totalBadgesEarned: number
    message: string
}

export const badgeApi = {
    getMyBadges: async () => {
        const r = await api.get<ApiResponse<BadgeResponse[]>>('/badges/me')
        return r.data.data
    },
    getUserBadges: async (userId: number) => {
        const r = await api.get<ApiResponse<BadgeResponse[]>>(`/badges/users/${userId}`)
        return r.data.data
    },
    awardBadge: async (userId: number, badgeName: string, description: string, iconUrl?: string) => {
        const params: Record<string, string> = { description }
        if (iconUrl) params.iconUrl = iconUrl
        const r = await api.post<ApiResponse<BadgeResponse>>(`/badges/${userId}/award/${encodeURIComponent(badgeName)}`, null, { params })
        return r.data.data
    },

    // Hệ thống badge mới (24 badge)
    getDefinitions: async (group?: string): Promise<BadgeDTO[]> => {
        const params = group ? { group } : {}
        const r = await api.get<ApiResponse<BadgeDTO[]>>('/badges/definitions', { params })
        return r.data.data || []
    },
    getMyEarned: async (): Promise<BadgeDTO[]> => {
        const r = await api.get<ApiResponse<BadgeDTO[]>>('/badges/me/earned')
        return r.data.data || []
    },
    getMyProgress: async (): Promise<BadgeProgressDTO[]> => {
        const r = await api.get<ApiResponse<BadgeProgressDTO[]>>('/badges/me/progress')
        return r.data.data || []
    },
    checkAndAward: async (): Promise<CheckBadgeResponse> => {
        const r = await api.post<ApiResponse<CheckBadgeResponse>>('/badges/me/check')
        return r.data.data!
    },
}
