import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface CardProps {
    children: ReactNode
    className?: string
    hover?: boolean
}

export default function Card({ children, className = '', hover = true }: CardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            whileHover={hover ? { scale: 1.02 } : undefined}
            className={`card ${!hover ? 'hover:bg-[var(--color-card)]' : ''} ${className}`}
        >
            {children}
        </motion.div>
    )
}
