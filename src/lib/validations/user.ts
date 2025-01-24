/**
 * User validation schemas and types
 * Uses Zod for runtime validation
 */

import { z } from 'zod'
import { caseDepartmentEnum, staffSpecialtyEnum } from './case'
import type { Database } from '@/types/supabase'

export const userRoleEnum = ['admin', 'staff', 'patient'] as const
export type UserRole = (typeof userRoleEnum)[number]

// Schema for creating/updating a user profile
export const userProfileSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(50),
  last_name: z.string().min(1, 'Last name is required').max(50),
  email: z.string().email('Invalid email address'),
})

export type UserProfileInput = z.infer<typeof userProfileSchema>

// Schema for staff profile with specialty and department
export const staffProfileSchema = userProfileSchema.extend({
  specialty: z.enum(staffSpecialtyEnum).nullable(),
  department: z.enum(caseDepartmentEnum).nullable(),
})

export type StaffProfileInput = z.infer<typeof staffProfileSchema>

// Schema for admin updating staff assignments
export const staffAssignmentSchema = z.object({
  specialty: z.enum(staffSpecialtyEnum),
  department: z.enum(caseDepartmentEnum),
})

export type StaffAssignmentInput = z.infer<typeof staffAssignmentSchema>

// Full user type from database
export type UserResponse = Database['public']['Tables']['users']['Row']

// User validation schemas
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.enum(['admin', 'patient', 'staff']),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  specialty: z.enum(staffSpecialtyEnum).nullable(),
  department: z.enum(caseDepartmentEnum).nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
})

export type User = z.infer<typeof userSchema> 