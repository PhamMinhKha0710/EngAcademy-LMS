import { useToastStore, Toast as ToastType } from '../../store/toastStore'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { useEffect, useState } from 'react'

const getIcon = (type: ToastType['type']) => {
    switch (type) {
        case 'success': return <CheckCircle className="w-5 h-5 text-emerald-500" />
        case 'error': return <XCircle className="w-5 h-5 text-red-500" />
        case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />
        case 'info': return <Info className="w-5 h-5 text-blue-500" />
    }
}

const getStyles = (type: ToastType['type']) => {
    switch (type) {
        case 'success': return 'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-900/10'
        case 'error': return 'border-red-500/50 bg-red-50 dark:bg-red-900/10'
        case 'warning': return 'border-yellow-500/50 bg-yellow-50 dark:bg-yellow-900/10'
        case 'info': return 'border-blue-500/50 bg-blue-50 dark:bg-blue-900/10'
    }
}

const ToastItem = ({ toast }: { toast: ToastType }) => {
    const removeToast = useToastStore(state => state.removeToast)
    const [isExiting, setIsExiting] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true)
        }, (toast.duration || 3000) - 300)

        return () => clearTimeout(timer)
    }, [toast.duration])

    return (
        <div
            className={`
                flex items-center p-4 mb-3 rounded-xl border shadow-lg backdrop-blur-sm
                transition-all duration-300 pointer-events-auto
                ${isExiting ? 'opacity-0 translate-x-12' : 'animate-slide-in-right'}
                ${getStyles(toast.type)}
            `}
            role="alert"
        >
            <div className="shrink-0 mr-3">{getIcon(toast.type)}</div>
            <p className="text-sm font-medium flex-1 text-gray-800 dark:text-gray-200">
                {toast.message}
            </p>
            <button
                onClick={() => {
                    setIsExiting(true)
                    setTimeout(() => removeToast(toast.id), 300)
                }}
                className="ml-4 shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
                <X className="w-4 h-4 text-gray-500" />
            </button>
        </div>
    )
}

export const ToastContainer = () => {
    const toasts = useToastStore(state => state.toasts)

    return (
        <div className="fixed top-20 right-4 z-[100] w-full max-w-sm pointer-events-none flex flex-col items-end">
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} />
            ))}
        </div>
    )
}

export default ToastContainer
