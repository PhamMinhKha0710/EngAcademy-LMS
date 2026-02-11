import { useMemo } from 'react'
import { useAppSelector } from '@/app/hooks'
import { isAdmin, isSchool, hasRole, getRoleLabel, getRoleBadge, canAccessAdminPanel } from '@/lib/roles'

/**
 * Custom hook providing role-based utilities.
 * Uses the current user's roles from Redux store.
 */
export function useRole() {
    const { user } = useAppSelector((state) => state.auth)
    const roles = useMemo(() => user?.roles || [], [user?.roles])

    return useMemo(
        () => ({
            roles,
            isAdmin: isAdmin(roles),
            isSchool: isSchool(roles),
            canAccessAdminPanel: canAccessAdminPanel(roles),
            hasRole: (role: string) => hasRole(roles, role),
            roleLabel: getRoleLabel(roles),
            roleBadge: getRoleBadge(roles),
        }),
        [roles]
    )
}
