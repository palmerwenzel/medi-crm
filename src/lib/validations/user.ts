/**
 * User validation schemas and types
 * Uses Zod for runtime validation
 */

import * as z from 'zod'
import { departmentEnum, staffSpecialtyEnum } from './case'
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
  department: z.enum(departmentEnum).nullable(),
})

export type StaffProfileInput = z.infer<typeof staffProfileSchema>

// Schema for admin updating staff assignments
export const staffAssignmentSchema = z.object({
  specialty: z.enum(staffSpecialtyEnum),
  department: z.enum(departmentEnum),
})

export type StaffAssignmentInput = z.infer<typeof staffAssignmentSchema>

// Full user type from database
export type UserResponse = Database['public']['Tables']['users']['Row'] 