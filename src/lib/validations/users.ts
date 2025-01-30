import { z } from 'zod'
import type { User, UserInsert, UserUpdate } from '@/types/domain/users'
import type { DbUser } from '@/types/domain/db'
import {
  userRoleEnum,
  departmentEnum,
  staffSpecialtyEnum
} from '@/lib/validations/shared-enums'
import { rawToUserIdSchema } from './shared-schemas'

// Base database schema
const dbUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: userRoleEnum,
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  specialty: staffSpecialtyEnum.nullable(),
  department: departmentEnum.nullable(),
  created_at: z.string(),
  updated_at: z.string()
}) satisfies z.ZodType<DbUser>

// Transform to domain type
export const usersRowSchema = dbUserSchema.transform((dbUser): User => ({
  id: dbUser.id as User['id'],
  email: dbUser.email,
  role: dbUser.role,
  first_name: dbUser.first_name,
  last_name: dbUser.last_name,
  specialty: dbUser.specialty,
  department: dbUser.department,
  createdAt: new Date(dbUser.created_at),
  updatedAt: new Date(dbUser.updated_at)
}))

export type UsersRow = z.infer<typeof usersRowSchema>

// Insert schema (for domain -> database)
export const usersInsertSchema = z.object({
  email: z.string(),
  role: userRoleEnum
}).extend({
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  specialty: staffSpecialtyEnum.nullable().optional(),
  department: departmentEnum.nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  id: z.string().optional()
}) satisfies z.ZodType<UserInsert>

export type UsersInsert = z.infer<typeof usersInsertSchema>

// Update schema
export const usersUpdateSchema = usersInsertSchema.partial() satisfies z.ZodType<UserUpdate>
export type UsersUpdate = z.infer<typeof usersUpdateSchema>