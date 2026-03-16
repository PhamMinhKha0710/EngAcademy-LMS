import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
    id: string
    message: string
    type: ToastType
    duration?: number
}

interface ToastStore {
    toasts: Toast[]
    addToast: (toast: Omit<Toast, 'id'>) => void
    removeToast: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
    toasts: [],
    addToast: (toast) => {
        const id = Math.random().toString(36).substring(2, 9)
        let added = false

        set((state) => {
            const isDuplicate = state.toasts.some(
                (t) => t.message === toast.message && t.type === toast.type
            )

            if (isDuplicate) {
                return state
            }

            added = true
            return {
                toasts: [...state.toasts, { ...toast, id }],
            }
        })

        if (!added) {
            return
        }

        // Auto remove toast
        const duration = toast.duration || 3000
        setTimeout(() => {
            set((state) => ({
                toasts: state.toasts.filter((t) => t.id !== id),
            }))
        }, duration)
    },
    removeToast: (id) =>
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        })),
}))
