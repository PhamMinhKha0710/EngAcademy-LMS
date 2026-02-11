export const ROLES = {
    ADMIN: 'ROLE_ADMIN',
    SCHOOL: 'ROLE_SCHOOL',
    TEACHER: 'ROLE_TEACHER',
    STUDENT: 'ROLE_STUDENT',
} as const

export function hasRole(roles: string[], role: string): boolean {
    return roles.includes(role)
}
export function isStudent(roles: string[]): boolean {
    return hasRole(roles, ROLES.STUDENT)
}
export function isTeacher(roles: string[]): boolean {
    return hasRole(roles, ROLES.TEACHER)
}
export function isAdmin(roles: string[]): boolean {
    return hasRole(roles, ROLES.ADMIN)
}
export function getRoleLabel(roles: string[]): string {
    if (isAdmin(roles)) return 'Admin'
    if (isTeacher(roles)) return 'Giáo viên'
    if (isStudent(roles)) return 'Học sinh'
    return 'N/A'
}
export function getRoleDashboard(roles: string[]): string {
    if (isTeacher(roles)) return '/teacher/dashboard'
    return '/dashboard'
}
