import { create } from 'zustand'

export interface UIStore {
    isSidebarOpen: boolean
    toggleSidebar: () => void
    setSidebarOpen: (isOpen: boolean) => void
}

export const useUIStore = create<UIStore>((set) => ({
    isSidebarOpen: false,
    toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
    setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
}))
