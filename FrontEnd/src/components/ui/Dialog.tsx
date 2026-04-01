import { ReactNode, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface DialogProps {
    open: boolean
    onClose: () => void
    title: string
    children: ReactNode
    footer?: ReactNode
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full'
    className?: string
}

export default function Dialog({ open, onClose, title, children, footer, maxWidth = 'lg', className = '' }: DialogProps) {
    const overlayRef = useRef<HTMLDivElement>(null)

    // Close on Escape key
    useEffect(() => {
        if (!open) return

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [open, onClose])

    // Lock body scroll when open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [open])

    // Click outside to close
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === overlayRef.current) {
            onClose()
        }
    }

    if (!open) return null

    return createPortal(
        <div
            ref={overlayRef}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={handleOverlayClick}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-[fadeIn_150ms_ease-out]" />

            {/* Dialog */}
            <div
                className={`relative w-full max-w-${maxWidth} max-h-[90vh] rounded-2xl border shadow-2xl animate-[slideUp_200ms_ease-out] flex flex-col overflow-hidden ${className}`}
                style={{
                    backgroundColor: 'var(--color-bg)',
                    borderColor: 'var(--color-bg-secondary)',
                }}
            >
                {/* Header */}
                <div
                    className="flex items-center justify-between px-6 py-4 border-b"
                    style={{ borderColor: 'var(--color-bg-secondary)' }}
                >
                    <h2
                        className="text-lg font-semibold"
                        style={{ color: 'var(--color-text)' }}
                    >
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg transition-colors hover:bg-slate-700/50"
                    >
                        <X className="w-5 h-5" style={{ color: 'var(--color-text-secondary)' }} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 overflow-y-auto flex-1 custom-scrollbar" style={{ color: 'var(--color-text)' }}>
                    <style>{`
                        .custom-scrollbar::-webkit-scrollbar {
                            width: 6px;
                        }
                        .custom-scrollbar::-webkit-scrollbar-track {
                            background: transparent;
                        }
                        .custom-scrollbar::-webkit-scrollbar-thumb {
                            background: #475569;
                            border-radius: 10px;
                        }
                        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                            background: #64748b;
                        }
                    `}</style>
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <div
                        className="px-6 py-4 border-t flex items-center justify-end gap-3"
                        style={{ borderColor: 'var(--color-bg-secondary)' }}
                    >
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body
    )
}
