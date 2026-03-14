import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Flame, Coins, Crown, Search, ChevronDown, MoreVertical } from 'lucide-react'
import { AxiosError } from 'axios'
import api from '@/lib/api'
import type { ApiResponse, LeaderboardEntry, Page } from '@/types/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { useAppSelector } from '@/app/hooks'

function getErrorMessage(error: unknown, fallback: string): string {
    return error instanceof AxiosError && error.response?.data?.message
        ? String(error.response.data.message)
        : fallback
}

type TabType = 'global' | 'coins' | 'streak'

export default function LeaderboardPage() {
    const { user: currentUser } = useAppSelector((state) => state.auth)
    const [activeTab, setActiveTab] = useState<TabType>('global')
    const [entries, setEntries] = useState<LeaderboardEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    const tabs: { key: TabType; label: string; icon: any }[] = [
        { key: 'global', label: 'Tổng hợp', icon: Trophy },
        { key: 'coins', label: 'Xu thưởng', icon: Coins },
        { key: 'streak', label: 'Chuỗi ngày', icon: Flame },
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
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, 'Không thể tải bảng xếp hạng'))
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

    const filteredEntries = entries.filter(e => 
        e.fullName?.toLowerCase().includes(search.toLowerCase()) || 
        e.username.toLowerCase().includes(search.toLowerCase())
    )

    const top3 = filteredEntries.slice(0, 3)
    // Order for podium: [2, 1, 3]
    const podiumOrder = top3.length === 3 ? [top3[1], top3[0], top3[2]] : 
                      top3.length === 2 ? [top3[1], top3[0]] : top3

    const rest = filteredEntries.slice(3)

    const currentUserEntry = entries.find(e => e.userId === currentUser?.id)

    return (
        <div className="space-y-8 pb-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Bảng xếp hạng</h1>
                    <p className="text-muted-foreground mt-2 font-medium">Vinh danh những cá nhân có thành tích xuất sắc nhất tuần này.</p>
                </div>
                
                <div className="flex bg-muted p-1.5 rounded-2xl w-fit">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => handleTabChange(tab.key)}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all text-sm",
                                activeTab === tab.key 
                                    ? "bg-background text-primary shadow-sm" 
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <tab.icon className={cn("h-4 w-4", activeTab === tab.key ? "text-primary" : "text-muted-foreground/60")} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-[500px] gap-4">
                    <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                    <p className="font-bold text-slate-400">Đang cập nhật thứ hạng...</p>
                </div>
            ) : filteredEntries.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground bg-card rounded-3xl border border-dashed border-border/50">
                    <Trophy className="h-16 w-16 mb-4 opacity-10" />
                    <p className="text-lg font-bold">Chưa có dữ liệu cho bảng xếp hạng này</p>
                </div>
            ) : (
                <>
                    {/* Podium Section */}
                    <div className="flex flex-col md:flex-row items-end justify-center gap-4 md:gap-0 mt-12 mb-8 px-4">
                        {/* 2nd Place */}
                        {podiumOrder.length >= 2 && (
                            <div className="flex flex-col items-center w-full md:w-64 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
                                <div className="relative mb-6">
                                    <Avatar className="h-24 w-24 border-4 border-slate-200 shadow-xl ring-4 ring-slate-50">
                                        <AvatarImage src={podiumOrder[0].rank === 2 ? podiumOrder[0].avatarUrl : podiumOrder[1].avatarUrl} />
                                        <AvatarFallback className="text-xl font-black bg-slate-100 text-slate-400">
                                            {(podiumOrder[0].rank === 2 ? podiumOrder[0] : podiumOrder[1]).username.substring(0,2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-slate-400 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-widest">#2</div>
                                </div>
                                <div className="text-center mb-4">
                                    <h3 className="font-black text-foreground/90">{(podiumOrder[0].rank === 2 ? podiumOrder[0] : podiumOrder[1]).fullName || (podiumOrder[0].rank === 2 ? podiumOrder[0] : podiumOrder[1]).username}</h3>
                                    <p className="text-xs font-bold text-muted-foreground/60">@{(podiumOrder[0].rank === 2 ? podiumOrder[0] : podiumOrder[1]).username}</p>
                                </div>
                                <div className="w-full bg-muted/50 h-32 rounded-t-3xl flex flex-col items-center justify-center shadow-inner pt-4 border-t border-x border-border/20">
                                    <div className="bg-background/50 px-3 py-1 rounded-full flex items-center gap-1.5 mb-2">
                                        <Coins className="h-3 w-3 text-amber-500" />
                                        <span className="text-xs font-black text-foreground/80">{(podiumOrder[0].rank === 2 ? podiumOrder[0] : podiumOrder[1]).totalCoins?.toLocaleString() ?? 0}</span>
                                    </div>
                                    <div className="text-2xl font-black text-muted-foreground/40">2nd</div>
                                </div>
                            </div>
                        )}

                        {/* 1st Place */}
                        {podiumOrder.find(p => p.rank === 1) && (
                            <div className="flex flex-col items-center w-full md:w-72 z-10 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                                <Crown className="h-10 w-10 text-amber-400 drop-shadow-md mb-2 animate-bounce" />
                                <div className="relative mb-6">
                                    <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse" />
                                    <Avatar className="h-32 w-32 border-4 border-blue-500 shadow-2xl ring-4 ring-blue-50 relative">
                                        <AvatarImage src={podiumOrder.find(p => p.rank === 1)?.avatarUrl} />
                                        <AvatarFallback className="text-3xl font-black bg-blue-50 text-blue-500">
                                            {podiumOrder.find(p => p.rank === 1)?.username.substring(0,2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-lg uppercase tracking-widest border-2 border-white">#1</div>
                                </div>
                                <div className="text-center mb-6">
                                    <h3 className="text-xl font-black text-foreground">{podiumOrder.find(p => p.rank === 1)?.fullName || podiumOrder.find(p => p.rank === 1)?.username}</h3>
                                    <p className="text-sm font-bold text-primary">@{podiumOrder.find(p => p.rank === 1)?.username}</p>
                                </div>
                                <div className="w-full bg-blue-600 h-44 rounded-t-3xl flex flex-col items-center justify-center shadow-xl pt-4 ring-2 ring-blue-100">
                                    <div className="bg-white/20 px-4 py-1.5 rounded-full flex items-center gap-2 mb-3">
                                        <Coins className="h-4 w-4 text-amber-300" />
                                        <span className="text-sm font-black text-white">{podiumOrder.find(p => p.rank === 1)?.totalCoins?.toLocaleString() ?? 0}</span>
                                    </div>
                                    <div className="text-4xl font-black text-white drop-shadow-md">1st</div>
                                </div>
                            </div>
                        )}

                        {/* 3rd Place */}
                        {podiumOrder.length >= (podiumOrder.find(p => p.rank === 2) ? 3 : 2) && (
                            <div className="flex flex-col items-center w-full md:w-64 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
                                <div className="relative mb-6">
                                    <Avatar className="h-20 w-20 border-4 border-orange-200 shadow-lg ring-4 ring-orange-50">
                                        <AvatarImage src={podiumOrder[podiumOrder.length-1].avatarUrl} />
                                        <AvatarFallback className="text-lg font-black bg-orange-50 text-orange-400">
                                            {podiumOrder[podiumOrder.length-1].username.substring(0,2).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-orange-400 text-white text-[10px] font-black px-3 py-1 rounded-full shadow-lg uppercase tracking-widest">#3</div>
                                </div>
                                <div className="text-center mb-4">
                                    <h3 className="font-black text-foreground/90">{podiumOrder[podiumOrder.length-1].fullName || podiumOrder[podiumOrder.length-1].username}</h3>
                                    <p className="text-xs font-bold text-muted-foreground/60">@{podiumOrder[podiumOrder.length-1].username}</p>
                                </div>
                                <div className="w-full bg-orange-500/10 h-24 rounded-t-3xl flex flex-col items-center justify-center shadow-inner pt-4 border-t border-x border-orange-500/10">
                                     <div className="bg-background/50 px-3 py-1 rounded-full flex items-center gap-1.5 mb-2">
                                        <Coins className="h-3 w-3 text-amber-500" />
                                        <span className="text-xs font-black text-foreground/80">{podiumOrder[podiumOrder.length-1].totalCoins?.toLocaleString() ?? 0}</span>
                                    </div>
                                    <div className="text-xl font-black text-orange-500/50">3rd</div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Ranking Table */}
                    <Card className="premium-card border-none shadow-xl dark:shadow-none overflow-hidden mt-6">
                        <CardHeader className="p-8 pb-3">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div className="flex items-center gap-2">
                                     <Button variant="outline" className="h-11 rounded-xl px-4 font-bold border-border text-muted-foreground bg-background">
                                        Tất cả khu vực <ChevronDown className="h-4 w-4 ml-2" />
                                    </Button>
                                    <div className="h-6 w-[1.5px] bg-border/40 mx-2" />
                                    <Badge variant="secondary" className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-lg border-none uppercase tracking-wider text-[10px]">
                                        Tổng {filteredEntries.length} người dùng
                                    </Badge>
                                </div>
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                                    <Input 
                                        placeholder="Tìm kiếm vị trí hoặc tên..." 
                                        value={search} 
                                        onChange={(e) => setSearch(e.target.value)} 
                                        className="pl-11 pr-4 h-11 w-80 bg-muted/30 border-border/50 rounded-xl focus-visible:ring-2 focus-visible:ring-primary/20 transition-all font-medium" 
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-5">
                            <div className="rounded-2xl border border-border/50 overflow-hidden">
                                <Table>
                                    <TableHeader className="bg-muted/30">
                                        <TableRow className="hover:bg-transparent border-border/50">
                                            <TableHead className="font-bold text-muted-foreground uppercase text-[11px] tracking-widest pl-8 w-24 text-center">Xếp hạng</TableHead>
                                            <TableHead className="font-bold text-muted-foreground uppercase text-[11px] tracking-widest pl-4">Người dùng</TableHead>
                                            <TableHead className="font-bold text-muted-foreground uppercase text-[11px] tracking-widest text-center">Xu thưởng</TableHead>
                                            <TableHead className="font-bold text-muted-foreground uppercase text-[11px] tracking-widest text-center">Chuỗi ngày</TableHead>
                                            <TableHead className="font-bold text-muted-foreground uppercase text-[11px] tracking-widest text-center">Thành tích</TableHead>
                                            <TableHead className="font-bold text-muted-foreground uppercase text-[11px] tracking-widest text-right pr-8">Thao tác</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {rest.length > 0 ? rest.map((entry) => (
                                            <TableRow key={entry.userId} className={cn(
                                                "hover:bg-muted/30 border-border/40 transition-colors h-20",
                                                entry.userId === currentUser?.id && "bg-primary/5 hover:bg-primary/10 border-l-4 border-l-primary"
                                            )}>
                                                <TableCell className="pl-8 text-center">
                                                    <span className="font-black text-muted-foreground/50 text-lg">#{entry.rank}</span>
                                                </TableCell>
                                                <TableCell className="pl-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-10 w-10 border border-border/50">
                                                            <AvatarImage src={entry.avatarUrl} />
                                                            <AvatarFallback className="bg-muted text-muted-foreground text-[10px] font-black">
                                                                {entry.username.substring(0, 2).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-foreground leading-tight">{entry.fullName || entry.username}</span>
                                                            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tighter">@{entry.username}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="inline-flex items-center gap-1.5 font-black text-sm text-foreground/80 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
                                                        <Coins className="h-3.5 w-3.5 text-amber-500" />
                                                        {entry.totalCoins?.toLocaleString() ?? 0}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="inline-flex items-center gap-1.5 font-black text-sm text-orange-500 bg-orange-500/10 px-3 py-1.5 rounded-xl border border-orange-500/20">
                                                        <Flame className="h-3.5 w-3.5 text-orange-500" />
                                                        {entry.streakDays ?? 0}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                                            <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min((entry.averageScore ?? 0) * 10, 100)}%` }} />
                                                        </div>
                                                        <span className="text-xs font-black text-muted-foreground">{entry.averageScore?.toFixed(1) ?? 0}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right pr-8">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground/40 hover:text-foreground">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center py-20 text-muted-foreground font-bold">
                                                    Không tìm thấy người dùng nào trong danh sách
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Current User Fixed Row (if in list but not in search display) or always show summary */}
                            {currentUserEntry && (
                                <div className="mt-8 p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-3xl border border-primary/20 flex items-center justify-between animate-in fade-in slide-in-from-bottom-4">
                                    <div className="flex items-center gap-5">
                                        <div className="h-14 w-14 rounded-2xl bg-primary flex items-center justify-center text-white text-xl font-black shadow-lg shadow-primary/30 ring-4 ring-primary/10">
                                            #{currentUserEntry.rank}
                                        </div>
                                        <div>
                                            <h4 className="text-lg font-black text-foreground">Xếp hạng của bạn</h4>
                                            <p className="text-sm font-semibold text-muted-foreground">Bạn đang giữ vị trí #{currentUserEntry.rank} trên toàn hệ thống.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-8 pr-4">
                                        <div className="text-center">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Xu của bạn</p>
                                            <div className="flex items-center gap-1.5 justify-center">
                                                <Coins className="h-4 w-4 text-amber-500" />
                                                <span className="text-lg font-black text-foreground">{currentUserEntry.totalCoins?.toLocaleString() ?? 0}</span>
                                            </div>
                                        </div>
                                        <div className="h-10 w-[1px] bg-border/50" />
                                        <div className="text-center">
                                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Thứ hạng tuần</p>
                                            <div className="flex items-center gap-1.5 justify-center">
                                                <Trophy className="h-4 w-4 text-primary" />
                                                <span className="text-lg font-black text-foreground">Top {(currentUserEntry.rank || 100) <= 10 ? 'Elite' : 'Gold'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}
