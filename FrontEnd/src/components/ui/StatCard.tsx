import { ReactNode } from 'react'

interface StatCardProps {
    icon: ReactNode
    label: string
    value: string | number
    change?: string
    color: string
}

export default function StatCard({ icon, label, value, change, color }: StatCardProps) {
    const isPositive = change?.startsWith('+')
    const isNegative = change?.startsWith('-')

    return (
        <div className="card p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-current/10 ${color}`}>
                    {icon}
                </div>
            </div>
            <div className="mt-4">
                <p className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                    {value}
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    {label}
                </p>
            </div>
            {change && (
                <div className="mt-3 flex items-center gap-1">
                    <span
                        className={`text-sm font-medium ${
                            isPositive
                                ? 'text-green-400'
                                : isNegative
                                  ? 'text-red-400'
                                  : 'text-slate-400'
                        }`}
                    >
                        {change}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                        so với tuần trước
                    </span>
                </div>
            )}
        </div>
    )
}
