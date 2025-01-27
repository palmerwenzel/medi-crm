import type { Database } from '../supabase'
import type { UsersRow, UsersInsert, UsersUpdate } from '@/lib/validations/users'
import type { DbUserRole, DbStaffSpecialty, DbDepartment } from './db'

// Branded type for type safety
export type UserId = string & { readonly __brand: unique symbol }

// Base user role from database
export type UserRole = DbUserRole
export type StaffSpecialty = DbStaffSpecialty

// Base user interface extending from validation schema
export interface User extends Omit<UsersRow, 'created_at' | 'updated_at'> {
  id: UserId
  createdAt: Date  // Transformed to Date object
  updatedAt: Date  // Transformed to Date object
}

// Auth-specific user type
export interface AuthUser extends User {
  accessToken: string
  refreshToken: string
}

// Helper type for user with optional auth fields
export type UserWithAuth = User & Partial<Omit<AuthUser, keyof User>>

/**
 * Represents a staff member in the system with their specialties
 */
export interface StaffMember extends Omit<User, 'role'> {
  role: Extract<UserRole, 'staff'>
  specialty: StaffSpecialty | null
  department: DbDepartment | null
} 