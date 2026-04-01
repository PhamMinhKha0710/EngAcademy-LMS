import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ArrowRight, Crown, Gift, Sparkles, Star, X } from 'lucide-react'

interface LevelUpCelebrationNotificationProps {
    open: boolean
    previousLevel: number
    newLevel: number
    xpGained?: number
    currentXp?: number
    levelXpCap?: number
    onClose: () => void
    onPrimaryAction?: () => void
}

export default function LevelUpCelebrationNotification({
    open,
    previousLevel,
    newLevel,
    xpGained = 0,
    currentXp = 0,
    levelXpCap = 500,
    onClose,
    onPrimaryAction,
}: LevelUpCelebrationNotificationProps) {
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

    const progress = Math.min((currentXp / Math.max(levelXpCap, 1)) * 100, 100)
    const rewards = [
        { title: 'Badge moi', subtitle: 'Chuoi hoc tap' },
        { title: 'Thuong xu', subtitle: `+${xpGained} xu` },
        { title: 'Mo khoa cap do', subtitle: `Level ${newLevel}` },
    ]

    return createPortal(
        <div
            ref={overlayRef}
            className="fixed inset-0 z-[140] flex items-center justify-center p-4"
            onClick={(event) => {
                if (event.target === overlayRef.current) onClose()
            }}
        >
            <div className="absolute inset-0 bg-[#120b1a]/85 backdrop-blur-sm" />
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <Sparkles className="absolute top-[18%] left-[16%] w-9 h-9 text-violet-300/80" />
                <Star className="absolute top-[22%] right-[18%] w-8 h-8 text-yellow-300/85" />
                <Sparkles className="absolute bottom-[24%] left-[22%] w-8 h-8 text-pink-300/80" />
                <Star className="absolute bottom-[20%] right-[20%] w-8 h-8 text-amber-300/85" />
            </div>

            <div className="relative w-full max-w-4xl rounded-3xl overflow-hidden border border-white/15 bg-[#251a33]/95 shadow-2xl text-white animate-[slideUp_220ms_ease-out]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 rounded-full p-2 bg-white/10 hover:bg-white/20 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                <div className="px-6 md:px-10 pt-10 pb-8 bg-gradient-to-b from-violet-500/30 to-transparent text-center">
                    <p className="text-sm uppercase tracking-[0.18em] text-violet-200 font-semibold">LEVEL UP</p>
                    <h2 className="mt-2 text-3xl md:text-5xl font-extrabold">Chuc mung ban da len cap!</h2>
                    <p className="mt-3 text-violet-100/90">
                        Tu Level {previousLevel} len Level {newLevel} - tiep tuc de mo khoa them phan thuong.
                    </p>

                    <div className="mt-8 inline-flex items-center justify-center w-36 h-36 rounded-full border-[6px] border-yellow-300 bg-[#191022] shadow-[0_0_40px_rgba(250,204,21,0.35)]">
                        <Crown className="absolute -mt-24 w-10 h-10 text-yellow-300" />
                        <span className="text-6xl font-black text-white">{newLevel}</span>
                    </div>
                </div>

                <div className="px-6 md:px-10 pb-8 space-y-6">
                    <div>
                        <div className="flex items-center justify-between text-sm mb-2 text-slate-200">
                            <span>Tien do level hien tai</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-3 rounded-full bg-[#1a1223] overflow-hidden border border-white/10">
                            <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-300" style={{ width: `${progress}%` }} />
                        </div>
                        <p className="mt-2 text-xs text-slate-300">
                            XP: {currentXp}/{levelXpCap}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {rewards.map((reward) => (
                            <div key={reward.title} className="rounded-xl border border-white/10 bg-white/5 p-4">
                                <div className="w-10 h-10 rounded-lg bg-violet-500/25 flex items-center justify-center mb-2">
                                    <Gift className="w-5 h-5 text-yellow-300" />
                                </div>
                                <p className="font-bold">{reward.title}</p>
                                <p className="text-xs text-slate-300 mt-1">{reward.subtitle}</p>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={onPrimaryAction || onClose}
                        className="w-full max-w-sm mx-auto flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 bg-violet-500 hover:bg-violet-400 font-semibold transition-colors"
                    >
                        Tuyet voi
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>,
        document.body
    )
}
