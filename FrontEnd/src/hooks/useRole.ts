import { useMemo } from 'react'
import { useAuthStore } from '../store/authStore'
import { isStudent, isTeacher, isAdmin, hasRole, getRoleLabel, getRoleDashboard } from '../lib/roles'

export function useRole() {
    const user = useAuthStore((s) => s.user)
    const roles = useMemo(() => user?.roles || [], [user?.roles])
    return useMemo(() => ({
        roles,
        isStudent: isStudent(roles),
        isTeacher: isTeacher(roles),
        isAdmin: isAdmin(roles),
        hasRole: (r: string) => hasRole(roles, r),
        roleLabel: getRoleLabel(roles),
        dashboardPath: getRoleDashboard(roles),
    }), [roles])
}
