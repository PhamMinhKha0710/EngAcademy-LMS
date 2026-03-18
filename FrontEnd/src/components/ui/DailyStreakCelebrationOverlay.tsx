import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ArrowRight, Check, Flame, Share2, X } from 'lucide-react'

interface DailyStreakCelebrationOverlayProps {
    open: boolean
    streakDays: number
    onClose: () => void
    onContinue?: () => void
    onShare?: () => void
}

export default function DailyStreakCelebrationOverlay({
    open,
    streakDays,
    onClose,
    onContinue,
    onShare,
}: DailyStreakCelebrationOverlayProps) {
    const overlayRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!open) return
        const onEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', onEsc)
        return () => document.removeEventListener('keydown', onEsc)
    }, [open, onClose])

    useEffect(() => {
        if (!open) return
        const oldOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = oldOverflow
        }
    }, [open])

    if (!open) return null

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    const completedInWeek = Math.min(streakDays % 7 || 7, 7)
    const milestoneGoal = Math.ceil((streakDays + 1) / 10) * 10
    const milestoneProgress = Math.min((streakDays / milestoneGoal) * 100, 100)

    return createPortal(
        <div
            ref={overlayRef}
            className="fixed inset-0 z-[130] flex items-center justify-center p-4"
            onClick={(event) => {
                if (event.target === overlayRef.current) onClose()
            }}
        >
            <div className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
            <div
                className="relative w-full max-w-4xl rounded-3xl border shadow-2xl overflow-hidden animate-[slideUp_220ms_ease-out]"
                style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 rounded-full p-2"
                    style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="h-1.5 bg-gradient-to-r from-orange-300 via-[var(--color-primary)] to-yellow-400" />

                <div className="px-6 md:px-12 py-8 text-center">
                    <div className="relative inline-flex items-center justify-center w-40 h-40 md:w-52 md:h-52 rounded-full mb-6 bg-gradient-to-b from-orange-400 to-[var(--color-primary)] text-white border-4 border-orange-200 shadow-2xl">
                        <Flame className="absolute -top-5 w-12 h-12 text-yellow-200" />
                        <Flame className="w-20 h-20" />
                        <span className="absolute bottom-8 text-4xl md:text-5xl font-black">{streakDays}</span>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-extrabold" style={{ color: 'var(--color-text)' }}>
                        Ban dang vao phong do!
                    </h2>
                    <p className="mt-2 text-base md:text-lg" style={{ color: 'var(--color-text-secondary)' }}>
                        Ban da hoc lien tiep {streakDays} ngay. Tiep tuc de mo khoa moc thuong tiep theo.
                    </p>
                </div>

                <div className="px-6 md:px-12 pb-8 space-y-6">
                    <div className="rounded-2xl border p-5" style={{ borderColor: 'var(--color-border)', background: 'var(--color-bg-secondary)' }}>
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                                Tuan nay
                            </span>
                            <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                                {completedInWeek}/7 ngay
                            </span>
                        </div>
                        <div className="grid grid-cols-7 gap-2 md:gap-3">
                            {weekDays.map((day, idx) => {
                                const done = idx < completedInWeek
                                return (
                                    <div key={day} className="text-center">
                                        <div
                                            className={`mx-auto w-10 h-10 md:w-12 md:h-12 rounded-full border-2 flex items-center justify-center ${
                                                done ? 'bg-orange-100 border-orange-400 text-orange-500' : 'bg-transparent border-slate-300 text-slate-400'
                                            }`}
                                        >
                                            {done ? <Check className="w-4 h-4 md:w-5 md:h-5" /> : <span className="text-xs">-</span>}
                                        </div>
                                        <p className="mt-1 text-[11px] font-semibold" style={{ color: 'var(--color-text-secondary)' }}>{day}</p>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span style={{ color: 'var(--color-text-secondary)' }}>
                                Moc tiep theo: {milestoneGoal} ngay
                            </span>
                            <span className="font-semibold" style={{ color: 'var(--color-text)' }}>
                                {milestoneGoal - streakDays} ngay nua
                            </span>
                        </div>
                        <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--color-bg-tertiary)' }}>
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-[var(--color-primary)] to-yellow-400"
                                style={{ width: `${milestoneProgress}%` }}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                            onClick={onContinue || onClose}
                            className="btn-secondary w-full inline-flex items-center justify-center gap-2"
                        >
                            <ArrowRight className="w-4 h-4" />
                            Tiep tuc hoc
                        </button>
                        <button
                            onClick={onShare || onClose}
                            className="btn-primary w-full inline-flex items-center justify-center gap-2"
                        >
                            <Share2 className="w-4 h-4" />
                            Chia se streak
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )
}
