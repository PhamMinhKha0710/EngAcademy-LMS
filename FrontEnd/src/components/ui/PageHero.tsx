import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface PageHeroProps {
    title: string
    subtitle?: string
    icon?: ReactNode
    iconBg?: 'primary' | 'success' | 'amber' | 'violet'
    children?: ReactNode
}

const iconBgClasses = {
    primary: 'bg-primary-500/15 text-primary-500',
    success: 'bg-success-500/15 text-success-500',
    amber: 'bg-amber-500/15 text-amber-500',
    violet: 'bg-violet-500/15 text-violet-500',
}

export default function PageHero({ title, subtitle, icon, iconBg = 'primary', children }: PageHeroProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="relative rounded-2xl overflow-hidden"
            style={{ background: 'var(--color-bg-secondary)' }}
        >
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary-500/10 dark:bg-primary-500/5 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-success-500/10 dark:bg-success-500/5 blur-3xl" />
            <div className="relative px-6 py-8 sm:px-8 sm:py-10">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    <div className="flex items-start gap-4">
                        {icon && (
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 min-w-[56px] min-h-[56px] ${iconBgClasses[iconBg]}`}>
                                {icon}
                            </div>
                        )}
                        <div>
                            <h1 className="text-h1 sm:text-display" style={{ color: 'var(--color-text)' }}>
                                {title}
                            </h1>
                            {subtitle && (
                                <p className="mt-2 text-body-lg" style={{ color: 'var(--color-text-secondary)' }}>
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    </div>
                    {children && <div className="shrink-0">{children}</div>}
                </div>
            </div>
        </motion.div>
    )
}
