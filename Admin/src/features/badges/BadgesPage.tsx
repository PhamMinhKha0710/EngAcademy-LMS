import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Award, Search, Trash2, ShieldCheck, Loader2, ImageIcon } from 'lucide-react'
import { AxiosError } from 'axios'
import api from '@/lib/api'
import type { ApiResponse, BadgeResponse } from '@/types/api'
import { toast } from 'sonner'

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
            toast.error('Vui lòng điền User ID, tên huy hiệu và mô tả')
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
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, 'Cấp huy hiệu thất bại'))
        } finally {
            setAwarding(false)
        }
    }

    const fetchBadges = async () => {
        if (!viewUserId.trim()) {
            toast.error('Vui lòng nhập User ID')
            return
        }
        setLoadingBadges(true)
        try {
            const response = await api.get<ApiResponse<BadgeResponse[]>>(
                `/badges/users/${viewUserId}`
            )
            setBadges(response.data.data)
            setHasLoaded(true)
            if (response.data.data.length === 0) {
                toast.info('Người dùng chưa có huy hiệu nào')
            }
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
            toast.success('Xóa huy hiệu thành công!')
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, 'Xóa huy hiệu thất bại'))
        } finally {
            setDeleteDialogOpen(false)
            setDeletingBadge(null)
        }
    }

    const handleCheckAchievements = async () => {
        if (!checkUserId.trim()) {
            toast.error('Vui lòng nhập User ID')
            return
        }
        setChecking(true)
        try {
            const response = await api.post<ApiResponse<{ message?: string }>>(
                `/badges/${checkUserId}/check-achievements`
            )
            const data = response.data
            toast.success(data.message || 'Kiểm tra thành tích hoàn tất!')
        } catch (error: unknown) {
            toast.error(getErrorMessage(error, 'Kiểm tra thành tích thất bại'))
        } finally {
            setChecking(false)
        }
    }

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return '—'
        try {
            return new Date(dateStr).toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            })
        } catch {
            return dateStr
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Quản lý huy hiệu</h1>
                <p className="text-muted-foreground mt-1">Cấp và quản lý huy hiệu cho người dùng</p>
            </div>

            {/* Award Badge Form */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        Cấp huy hiệu
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label>User ID *</Label>
                            <Input
                                type="number"
                                placeholder="Nhập User ID"
                                value={awardUserId}
                                onChange={(e) => setAwardUserId(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Tên huy hiệu *</Label>
                            <Input
                                placeholder="VD: First Login, 7-Day Streak"
                                value={badgeName}
                                onChange={(e) => setBadgeName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Mô tả *</Label>
                            <Input
                                placeholder="Mô tả huy hiệu"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Icon URL (tùy chọn)</Label>
                            <Input
                                placeholder="https://example.com/icon.png"
                                value={iconUrl}
                                onChange={(e) => setIconUrl(e.target.value)}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <Button onClick={handleAwardBadge} disabled={awarding} className="gap-2">
                                {awarding ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Award className="h-4 w-4" />
                                )}
                                {awarding ? 'Đang xử lý...' : 'Cấp huy hiệu'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Check Achievements */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                        <ShieldCheck className="h-5 w-5 text-primary" />
                        Kiểm tra thành tích
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-3">
                        <Input
                            type="number"
                            placeholder="Nhập User ID"
                            value={checkUserId}
                            onChange={(e) => setCheckUserId(e.target.value)}
                            className="max-w-xs"
                            onKeyDown={(e) => e.key === 'Enter' && handleCheckAchievements()}
                        />
                        <Button onClick={handleCheckAchievements} disabled={checking} className="gap-2">
                            {checking ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <ShieldCheck className="h-4 w-4" />
                            )}
                            {checking ? 'Đang kiểm tra...' : 'Kiểm tra thành tích'}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* View Badges */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-primary" />
                        Danh sách huy hiệu
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="relative flex-1 max-w-xs">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="number"
                                placeholder="Nhập User ID"
                                value={viewUserId}
                                onChange={(e) => setViewUserId(e.target.value)}
                                className="pl-9"
                                onKeyDown={(e) => e.key === 'Enter' && fetchBadges()}
                            />
                        </div>
                        <Button onClick={fetchBadges} disabled={loadingBadges} className="gap-2">
                            {loadingBadges ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Search className="h-4 w-4" />
                            )}
                            Tải huy hiệu
                        </Button>
                    </div>

                    {loadingBadges ? (
                        <div className="flex items-center justify-center h-40">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                        </div>
                    ) : !hasLoaded ? (
                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                            <Award className="h-10 w-10 mb-2 opacity-50" />
                            <p>Nhập User ID và nhấn "Tải huy hiệu" để xem</p>
                        </div>
                    ) : badges.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                            <Award className="h-10 w-10 mb-2 opacity-50" />
                            <p>Người dùng chưa có huy hiệu nào</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {badges.map((badge) => (
                                <Card key={badge.id} className="relative group">
                                    <CardContent className="p-4">
                                        <div className="flex items-start gap-3">
                                            <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                                {badge.iconUrl ? (
                                                    <img
                                                        src={badge.iconUrl}
                                                        alt={badge.name}
                                                        className="w-8 h-8 rounded object-cover"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.display = 'none'
                                                            ;(e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden')
                                                        }}
                                                    />
                                                ) : (
                                                    <Award className="h-6 w-6 text-primary" />
                                                )}
                                                {badge.iconUrl && (
                                                    <ImageIcon className="h-6 w-6 text-primary hidden" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-sm truncate">{badge.name}</h3>
                                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                                    {badge.description}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {formatDate(badge.earnedAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                                            onClick={() => {
                                                setDeletingBadge(badge)
                                                setDeleteDialogOpen(true)
                                            }}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa huy hiệu</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc muốn xóa huy hiệu "{deletingBadge?.name}"? Hành động này không thể hoàn tác.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                            Hủy
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteBadge}>
                            Xóa
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
