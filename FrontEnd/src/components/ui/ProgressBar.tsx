import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'

interface ProgressBarProps {
  value: number
  height?: 'h-2' | 'h-3' | 'h-4' | string
  showLabel?: boolean
  label?: string
  showPercentage?: boolean
  gradientStart?: string
  gradientEnd?: string
  className?: string
  isAnimating?: boolean
  variant?: 'default' | 'gradient' | 'streak' | 'success'
  completed?: boolean
}

export default function ProgressBar({
  value,
  height = 'h-3',
  showLabel = false,
  label = 'Tiến độ',
  showPercentage = false,
  gradientStart = 'bg-primary-500',
  gradientEnd = 'to-amber-400',
  className = '',
  isAnimating = false,
  variant = 'default',
  completed = false,
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value))
  const ref = useRef<HTMLDivElement>(null)
  const isComplete = Math.round(clampedValue) === 100

  const getBarClasses = () => {
    switch (variant) {
      case 'gradient':
        return `bg-gradient-to-r ${gradientStart} ${gradientEnd}`
      case 'streak':
        return 'bg-gradient-to-r from-amber-500 to-orange-500'
      case 'success':
        return 'bg-gradient-to-r from-emerald-500 to-teal-600'
      default:
        return 'bg-primary-500'
    }
  }

  const barClasses = `${getBarClasses()} transition-all duration-700 ease-out ${isComplete ? 'shadow-glow' : ''}`

  useEffect(() => {
    if (ref.current && isComplete) {
      ref.current.style.setProperty('--glow-intensity', '1')
    }
  }, [isComplete])

  return (
    <div className={`w-full ${className}`}>
      {(showLabel || showPercentage) && (
        <div className="flex justify-between items-center mb-1.5 px-0.5">
          {showLabel && (
            <span className="text-sm font-medium text-[var(--color-text-secondary)]">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-sm font-semibold text-[var(--color-text)]">
              {Math.round(clampedValue)}%
            </span>
          )}
        </div>
      )}
      <div
        className={`w-full ${height} rounded-full overflow-hidden relative`}
        style={{ backgroundColor: 'var(--color-bg-secondary)' }}
      >
        <motion.div
          ref={ref}
          className={`${height} rounded-full ${barClasses}`}
          initial={{ width: 0 }}
          animate={{ width: `${clampedValue}%` }}
          transition={{
            duration: 0.8,
            ease: [0.25, 0.46, 0.45, 0.94],
            type: 'spring'
          }}
        />
        {completed && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
        {isAnimating && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer rounded-full" />
        )}
      </div>
      <style jsx>{`
        @keyframes glow {
          0% { box-shadow: 0 0 5px currentColor; }
          100% { box-shadow: 0 0 20px currentColor, 0 0 30px currentColor; }
        }
        .shadow-glow {
          animation: glow 0.6s ease-in-out;
          box-shadow: 0 0 20px var(--color-primary-glow);
        }
        .animate-shimmer {
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  )
}

