import type { UserRole } from '@/types/domain/users'

export function isAdminRole(role: UserRole): role is 'admin' {
  return role === 'admin'
}

export function isPatientRole(role: UserRole): role is 'patient' {
  return role === 'patient'
}

export function isStaffRole(role: UserRole): role is 'staff' {
  return role === 'staff'
} 