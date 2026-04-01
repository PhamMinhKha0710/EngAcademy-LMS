import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ArrowRight, Coins, Flame, Sparkles, Star, Trophy, X } from 'lucide-react'

interface ActivitySuccessCelebrationOverlayProps {
    open: boolean
    title?: string
    subtitle?: string
    xpLabel?: string
    streakLabel?: string
    primaryLabel?: string
    secondaryLabel?: string
    onClose: () => void
    onPrimaryAction?: () => void
    onSecondaryAction?: () => void
}

export default function ActivitySuccessCelebrationOverlay({
    open,
    title = 'Tuyet voi!',
    subtitle = 'Ban da hoan thanh bai kiem tra thanh cong.',
    xpLabel = '+10 XP',
    streakLabel = '1 Ngay',
    primaryLabel = 'Tiep tuc hanh trinh',
    secondaryLabel = 'Xem chi tiet',
    onClose,
    onPrimaryAction,
    onSecondaryAction,
}: ActivitySuccessCelebrationOverlayProps) {
    const overlayRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!open) return
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [open, onClose])

    useEffect(() => {
        if (!open) return
        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = previousOverflow
        }
    }, [open])

    if (!open) return null

    return createPortal(
        <div
            ref={overlayRef}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4"
            onClick={(e) => {
                if (e.target === overlayRef.current) onClose()
            }}
        >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-[fadeIn_180ms_ease-out]" />

            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <Sparkles className="absolute top-[18%] left-[18%] w-8 h-8 text-yellow-300/90" />
                <Star className="absolute top-[24%] right-[20%] w-7 h-7 text-emerald-300/90" />
                <Trophy className="absolute bottom-[24%] left-[20%] w-8 h-8 text-amber-300/80" />
                <Flame className="absolute bottom-[20%] right-[18%] w-9 h-9 text-orange-300/80" />
                <div className="absolute top-[30%] left-[12%] w-3 h-3 rounded-full bg-rose-300/80" />
                <div className="absolute top-[20%] right-[10%] w-4 h-4 rotate-45 bg-sky-300/75" />
                <div className="absolute bottom-[26%] right-[12%] w-2 h-5 -rotate-12 bg-yellow-300/80" />
            </div>

            <div
                className="relative w-full max-w-md rounded-[28px] border shadow-2xl overflow-hidden animate-[slideUp_220ms_ease-out]"
                style={{ background: 'var(--color-bg)', borderColor: 'var(--color-border)' }}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 rounded-full p-2 transition-colors"
                    style={{ background: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}
                    aria-label="Dong thong bao"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="relative p-8 pb-6 text-center">
                    <div
                        className="mx-auto mb-5 w-24 h-24 rounded-full flex items-center justify-center"
                        style={{
                            background:
                                'radial-gradient(circle at 40% 30%, color-mix(in srgb, var(--color-primary) 45%, #fff 55%), color-mix(in srgb, var(--color-primary) 82%, #f59e0b 18%))',
                        }}
                    >
                        <Trophy className="w-11 h-11 text-white" />
                    </div>
                    <h2 className="text-3xl font-extrabold" style={{ color: 'var(--color-text)' }}>
                        {title}
                    </h2>
                    <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                        {subtitle}
                    </p>
                </div>

                <div className="px-8 pb-6">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-2xl border p-4 text-center" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                            <div className="flex items-center justify-center gap-1.5">
                                <Coins className="w-5 h-5 text-amber-500" />
                                <span className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{xpLabel}</span>
                            </div>
                            <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                                Diem thuong
                            </p>
                        </div>
                        <div className="rounded-2xl border p-4 text-center" style={{ background: 'var(--color-bg-secondary)', borderColor: 'var(--color-border)' }}>
                            <div className="flex items-center justify-center gap-1.5">
                                <Flame className="w-5 h-5 text-orange-500" />
                                <span className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{streakLabel}</span>
                            </div>
                            <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                                Chuoi hoc
                            </p>
                        </div>
                    </div>
                </div>

                <div className="px-8 pb-8">
                    <button
                        onClick={onPrimaryAction || onClose}
                        className="w-full rounded-full py-3.5 px-5 font-semibold text-white inline-flex items-center justify-center gap-2 transition-all hover:brightness-105"
                        style={{ background: 'var(--color-primary)' }}
                    >
                        {primaryLabel}
                        <ArrowRight className="w-4 h-4" />
                    </button>
                    <div className="mt-3 text-center">
                        <button
                            onClick={onSecondaryAction || onClose}
                            className="text-sm font-semibold transition-colors hover:opacity-80"
                            style={{ color: 'var(--color-text-secondary)' }}
                        >
                            {secondaryLabel}
                        </button>
                    </div>
                </div>

                <div
                    className="h-1.5 w-full"
                    style={{
                        background:
                            'linear-gradient(to right, var(--color-primary), #facc15, var(--color-primary))',
                    }}
                />
            </div>
        </div>,
        document.body
    )
}
