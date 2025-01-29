import type { DbUser, DbUserRole, DbStaffSpecialty, DbDepartment } from './db'

/**
 * Domain types for user management, including authentication,
 * staff specialties, and role-based access control.
 */

/**
 * Branded type for user IDs to ensure type safety across the application.
 * Prevents mixing of regular strings with user IDs.
 */
export type UserId = string & { readonly __brand: unique symbol }

/**
 * Core user type definitions from database layer
 */
export type UserRole = DbUserRole            // User roles (e.g., 'patient', 'staff', 'admin')
export type StaffSpecialty = DbStaffSpecialty // Medical specialties for staff members

/**
 * Core user interface with transformed date fields.
 * Extends database user type but converts string dates to Date objects.
 */
export interface User extends Omit<DbUser, 'created_at' | 'updated_at'> {
  id: UserId
  createdAt: Date  // Transformed to Date object
  updatedAt: Date  // Transformed to Date object
}

/**
 * Types for user operations
 */

/**
 * Required fields for creating a new user
 */
export type UserInsert = Partial<DbUser> & {
  email: string    // User's email address (required)
  role: UserRole   // User's role in the system
}

/**
 * Fields that can be updated for an existing user
 */
export type UserUpdate = Partial<UserInsert>

/**
 * Extended user type with authentication tokens.
 * Used during active user sessions.
 */
export interface AuthUser extends User {
  accessToken: string    // JWT access token
  refreshToken: string   // JWT refresh token
}

/**
 * User type with optional auth fields.
 * Used when auth information may or may not be available.
 */
export type UserWithAuth = User & Partial<Omit<AuthUser, keyof User>>

/**
 * Represents a staff member in the system with their specialties.
 * Includes department assignment and medical specialty.
 */
export interface StaffMember extends Omit<User, 'role'> {
  role: Extract<UserRole, 'staff'>     // Restricted to staff role only
  specialty: StaffSpecialty | null     // Medical specialty (if any)
  department: DbDepartment | null      // Assigned department
} 