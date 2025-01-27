import { z } from 'zod'
import type { DbUser, DbUserInsert, DbUserUpdate } from '@/types/domain/db'
import {
  userRoleEnum,
  departmentEnum,
  staffSpecialtyEnum
} from '@/lib/validations/shared-enums'

export const usersRowSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: userRoleEnum,
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  specialty: staffSpecialtyEnum.nullable(),
  department: departmentEnum.nullable(),
  created_at: z.string(),
  updated_at: z.string(),
}) satisfies z.ZodType<DbUser>

export type UsersRow = z.infer<typeof usersRowSchema>

export const usersInsertSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: userRoleEnum,
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  specialty: staffSpecialtyEnum.nullable().optional(),
  department: departmentEnum.nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
}) satisfies z.ZodType<DbUserInsert>

export type UsersInsert = z.infer<typeof usersInsertSchema>

export const usersUpdateSchema = usersInsertSchema.partial() satisfies z.ZodType<DbUserUpdate>
export type UsersUpdate = z.infer<typeof usersUpdateSchema>