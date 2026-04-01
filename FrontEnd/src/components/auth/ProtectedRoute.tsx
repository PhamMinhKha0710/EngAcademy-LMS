import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useRole } from '../../hooks/useRole'

interface Props {
    allowedRoles?: string[]
    children?: React.ReactNode
}

export default function ProtectedRoute({ allowedRoles, children }: Props) {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
    const { roles, dashboardPath } = useRole()
    const location = useLocation()

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (allowedRoles && allowedRoles.length > 0) {
        const hasRequired = allowedRoles.some((r) => roles.includes(r))
        if (!hasRequired) {
            return <Navigate to={dashboardPath} replace />
        }
    }

    return children ? <>{children}</> : <Outlet />
}
