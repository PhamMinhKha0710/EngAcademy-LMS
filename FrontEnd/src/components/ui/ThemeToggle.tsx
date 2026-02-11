import { Sun, Moon } from 'lucide-react'
import { useThemeStore } from '../../store/themeStore'

export default function ThemeToggle() {
    const { isDark, toggle } = useThemeStore()
    return (
        <button
            onClick={toggle}
            className="p-2 rounded-lg transition-colors hover:bg-black/10 dark:hover:bg-white/10"
            title={isDark ? 'Chế độ sáng' : 'Chế độ tối'}
        >
            {isDark ? (
                <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
                <Moon className="w-5 h-5 text-slate-600" />
            )}
        </button>
    )
}
