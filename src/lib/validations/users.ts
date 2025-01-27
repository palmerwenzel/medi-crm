import { z } from 'zod'
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
})

export type UsersRow = z.infer<typeof usersRowSchema>

export const usersInsertSchema = z.object({
  id: z.string(),
  email: z.string(),
  role: userRoleEnum.optional(),
  first_name: z.string().nullable().optional(),
  last_name: z.string().nullable().optional(),
  specialty: staffSpecialtyEnum.nullable().optional(),
  department: departmentEnum.nullable().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
})

export type UsersInsert = z.infer<typeof usersInsertSchema>

export const usersUpdateSchema = usersInsertSchema.partial()
export type UsersUpdate = z.infer<typeof usersUpdateSchema>