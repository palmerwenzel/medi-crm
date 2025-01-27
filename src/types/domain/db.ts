import type { Database } from '../supabase'

// Database table types
export type DbCase = Database['public']['Tables']['cases']['Row']
export type DbCaseInsert = Database['public']['Tables']['cases']['Insert']
export type DbCaseUpdate = Database['public']['Tables']['cases']['Update']

export type DbUser = Database['public']['Tables']['users']['Row']
export type DbUserInsert = Database['public']['Tables']['users']['Insert']
export type DbUserUpdate = Database['public']['Tables']['users']['Update']

export type DbNotification = Database['public']['Tables']['notifications']['Row']
export type DbNotificationInsert = Database['public']['Tables']['notifications']['Insert']
export type DbNotificationUpdate = Database['public']['Tables']['notifications']['Update']

export type DbNotificationPreference = Database['public']['Tables']['notification_preferences']['Row']
export type DbNotificationPreferenceInsert = Database['public']['Tables']['notification_preferences']['Insert']
export type DbNotificationPreferenceUpdate = Database['public']['Tables']['notification_preferences']['Update']

// Database enum types
export type DbUserRole = Database['public']['Enums']['user_role']
export type DbStaffSpecialty = Database['public']['Enums']['staff_specialty']
export type DbDepartment = Database['public']['Enums']['department']
export type DbCaseStatus = Database['public']['Enums']['case_status']
export type DbCasePriority = Database['public']['Enums']['case_priority']
export type DbCaseCategory = Database['public']['Enums']['case_category']
export type DbConversationStatus = Database['public']['Enums']['conversation_status']
export type DbMessageRole = Database['public']['Enums']['message_role']
export type DbNotificationType = Database['public']['Enums']['notification_type']
export type DbNotificationPriority = Database['public']['Enums']['notification_priority']
export type DbNotificationChannel = Database['public']['Enums']['notification_channel'] 