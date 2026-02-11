import { ReactNode } from 'react'

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default'

interface BadgeProps {
    variant?: BadgeVariant
    children: ReactNode
}

const variantClasses: Record<BadgeVariant, string> = {
    success: 'bg-green-500/15 text-green-400 border-green-500/25',
    warning: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/25',
    danger: 'bg-red-500/15 text-red-400 border-red-500/25',
    info: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
    default: 'bg-slate-500/15 text-slate-400 border-slate-500/25',
}

export default function Badge({ variant = 'default', children }: BadgeProps) {
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variantClasses[variant]}`}
        >
            {children}
        </span>
    )
}
