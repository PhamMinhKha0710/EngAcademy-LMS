import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatDate(dateString?: string | null) {
    if (!dateString) return '—'
    try {
        const date = new Date(dateString)
        if (isNaN(date.getTime())) return '—'
        return new Intl.DateTimeFormat('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date)
    } catch {
        return '—'
    }
}
