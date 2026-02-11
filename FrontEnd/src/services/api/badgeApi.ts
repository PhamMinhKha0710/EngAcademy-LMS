import api from './axios'
interface ApiResponse<T> { success: boolean; message: string; data: T }

export interface BadgeResponse {
    id: number; name: string; description: string; iconUrl?: string; earnedAt?: string;
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
}
