import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Award, Search, Trash2, ShieldCheck, Loader2, Info, Plus, UserCircle, Star, Sparkles, Clock } from 'lucide-react'
import { AxiosError } from 'axios'
import api from '@/lib/api'
import type { ApiResponse, BadgeResponse } from '@/types/api'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

function getErrorMessage(error: unknown, fallback: string): string {
    return error instanceof AxiosError && error.response?.data?.message
        ? String(error.response.data.message)
        : fallback
}

export default function BadgesPage() {
    // Award badge form state
    const [awardUserId, setAwardUserId] = useState('')
    const [badgeName, setBadgeName] = useState('')
    const [description, setDescription] = useState('')
    const [iconUrl, setIconUrl] = useState('')
    const [awarding, setAwarding] = useState(false)

    // View badges state
    const [viewUserId, setViewUserId] = useState('')
    const [badges, setBadges] = useState<BadgeResponse[]>([])
    const [loadingBadges, setLoadingBadges] = useState(false)
    const [hasLoaded, setHasLoaded] = useState(false)

    // Check achievements state
    const [checkUserId, setCheckUserId] = useState('')
    const [checking, setChecking] = useState(false)

    // Delete confirmation dialog
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [deletingBadge, setDeletingBadge] = useState<BadgeResponse | null>(null)

    const handleAwardBadge = async () => {
        if (!awardUserId.trim() || !badgeName.trim() || !description.trim()) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc')
            return
        }
        setAwarding(true)
        try {
            const params: Record<string, string> = { description }
            if (iconUrl.trim()) {
                params.iconUrl = iconUrl
            }
            await api.post(
                `/badges/${awardUserId}/award/${encodeURIComponent(badgeName)}`,
                null,
                { params }
            )
            toast.success('Cấp huy hiệu thành công!')
            setBadgeName('')
            setDescription('')
            setIconUrl('')
            // Refresh if viewing the same user
            if (viewUserId === awardUserId) fetchBadges()
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, 'Cấp huy hiệu thất bại'))
        } finally {
            setAwarding(false)
        }
    }

    const fetchBadges = async () => {
        if (!viewUserId.trim()) {
            toast.error('Vui lòng nhập Username/ID')
            return
        }
        setLoadingBadges(true)
        try {
            const response = await api.get<ApiResponse<BadgeResponse[]>>(
                `/badges/users/${viewUserId}`
            )
            setBadges(response.data.data)
            setHasLoaded(true)
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, 'Không thể tải danh sách huy hiệu'))
            setBadges([])
            setHasLoaded(true)
        } finally {
            setLoadingBadges(false)
        }
    }

    const handleDeleteBadge = async () => {
        if (!deletingBadge) return
        try {
            await api.delete(`/badges/${deletingBadge.id}`)
            setBadges((prev) => prev.filter((b) => b.id !== deletingBadge.id))
            toast.success('Đã thu hồi huy hiệu thành công!')
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, 'Thu hồi huy hiệu thất bại'))
        } finally {
            setDeleteDialogOpen(false)
            setDeletingBadge(null)
        }
    }

    const handleCheckAchievements = async () => {
        if (!checkUserId.trim()) {
            toast.error('Vui lòng nhập Username/ID')
            return
        }
        setChecking(true)
        try {
            const response = await api.post<ApiResponse<{ message?: string }>>(
                `/badges/${checkUserId}/check-achievements`
            )
            toast.success(response.data.message || 'Kiểm tra thành tích hoàn tất!')
            if (viewUserId === checkUserId) fetchBadges()
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, 'Kiểm tra thành tích thất bại'))
        } finally {
            setChecking(false)
        }
    }

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—'
        try {
            return new Date(dateStr).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            })
        } catch {
            return dateStr
        }
    }

    const stats = [
        { title: 'Tất cả huy hiệu', value: '12', icon: Award, color: 'text-primary', bg: 'bg-primary/10' },
        { title: 'Đã cấp tuần này', value: '145', icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { title: 'Người dùng đạt giải', value: '82%', icon: Star, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    ]

    return (
        <div className="space-y-8 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Quản lý huy hiệu</h1>
                    <p className="text-muted-foreground mt-2 font-medium">Công cụ vinh danh và công nhận nỗ lực của các học viên xuất sắc.</p>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.title} className="premium-card overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center", stat.bg)}>
                                    <stat.icon className={cn("h-6 w-6", stat.color)} />
                                </div>
                                <div className="flex flex-col">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">{stat.title}</p>
                                    <p className="text-2xl font-black mt-1.5">{stat.value}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Badge List */}
                <div className="lg:col-span-8 space-y-6">
                    <Card className="premium-card border-none shadow-xl dark:shadow-none overflow-hidden min-h-[600px] flex flex-col">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center justify-between flex-wrap gap-4">
                                <div>
                                    <CardTitle className="text-xl font-black">Bộ sưu tập huy hiệu</CardTitle>
                                    <p className="text-muted-foreground text-sm font-medium">Nhập thông tin người dùng để xem các cột mốc họ đã đạt được.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="relative group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                        <Input 
                                            placeholder="Username người dùng..." 
                                            value={viewUserId}
                                            onChange={(e) => setViewUserId(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && fetchBadges()}
                                            className="h-10 pl-10 w-52 rounded-xl bg-muted/30 border-border/50 focus-visible:ring-primary/20 font-bold text-xs"
                                        />
                                    </div>
                                    <Button size="sm" onClick={fetchBadges} disabled={loadingBadges} className="rounded-xl h-10 px-4 font-bold bg-foreground text-background hover:opacity-90">
                                        {loadingBadges ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4 mr-2" />}
                                        TRA CỨU
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-2 flex-1 flex flex-col">
                            {loadingBadges ? (
                                <div className="flex flex-col items-center justify-center flex-1 gap-4 py-20">
                                    <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                                    <p className="font-bold text-muted-foreground/60">Đang truy xuất kho huy hiệu...</p>
                                </div>
                            ) : !hasLoaded ? (
                                <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground/30 py-20">
                                    <Award className="h-24 w-24 mb-4 opacity-10" />
                                    <p className="text-lg font-black italic text-center">Hãy nhập username để khám phá<br/>những thành tựu của họ</p>
                                </div>
                            ) : badges.length === 0 ? (
                                <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground/30 py-20">
                                    <Info className="h-24 w-24 mb-4 opacity-10" />
                                    <p className="text-lg font-black italic text-center text-muted-foreground/60">Người dùng này chưa có thành tựu nào.<br/><span className="text-sm font-bold text-muted-foreground/40 not-italic">Hãy cấp cho họ huy hiệu đầu tiên!</span></p>
                                </div>
                            ) : (
                                <div className="grid gap-6 sm:grid-cols-2">
                                    {badges.map((badge) => (
                                        <div key={badge.id} className="group relative bg-card border border-border/50 rounded-3xl p-6 hover:border-primary/20 hover:shadow-xl dark:hover:shadow-none transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    className="h-8 w-8 rounded-full text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => {
                                                        setDeletingBadge(badge)
                                                        setDeleteDialogOpen(true)
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="flex items-center gap-5">
                                                <div className="relative">
                                                     <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center shadow-inner overflow-hidden border border-border/20">
                                                        {badge.iconUrl ? (
                                                            <img src={badge.iconUrl} alt={badge.name} className="h-10 w-10 object-contain drop-shadow-md" />
                                                        ) : (
                                                            <Award className="h-8 w-8 text-primary" />
                                                        )}
                                                    </div>
                                                    <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-background shadow-sm flex items-center justify-center border border-border/20">
                                                        <Sparkles className="h-3 w-3 text-amber-500" />
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-black text-foreground leading-tight mb-1">{badge.name}</h3>
                                                    <p className="text-xs font-bold text-muted-foreground/40 mb-2 line-clamp-1">#ID_{badge.id}</p>
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="h-3 w-3 text-primary/60" />
                                                        <span className="text-[10px] font-black text-primary uppercase tracking-widest">{formatDate(badge.earnedAt)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-5 p-4 bg-muted/30 rounded-2xl">
                                                <p className="text-sm font-medium text-muted-foreground italic leading-relaxed">"{badge.description}"</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Sidebar Actions */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Award Badge Section */}
                    <Card className="premium-card border-none shadow-xl dark:shadow-none overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4">
                                <Award className="h-5 w-5 text-amber-500" />
                            </div>
                            <CardTitle className="text-lg font-black">Cấp huy hiệu mới</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-2 space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider ml-1">Người nhận (Username)</Label>
                                <div className="relative">
                                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input 
                                        placeholder="student_01" 
                                        value={awardUserId}
                                        onChange={(e) => setAwardUserId(e.target.value)}
                                        className="h-11 pl-9 rounded-xl border-border/50 bg-muted/30 font-bold"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider ml-1">Tên huy hiệu</Label>
                                <Input 
                                    placeholder="VD: Nhà vô địch" 
                                    value={badgeName}
                                    onChange={(e) => setBadgeName(e.target.value)}
                                    className="h-11 rounded-xl border-border/50 bg-muted/30 font-bold"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider ml-1">Mô tả lý do</Label>
                                <Input 
                                    placeholder="VD: Đạt 100 điểm tuyệt đối..." 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="h-11 rounded-xl border-border/50 bg-muted/30 font-medium text-sm"
                                />
                            </div>
                            <div className="space-y-1.5 pb-2">
                                <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-wider ml-1">URL Biểu tượng (Tùy chọn)</Label>
                                <Input 
                                    placeholder="https://..." 
                                    value={iconUrl}
                                    onChange={(e) => setIconUrl(e.target.value)}
                                    className="h-11 rounded-xl border-border/50 bg-muted/30 font-medium text-xs"
                                />
                            </div>
                            <Button 
                                onClick={handleAwardBadge} 
                                disabled={awarding}
                                className="w-full h-12 rounded-xl font-black bg-primary shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all gap-2"
                            >
                                {awarding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-5 w-5" />}
                                CẤP HUY HIỆU
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Check Achievement Section */}
                    <Card className="premium-card border-none shadow-xl dark:shadow-none overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                            </div>
                            <CardTitle className="text-lg font-black">Xét duyệt tự động</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-2 space-y-4">
                            <p className="text-xs font-medium text-muted-foreground leading-relaxed mb-4">
                                Chạy trình kiểm tra để tự động cấp huy hiệu dựa trên các tiêu chí (streak, điểm số, bài học).
                            </p>
                            <Input 
                                placeholder="Username người dùng..." 
                                value={checkUserId}
                                onChange={(e) => setCheckUserId(e.target.value)}
                                className="h-11 rounded-xl border-border/50 bg-muted/30 font-bold"
                            />
                            <Button 
                                variant="outline" 
                                onClick={handleCheckAchievements} 
                                disabled={checking}
                                className="w-full h-12 rounded-xl font-black border-border hover:bg-muted gap-2 transition-all bg-background"
                            >
                                {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-5 w-5" />}
                                KIỂM TRA NGAY
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="rounded-3xl max-w-sm">
                    <DialogHeader className="items-center text-center">
                        <div className="h-14 w-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
                            <Trash2 className="h-7 w-7 text-destructive" />
                        </div>
                        <DialogTitle className="text-xl font-black leading-tight">Xác nhận thu hồi</DialogTitle>
                        <DialogDescription className="font-medium pt-2 text-muted-foreground">
                            Bạn có chắc chắn muốn thu hồi huy hiệu <span className="text-foreground font-bold">"{deletingBadge?.name}"</span>? Thao tác này sẽ gỡ huy hiệu khỏi hồ sơ người dùng.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-2 mt-4">
                        <Button variant="destructive" onClick={handleDeleteBadge} className="h-12 rounded-xl font-black text-base">XÁC NHẬN THU HỒI</Button>
                        <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)} className="h-12 rounded-xl font-bold text-muted-foreground">HỦY BỎ</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
