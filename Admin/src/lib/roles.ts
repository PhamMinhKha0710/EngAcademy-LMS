// ============================================================
// Role constants and helper functions
// ============================================================

export const ROLES = {
    ADMIN: 'ROLE_ADMIN',
    SCHOOL: 'ROLE_SCHOOL',
    TEACHER: 'ROLE_TEACHER',
    STUDENT: 'ROLE_STUDENT',
} as const

/** Allowed roles that can access the Admin panel */
export const ADMIN_PANEL_ROLES = [ROLES.ADMIN, ROLES.SCHOOL] as const

export function hasRole(userRoles: string[], role: string): boolean {
    return userRoles.includes(role)
}

export function isAdmin(userRoles: string[]): boolean {
    return hasRole(userRoles, ROLES.ADMIN)
}

export function isSchool(userRoles: string[]): boolean {
    return hasRole(userRoles, ROLES.SCHOOL)
}

export function canAccessAdminPanel(userRoles: string[]): boolean {
    return isAdmin(userRoles) || isSchool(userRoles)
}

/** Get a display label for the user's highest role */
export function getRoleLabel(userRoles: string[]): string {
    if (isAdmin(userRoles)) return 'Quản trị hệ thống'
    if (isSchool(userRoles)) return 'Quản lý trường học'
    return 'Không xác định'
}

/** Get a short badge label */
export function getRoleBadge(userRoles: string[]): string {
    if (isAdmin(userRoles)) return 'Admin'
    if (isSchool(userRoles)) return 'School'
    return 'N/A'
}
