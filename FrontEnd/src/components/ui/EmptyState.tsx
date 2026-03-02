import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface EmptyStateProps {
    icon: ReactNode
    title: string
    description?: string
    action?: ReactNode
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl border border-dashed"
            style={{
                backgroundColor: 'var(--color-bg-secondary)',
                borderColor: 'var(--color-border)',
            }}
        >
            <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-200 hover:scale-105"
                style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
            >
                <div className="text-primary-500 opacity-90">{icon}</div>
            </div>
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                {title}
            </h3>
            {description && (
                <p className="text-sm max-w-sm mb-6 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                    {description}
                </p>
            )}
            {action && <div className="flex justify-center">{action}</div>}
        </motion.div>
    )
}
