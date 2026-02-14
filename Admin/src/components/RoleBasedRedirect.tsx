import { Navigate } from 'react-router-dom'
import { useAppSelector } from '@/app/hooks'
import { isAdmin, isSchool } from '@/lib/roles'

/**
 * Smart redirect component that redirects users to their role-specific home page
 */
export default function RoleBasedRedirect() {
    const { user } = useAppSelector((state) => state.auth)
    const roles = user?.roles || []

    // Redirect based on role
    if (isAdmin(roles)) {
        return <Navigate to="/schools" replace />
    } else if (isSchool(roles)) {
        return <Navigate to="/students" replace />
    }

    // Default: redirect to login if no valid role
    return <Navigate to="/login" replace />
}
