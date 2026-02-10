import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'

interface ProtectedRouteProps {
    allowedRoles?: string[]
    children?: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles, children }) => {
    const { isAuthenticated, user } = useAppSelector((state) => state.auth)
    const location = useLocation()

    // Not authenticated → redirect to login
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // Check role if required
    if (allowedRoles && allowedRoles.length > 0) {
        const userRoles = user?.roles || []
        const hasRequiredRole = allowedRoles.some((role) => userRoles.includes(role))

        if (!hasRequiredRole) {
            return <Navigate to="/unauthorized" replace />
        }
    }

    return children ? <>{children}</> : <Outlet />
}

export default ProtectedRoute
