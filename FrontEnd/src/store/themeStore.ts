import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
    isDark: boolean
    toggle: () => void
    setDark: (value: boolean) => void
}

// Initialize theme on load (call before React renders)
export function initTheme() {
    const stored = localStorage.getItem('theme-storage')
    if (stored) {
        try {
            const { state } = JSON.parse(stored)
            if (state?.isDark) document.documentElement.classList.add('dark')
            else document.documentElement.classList.remove('dark')
        } catch {
            document.documentElement.classList.add('dark')
        }
    } else {
        document.documentElement.classList.add('dark')
    }
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            isDark: true,
            toggle: () =>
                set((state) => {
                    const next = !state.isDark
                    document.documentElement.classList.toggle('dark', next)
                    return { isDark: next }
                }),
            setDark: (value: boolean) => {
                document.documentElement.classList.toggle('dark', value)
                set({ isDark: value })
            },
        }),
        {
            name: 'theme-storage',
            onRehydrateStorage: () => (state) => {
                if (state) {
                    document.documentElement.classList.toggle('dark', state.isDark)
                }
            },
        }
    )
)
