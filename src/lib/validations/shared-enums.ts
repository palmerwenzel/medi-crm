import { z } from 'zod'
import type { DbConversationStatus } from '@/types/domain/db'

/**
 * Because Database['public']['Enums'] is only a type, we must define
 * each enum's values as a literal array, while still tying them to
 * the DB enum type for type safety. Then we build a Zod enum from
 * that array.
 */

const caseActivityTypeValues = [
  'status_change',
  'priority_change',
  'category_change',
  'department_change',
  'assignment_change',
  'note_added',
  'file_added',
  'file_removed',
  'metadata_change',
] as const
export const caseActivityTypeEnum = z.enum(caseActivityTypeValues)

const caseCategoryValues = [
  'general',
  'followup',
  'prescription',
  'test_results',
  'emergency',
] as const
export const caseCategoryEnum = z.enum(caseCategoryValues)

const casePriorityValues = [
  'low',
  'medium',
  'high',
  'urgent',
] as const
export const casePriorityEnum = z.enum(casePriorityValues)

const caseStatusValues = [
  'open',
  'in_progress',
  'resolved',
] as const
export const caseStatusEnum = z.enum(caseStatusValues)

type ConversationStatus = DbConversationStatus
const conversationStatusValues = [
  'active',
  'archived',
] as const
export const conversationStatusEnum = z.enum(conversationStatusValues)

const departmentValues = [
  'primary_care',
  'specialty_care',
  'emergency',
  'surgery',
  'mental_health',
  'admin',
] as const
export const departmentEnum = z.enum(departmentValues)

const messageRoleValues = [
  'user',
  'assistant'
] as const
export const messageRoleEnum = z.enum(messageRoleValues)

const notificationChannelValues = [
  'in_app',
  'email',
  'browser',
] as const
export const notificationChannelEnum = z.enum(notificationChannelValues)

const notificationPriorityValues = [
  'low',
  'medium',
  'high',
  'urgent',
] as const
export const notificationPriorityEnum = z.enum(notificationPriorityValues)

const notificationTypeValues = [
  'new_message',
  'case_assigned',
  'case_updated',
  'emergency_alert',
  'handoff_request',
] as const
export const notificationTypeEnum = z.enum(notificationTypeValues)

const staffSpecialtyValues = [
  'general_practice',
  'pediatrics',
  'cardiology',
  'neurology',
  'orthopedics',
  'dermatology',
  'psychiatry',
  'oncology',
] as const
export const staffSpecialtyEnum = z.enum(staffSpecialtyValues)

const userRoleValues = [
  'admin',
  'staff',
  'patient',
] as const
export const userRoleEnum = z.enum(userRoleValues)
