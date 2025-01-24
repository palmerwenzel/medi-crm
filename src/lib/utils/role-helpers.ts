export type UserRole = 'admin' | 'staff' | 'patient'

export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole)
}

export function requireRole(userRole: UserRole, allowedRoles: UserRole[]): void {
  if (!allowedRoles.includes(userRole)) {
    throw new Error('Forbidden: insufficient permissions.')
  }
}

// Convenience helpers for small sets of roles
export function requireAdmin(userRole: UserRole): void {
  requireRole(userRole, ['admin'])
}

export function requireStaff(userRole: UserRole): void {
  requireRole(userRole, ['staff'])
}

export function requirePatient(userRole: UserRole): void {
  requireRole(userRole, ['patient'])
}

export function requireStaffOrAdmin(userRole: UserRole): void {
  requireRole(userRole, ['staff', 'admin'])
}