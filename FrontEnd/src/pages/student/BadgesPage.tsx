import { useState, useEffect } from 'react'
import { Award, Loader2, Calendar } from 'lucide-react'
import { badgeApi, BadgeResponse } from '../../services/api/badgeApi'
import EmptyState from '../../components/ui/EmptyState'

export default function BadgesPage() {
    const [badges, setBadges] = useState<BadgeResponse[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchBadges = async () => {
            try {
                setLoading(true)
                setError(null)
                const data = await badgeApi.getMyBadges()
                setBadges(data || [])
            } catch (err) {
                console.error('Failed to fetch badges:', err)
                setError('Không thể tải danh sách huy hiệu')
            } finally {
                setLoading(false)
            }
        }
        fetchBadges()
    }, [])

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—'
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        )
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1
                    className="text-2xl md:text-3xl font-bold mb-2"
                    style={{ color: 'var(--color-text)' }}
                >
                    Huy hiệu
                </h1>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                    Bộ sưu tập huy hiệu thành tích của bạn
                </p>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Summary */}
            {badges.length > 0 && (
                <div className="card p-6 mb-8 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-amber-500/20 flex items-center justify-center">
                        <Award className="w-7 h-7 text-yellow-500" />
                    </div>
                    <div>
                        <p className="text-3xl font-extrabold" style={{ color: 'var(--color-text)' }}>
                            {badges.length}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            huy hiệu đã đạt được
                        </p>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {badges.length === 0 && !error && (
                <EmptyState
                    icon={<Award className="w-8 h-8" />}
                    title="Chưa có huy hiệu nào"
                    description="Hoàn thành các thử thách và nhiệm vụ để nhận huy hiệu đầu tiên!"
                />
            )}

            {/* Badge grid */}
            {badges.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {badges.map((badge) => (
                        <div
                            key={badge.id}
                            className="card p-6 group hover:scale-[1.02] transition-all duration-300"
                        >
                            {/* Badge icon */}
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-500/15 to-amber-500/15 flex items-center justify-center shrink-0 group-hover:from-yellow-500/25 group-hover:to-amber-500/25 transition-colors">
                                    {badge.iconUrl ? (
                                        <img
                                            src={badge.iconUrl}
                                            alt={badge.name}
                                            className="w-8 h-8 object-contain"
                                            onError={(e) => {
                                                ;(e.target as HTMLImageElement).style.display = 'none'
                                                ;(e.target as HTMLImageElement).parentElement!.innerHTML =
                                                    '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-yellow-500"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>'
                                            }}
                                        />
                                    ) : (
                                        <Award className="w-7 h-7 text-yellow-500" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3
                                        className="font-semibold text-base truncate group-hover:text-yellow-500 transition-colors"
                                        style={{ color: 'var(--color-text)' }}
                                    >
                                        {badge.name}
                                    </h3>
                                    <p
                                        className="text-sm mt-1 line-clamp-2"
                                        style={{ color: 'var(--color-text-secondary)' }}
                                    >
                                        {badge.description}
                                    </p>
                                </div>
                            </div>

                            {/* Earned date */}
                            {badge.earnedAt && (
                                <div
                                    className="mt-4 pt-4 border-t flex items-center gap-2 text-xs"
                                    style={{
                                        borderColor: 'var(--color-border)',
                                        color: 'var(--color-text-secondary)',
                                    }}
                                >
                                    <Calendar className="w-3.5 h-3.5" />
                                    Đạt ngày {formatDate(badge.earnedAt)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
