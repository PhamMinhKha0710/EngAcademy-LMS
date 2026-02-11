import { ReactNode } from 'react'

interface EmptyStateProps {
    icon: ReactNode
    title: string
    description?: string
    action?: ReactNode
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
                style={{ backgroundColor: 'var(--color-bg-secondary)' }}
            >
                <div className="text-slate-400">{icon}</div>
            </div>
            <h3
                className="text-lg font-semibold mb-2"
                style={{ color: 'var(--color-text)' }}
            >
                {title}
            </h3>
            {description && (
                <p
                    className="text-sm max-w-sm mb-6"
                    style={{ color: 'var(--color-text-secondary)' }}
                >
                    {description}
                </p>
            )}
            {action && <div>{action}</div>}
        </div>
    )
}
