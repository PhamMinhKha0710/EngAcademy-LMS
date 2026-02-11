import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Trophy, Medal, Flame, Coins, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import type { ApiResponse, LeaderboardEntry, Page } from '@/types/api'
import { toast } from 'sonner'

type TabType = 'global' | 'coins' | 'streak'

export default function LeaderboardPage() {
    const [activeTab, setActiveTab] = useState<TabType>('global')
    const [entries, setEntries] = useState<LeaderboardEntry[]>([])
    const [loading, setLoading] = useState(true)

    const tabs: { key: TabType; label: string; icon: React.ReactNode }[] = [
        { key: 'global', label: 'Tổng hợp', icon: <Trophy className="h-4 w-4" /> },
        { key: 'coins', label: 'Xu', icon: <Coins className="h-4 w-4" /> },
        { key: 'streak', label: 'Chuỗi ngày', icon: <Flame className="h-4 w-4" /> },
    ]

    const fetchLeaderboard = async (tab: TabType) => {
        setLoading(true)
        try {
            let data: LeaderboardEntry[] = []

            if (tab === 'global') {
                const response = await api.get<ApiResponse<LeaderboardEntry[]>>(
                    '/leaderboard/global',
                    { params: { limit: 50 } }
                )
                data = response.data.data
            } else if (tab === 'coins') {
                const response = await api.get<ApiResponse<Page<LeaderboardEntry>>>(
                    '/leaderboard/coins',
                    { params: { page: 0, size: 50 } }
                )
                const responseData = response.data.data
                if (responseData && Array.isArray((responseData as Page<LeaderboardEntry>).content)) {
                    data = (responseData as Page<LeaderboardEntry>).content
                } else if (Array.isArray(responseData)) {
                    data = responseData as unknown as LeaderboardEntry[]
                }
            } else if (tab === 'streak') {
                const response = await api.get<ApiResponse<LeaderboardEntry[]>>(
                    '/leaderboard/streak',
                    { params: { limit: 50 } }
                )
                data = response.data.data
            }

            const ranked = data.map((entry, index) => ({
                ...entry,
                rank: entry.rank ?? index + 1,
            }))

            setEntries(ranked)
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Không thể tải bảng xếp hạng'
            toast.error(msg)
            setEntries([])
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLeaderboard(activeTab)
    }, [activeTab])

    const handleTabChange = (tab: TabType) => {
        if (tab === activeTab) return
        setActiveTab(tab)
    }

    const getAvatarInitial = (entry: LeaderboardEntry) => {
        if (entry.fullName) return entry.fullName.charAt(0).toUpperCase()
        return entry.username.charAt(0).toUpperCase()
    }

    const getMedalColor = (rank: number) => {
        switch (rank) {
            case 1:
                return 'from-yellow-400 to-amber-500'
            case 2:
                return 'from-gray-300 to-gray-400'
            case 3:
                return 'from-orange-400 to-orange-500'
            default:
                return 'from-primary/20 to-primary/30'
        }
    }

    const getMedalBorder = (rank: number) => {
        switch (rank) {
            case 1:
                return 'border-yellow-400 shadow-yellow-200/50'
            case 2:
                return 'border-gray-300 shadow-gray-200/50'
            case 3:
                return 'border-orange-400 shadow-orange-200/50'
            default:
                return 'border-border'
        }
    }

    const getMedalLabel = (rank: number) => {
        switch (rank) {
            case 1:
                return 'Hạng nhất'
            case 2:
                return 'Hạng nhì'
            case 3:
                return 'Hạng ba'
            default:
                return `Hạng ${rank}`
        }
    }

    const getHighlightValue = (entry: LeaderboardEntry) => {
        switch (activeTab) {
            case 'coins':
                return `${entry.totalCoins?.toLocaleString('vi-VN') ?? 0} xu`
            case 'streak':
                return `${entry.streakDays ?? 0} ngày`
            default:
                return `${entry.averageScore?.toFixed(1) ?? '—'} điểm`
        }
    }

    const top3 = entries.slice(0, 3)
    const rest = entries.slice(3)

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Bảng xếp hạng</h1>
                <p className="text-muted-foreground mt-1">Xem xếp hạng người dùng theo các tiêu chí</p>
            </div>

            {/* Tab Buttons */}
            <div className="flex items-center gap-2">
                {tabs.map((tab) => (
                    <Button
                        key={tab.key}
                        variant={activeTab === tab.key ? 'default' : 'outline'}
                        className="gap-2"
                        onClick={() => handleTabChange(tab.key)}
                    >
                        {tab.icon}
                        {tab.label}
                    </Button>
                ))}
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-60">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Đang tải bảng xếp hạng...</p>
                    </div>
                </div>
            ) : entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-60 text-muted-foreground">
                    <Trophy className="h-12 w-12 mb-3 opacity-50" />
                    <p className="text-lg">Chưa có dữ liệu xếp hạng</p>
                </div>
            ) : (
                <>
                    {/* Top 3 Cards */}
                    {top3.length > 0 && (
                        <div className="grid gap-4 md:grid-cols-3">
                            {top3.map((entry) => (
                                <Card
                                    key={entry.userId}
                                    className={`relative overflow-hidden border-2 shadow-lg ${getMedalBorder(entry.rank!)}`}
                                >
                                    <div
                                        className={`absolute inset-0 bg-gradient-to-br ${getMedalColor(entry.rank!)} opacity-10`}
                                    />
                                    <CardContent className="p-5 relative">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div
                                                    className={`w-14 h-14 rounded-full bg-gradient-to-br ${getMedalColor(entry.rank!)} flex items-center justify-center text-white font-bold text-xl shadow-md`}
                                                >
                                                    {entry.avatarUrl ? (
                                                        <img
                                                            src={entry.avatarUrl}
                                                            alt={entry.fullName || entry.username}
                                                            className="w-full h-full rounded-full object-cover"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement
                                                                target.style.display = 'none'
                                                                target.parentElement!.textContent = getAvatarInitial(entry)
                                                            }}
                                                        />
                                                    ) : (
                                                        getAvatarInitial(entry)
                                                    )}
                                                </div>
                                                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-background border-2 border-current flex items-center justify-center">
                                                    <span className="text-xs font-bold">{entry.rank}</span>
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold truncate">
                                                        {entry.fullName || entry.username}
                                                    </h3>
                                                    <Medal className="h-4 w-4 flex-shrink-0 text-amber-500" />
                                                </div>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    @{entry.username}
                                                </p>
                                                <Badge variant="secondary" className="mt-1.5 text-xs">
                                                    {getMedalLabel(entry.rank!)}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                                            <div className="rounded-md bg-background/80 p-2">
                                                <p className="text-xs text-muted-foreground">Xu</p>
                                                <p className="text-sm font-semibold">
                                                    {entry.totalCoins?.toLocaleString('vi-VN') ?? '—'}
                                                </p>
                                            </div>
                                            <div className="rounded-md bg-background/80 p-2">
                                                <p className="text-xs text-muted-foreground">Streak</p>
                                                <p className="text-sm font-semibold">
                                                    {entry.streakDays ?? '—'}
                                                </p>
                                            </div>
                                            <div className="rounded-md bg-background/80 p-2">
                                                <p className="text-xs text-muted-foreground">Điểm TB</p>
                                                <p className="text-sm font-semibold">
                                                    {entry.averageScore?.toFixed(1) ?? '—'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-3 text-center">
                                            <span className="text-lg font-bold text-primary">
                                                {getHighlightValue(entry)}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}

                    {/* Table for remaining entries */}
                    {rest.length > 0 && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-primary" />
                                    Xếp hạng chi tiết
                                    <Badge variant="outline" className="ml-2">
                                        {entries.length} người dùng
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-16">Hạng</TableHead>
                                            <TableHead>Người dùng</TableHead>
                                            <TableHead>Username</TableHead>
                                            <TableHead className="text-right">Xu</TableHead>
                                            <TableHead className="text-right">Chuỗi ngày</TableHead>
                                            <TableHead className="text-right">Điểm TB</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {rest.map((entry) => (
                                            <TableRow key={entry.userId}>
                                                <TableCell>
                                                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted text-sm font-semibold">
                                                        {entry.rank}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                                                            {entry.avatarUrl ? (
                                                                <img
                                                                    src={entry.avatarUrl}
                                                                    alt={entry.fullName || entry.username}
                                                                    className="w-full h-full rounded-full object-cover"
                                                                    onError={(e) => {
                                                                        const target = e.target as HTMLImageElement
                                                                        target.style.display = 'none'
                                                                        target.parentElement!.textContent = getAvatarInitial(entry)
                                                                    }}
                                                                />
                                                            ) : (
                                                                getAvatarInitial(entry)
                                                            )}
                                                        </div>
                                                        <span className="font-medium">
                                                            {entry.fullName || entry.username}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">
                                                    @{entry.username}
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {entry.totalCoins?.toLocaleString('vi-VN') ?? '—'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Flame className="h-3.5 w-3.5 text-orange-500" />
                                                        <span className="font-medium">
                                                            {entry.streakDays ?? '—'}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-medium">
                                                    {entry.averageScore?.toFixed(1) ?? '—'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}
        </div>
    )
}
