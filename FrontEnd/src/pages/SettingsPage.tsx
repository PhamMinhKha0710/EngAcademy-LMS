import { useThemeStore } from '../store/themeStore'
import ThemeToggle from '../components/ui/ThemeToggle'
import {
    Palette,
} from 'lucide-react'

export default function SettingsPage() {
    const { isDark } = useThemeStore()

    return (
        <div className="p-6 lg:p-8 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
                    Cài đặt
                </h1>
                <p className="mt-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Tùy chỉnh giao diện ứng dụng
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
                {/* Sidebar tabs (Chỉ còn Giao diện) */}
                <div className="lg:w-56 shrink-0">
                    <nav className="flex lg:flex-col gap-1">
                        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors text-left bg-blue-600/15 text-blue-400">
                            <Palette className="w-4 h-4" />
                            Giao diện
                        </div>
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="card p-6">
                        <h2 className="text-lg font-semibold mb-5" style={{ color: 'var(--color-text)' }}>
                            Giao diện
                        </h2>

                        <div className="space-y-6">
                            {/* Theme toggle */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium" style={{ color: 'var(--color-text)' }}>
                                        Chế độ tối
                                    </p>
                                    <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
                                        {isDark ? 'Đang sử dụng giao diện tối' : 'Đang sử dụng giao diện sáng'}
                                    </p>
                                </div>
                                <ThemeToggle />
                            </div>

                            {/* Current theme info */}
                            <div
                                className="border-t pt-6"
                                style={{ borderColor: 'var(--color-bg-secondary)' }}
                            >
                                <p className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-secondary)' }}>
                                    Xem trước màu sắc
                                </p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {[
                                        { label: 'Nền', var: '--color-bg' },
                                        { label: 'Nền phụ', var: '--color-bg-secondary' },
                                        { label: 'Chữ', var: '--color-text' },
                                        { label: 'Chữ phụ', var: '--color-text-secondary' },
                                    ].map((c) => (
                                        <div
                                            key={c.var}
                                            className="rounded-xl border p-3 text-center"
                                            style={{ borderColor: 'var(--color-bg-secondary)' }}
                                        >
                                            <div
                                                className="w-8 h-8 rounded-lg mx-auto mb-2 border"
                                                style={{
                                                    backgroundColor: `var(${c.var})`,
                                                    borderColor: 'var(--color-bg-secondary)',
                                                }}
                                            />
                                            <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                                                {c.label}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
