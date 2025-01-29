import type { Database } from '../supabase'

// Database table types
export type DbCase = Database['public']['Tables']['cases']['Row']
export type DbCaseInsert = Database['public']['Tables']['cases']['Insert']
export type DbCaseUpdate = Database['public']['Tables']['cases']['Update']

export type DbCaseAssessment = Database['public']['Tables']['case_assessments']['Row']
export type DbCaseAssessmentInsert = Database['public']['Tables']['case_assessments']['Insert']
export type DbCaseAssessmentUpdate = Database['public']['Tables']['case_assessments']['Update']

export type DbCaseNote = Database['public']['Tables']['case_notes']['Row']
export type DbCaseNoteInsert = Database['public']['Tables']['case_notes']['Insert']
export type DbCaseNoteUpdate = Database['public']['Tables']['case_notes']['Update']

export type DbCaseHistory = Database['public']['Tables']['case_history']['Row']
export type DbCaseHistoryInsert = Database['public']['Tables']['case_history']['Insert']
export type DbCaseHistoryUpdate = Database['public']['Tables']['case_history']['Update']

export type DbUser = Database['public']['Tables']['users']['Row']
export type DbUserInsert = Database['public']['Tables']['users']['Insert']
export type DbUserUpdate = Database['public']['Tables']['users']['Update']

export type DbNotification = Database['public']['Tables']['notifications']['Row']
export type DbNotificationInsert = Database['public']['Tables']['notifications']['Insert']
export type DbNotificationUpdate = Database['public']['Tables']['notifications']['Update']

export type DbNotificationPreference = Database['public']['Tables']['notification_preferences']['Row']
export type DbNotificationPreferenceInsert = Database['public']['Tables']['notification_preferences']['Insert']
export type DbNotificationPreferenceUpdate = Database['public']['Tables']['notification_preferences']['Update']

export type DbWebhook = Database['public']['Tables']['webhooks']['Row']
export type DbWebhookInsert = Database['public']['Tables']['webhooks']['Insert']
export type DbWebhookUpdate = Database['public']['Tables']['webhooks']['Update']

export type DbMedicalMessage = Database['public']['Tables']['medical_messages']['Row']
export type DbMedicalMessageInsert = Database['public']['Tables']['medical_messages']['Insert']
export type DbMedicalMessageUpdate = Database['public']['Tables']['medical_messages']['Update']

export type DbMedicalConversation = Database['public']['Tables']['medical_conversations']['Row']
export type DbMedicalConversationInsert = Database['public']['Tables']['medical_conversations']['Insert']
export type DbMedicalConversationUpdate = Database['public']['Tables']['medical_conversations']['Update']

// Database function types
export type DbClaimCaseArgs = Database['public']['Functions']['claim_case']['Args']
export type DbClaimCaseReturns = Database['public']['Functions']['claim_case']['Returns']

export type DbSendNotificationArgs = Database['public']['Functions']['send_notification']['Args']
export type DbSendNotificationReturns = Database['public']['Functions']['send_notification']['Returns']

export type DbSyncMissingUsersArgs = Database['public']['Functions']['sync_missing_users']['Args']
export type DbSyncMissingUsersReturns = Database['public']['Functions']['sync_missing_users']['Returns']

// GraphQL function types
export type DbGraphQLArgs = Database['graphql_public']['Functions']['graphql']['Args']
export type DbGraphQLReturns = Database['graphql_public']['Functions']['graphql']['Returns']

// Database enum types
export type DbCaseActivityType = Database['public']['Enums']['case_activity_type']
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
export type DbAssessmentCreatorType = Database['public']['Enums']['assessment_creator_type']
export type DbAssessmentStatus = Database['public']['Enums']['assessment_status'] 