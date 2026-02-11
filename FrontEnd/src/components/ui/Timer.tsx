import { useEffect, useState, useCallback } from 'react'
import { Clock } from 'lucide-react'

interface TimerProps {
    durationSeconds: number
    onTimeUp: () => void
    isPaused?: boolean
}

export default function Timer({ durationSeconds, onTimeUp, isPaused = false }: TimerProps) {
    const [remaining, setRemaining] = useState(durationSeconds)

    useEffect(() => {
        setRemaining(durationSeconds)
    }, [durationSeconds])

    const handleTimeUp = useCallback(() => {
        onTimeUp()
    }, [onTimeUp])

    useEffect(() => {
        if (isPaused || remaining <= 0) {
            if (remaining <= 0) {
                handleTimeUp()
            }
            return
        }

        const interval = setInterval(() => {
            setRemaining((prev) => {
                if (prev <= 1) {
                    clearInterval(interval)
                    return 0
                }
                return prev - 1
            })
        }, 1000)

        return () => clearInterval(interval)
    }, [isPaused, remaining, handleTimeUp])

    const minutes = Math.floor(remaining / 60)
    const seconds = remaining % 60
    const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

    const isWarning = remaining <= 60 && remaining > 10
    const isCritical = remaining <= 10

    const colorClass = isCritical
        ? 'text-red-500'
        : isWarning
          ? 'text-yellow-400'
          : 'text-white'

    const bgClass = isCritical
        ? 'bg-red-500/10 border-red-500/30'
        : isWarning
          ? 'bg-yellow-500/10 border-yellow-500/30'
          : 'bg-slate-800/50 border-slate-700/50'

    return (
        <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors duration-300 ${bgClass}`}
        >
            <Clock className={`w-4 h-4 ${colorClass}`} />
            <span
                className={`font-mono text-lg font-bold tabular-nums ${colorClass} ${
                    isCritical ? 'animate-pulse' : ''
                }`}
            >
                {formatted}
            </span>
        </div>
    )
}
