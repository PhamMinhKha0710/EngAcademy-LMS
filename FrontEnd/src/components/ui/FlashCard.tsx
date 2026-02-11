import { ReactNode, useState } from 'react'

interface FlashCardProps {
    front: ReactNode
    back: ReactNode
    onFlip?: (isFlipped: boolean) => void
}

export default function FlashCard({ front, back, onFlip }: FlashCardProps) {
    const [isFlipped, setIsFlipped] = useState(false)

    const handleFlip = () => {
        const next = !isFlipped
        setIsFlipped(next)
        onFlip?.(next)
    }

    return (
        <div
            className="w-full cursor-pointer select-none"
            style={{ perspective: '1000px' }}
            onClick={handleFlip}
        >
            <div
                className="relative w-full transition-transform duration-500"
                style={{
                    transformStyle: 'preserve-3d',
                    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    minHeight: '240px',
                }}
            >
                {/* Front */}
                <div
                    className="absolute inset-0 rounded-2xl p-8 flex flex-col items-center justify-center border shadow-lg"
                    style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        backgroundColor: 'var(--color-bg-secondary)',
                        borderColor: 'var(--color-bg-secondary)',
                        color: 'var(--color-text)',
                    }}
                >
                    <div className="text-center">{front}</div>
                    <p
                        className="mt-6 text-xs tracking-wide uppercase"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        Nhấn để lật
                    </p>
                </div>

                {/* Back */}
                <div
                    className="absolute inset-0 rounded-2xl p-8 flex flex-col items-center justify-center border shadow-lg"
                    style={{
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                        backgroundColor: 'var(--color-bg)',
                        borderColor: 'var(--color-bg-secondary)',
                        color: 'var(--color-text)',
                    }}
                >
                    <div className="text-center">{back}</div>
                    <p
                        className="mt-6 text-xs tracking-wide uppercase"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        Nhấn để lật lại
                    </p>
                </div>
            </div>
        </div>
    )
}
