export interface CaseMetadata {
  source?: 'web' | 'mobile' | 'phone'
  tags?: string[]
  custom_fields?: Record<string, string | number | boolean>
  last_contact?: string
  follow_up_date?: string
}

export interface CaseHistoryDetails {
  previous_status?: 'open' | 'in_progress' | 'resolved'
  new_status?: 'open' | 'in_progress' | 'resolved'
  previous_assigned_to?: string
  new_assigned_to?: string
  comment?: string
  changes?: Record<string, { old: unknown; new: unknown }>
}

export interface Database {
  public: {
    Tables: {
      cases: {
        Row: {
          id: string
          title: string
          description: string
          status: 'open' | 'in_progress' | 'resolved'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          category: 'general' | 'followup' | 'prescription' | 'test_results' | 'emergency'
          department: 'admin' | 'emergency' | 'primary_care' | 'specialty_care' | 'surgery' | 'mental_health'
          patient_id: string
          assigned_to: string | null
          created_at: string
          updated_at: string
          metadata: CaseMetadata | null
          attachments: string[]
          internal_notes: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          status?: 'open' | 'in_progress' | 'resolved'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          category?: 'general' | 'followup' | 'prescription' | 'test_results' | 'emergency'
          department: 'admin' | 'emergency' | 'primary_care' | 'specialty_care' | 'surgery' | 'mental_health'
          patient_id: string
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
          metadata?: CaseMetadata | null
          attachments?: string[]
          internal_notes?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          status?: 'open' | 'in_progress' | 'resolved'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          category?: 'general' | 'followup' | 'prescription' | 'test_results' | 'emergency'
          department?: 'admin' | 'emergency' | 'primary_care' | 'specialty_care' | 'surgery' | 'mental_health'
          patient_id?: string
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
          metadata?: CaseMetadata | null
          attachments?: string[]
          internal_notes?: string | null
        }
      }
      case_history: {
        Row: {
          id: string
          case_id: string
          user_id: string
          action: 'created' | 'updated' | 'assigned' | 'commented'
          details: CaseHistoryDetails
          created_at: string
        }
        Insert: {
          id?: string
          case_id: string
          user_id: string
          action: 'created' | 'updated' | 'assigned' | 'commented'
          details: CaseHistoryDetails
          created_at?: string
        }
        Update: {
          id?: string
          case_id?: string
          user_id?: string
          action?: 'created' | 'updated' | 'assigned' | 'commented'
          details?: CaseHistoryDetails
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'patient' | 'staff'
          first_name: string | null
          last_name: string | null
          specialty: 'general_practice' | 'pediatrics' | 'cardiology' | 'neurology' | 'orthopedics' | 'dermatology' | 'psychiatry' | 'oncology' | null
          department: 'admin' | 'emergency' | 'primary_care' | 'specialty_care' | 'surgery' | 'mental_health' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          role?: 'admin' | 'patient' | 'staff'
          first_name?: string | null
          last_name?: string | null
          specialty?: 'general_practice' | 'pediatrics' | 'cardiology' | 'neurology' | 'orthopedics' | 'dermatology' | 'psychiatry' | 'oncology' | null
          department?: 'admin' | 'emergency' | 'primary_care' | 'specialty_care' | 'surgery' | 'mental_health' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'patient' | 'staff'
          first_name?: string | null
          last_name?: string | null
          specialty?: 'general_practice' | 'pediatrics' | 'cardiology' | 'neurology' | 'orthopedics' | 'dermatology' | 'psychiatry' | 'oncology' | null
          department?: 'admin' | 'emergency' | 'primary_care' | 'specialty_care' | 'surgery' | 'mental_health' | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 