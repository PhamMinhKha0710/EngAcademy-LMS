interface ProgressBarProps {
    value: number
    color?: string
    height?: string
    showLabel?: boolean
}

export default function ProgressBar({
    value,
    height = 'h-2',
    showLabel = false,
}: ProgressBarProps) {
    const clampedValue = Math.min(100, Math.max(0, value))

    return (
        <div className="w-full">
            {showLabel && (
                <div className="flex justify-between items-center mb-1">
                    <span
                        className="text-sm font-medium"
                        style={{ color: 'var(--color-text-secondary)' }}
                    >
                        Tiến độ
                    </span>
                    <span
                        className="text-sm font-semibold"
                        style={{ color: 'var(--color-text)' }}
                    >
                        {Math.round(clampedValue)}%
                    </span>
                </div>
            )}
            <div
                className={`w-full ${height} rounded-full overflow-hidden`}
                style={{ backgroundColor: 'var(--color-bg-secondary)' }}
            >
                <div
                    className={`${height} rounded-full bg-primary-500 transition-all duration-500 ease-out`}
                    style={{ width: `${clampedValue}%` }}
                />
            </div>
        </div>
    )
}
