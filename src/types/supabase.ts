export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'staff' | 'patient'
          first_name: string | null
          last_name: string | null
          specialty: 'general_practice' | 'pediatrics' | 'cardiology' | 'neurology' | 'orthopedics' | 'dermatology' | 'psychiatry' | 'oncology' | null
          department: 'primary_care' | 'specialty_care' | 'emergency' | 'surgery' | 'mental_health' | 'admin' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          role?: 'admin' | 'staff' | 'patient'
          first_name?: string | null
          last_name?: string | null
          specialty?: 'general_practice' | 'pediatrics' | 'cardiology' | 'neurology' | 'orthopedics' | 'dermatology' | 'psychiatry' | 'oncology' | null
          department?: 'primary_care' | 'specialty_care' | 'emergency' | 'surgery' | 'mental_health' | 'admin' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'staff' | 'patient'
          first_name?: string | null
          last_name?: string | null
          specialty?: 'general_practice' | 'pediatrics' | 'cardiology' | 'neurology' | 'orthopedics' | 'dermatology' | 'psychiatry' | 'oncology' | null
          department?: 'primary_care' | 'specialty_care' | 'emergency' | 'surgery' | 'mental_health' | 'admin' | null
          created_at?: string
          updated_at?: string
        }
      }
      cases: {
        Row: {
          id: string
          patient_id: string
          title: string
          description: string
          status: 'open' | 'in_progress' | 'resolved'
          priority: 'low' | 'medium' | 'high' | 'urgent'
          category: 'general' | 'followup' | 'prescription' | 'test_results' | 'emergency'
          department: 'primary_care' | 'specialty_care' | 'emergency' | 'surgery' | 'mental_health' | 'admin' | null
          metadata: Json
          internal_notes: string | null
          attachments: Json
          assigned_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          patient_id: string
          title: string
          description: string
          status?: 'open' | 'in_progress' | 'resolved'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          category?: 'general' | 'followup' | 'prescription' | 'test_results' | 'emergency'
          department?: 'primary_care' | 'specialty_care' | 'emergency' | 'surgery' | 'mental_health' | 'admin' | null
          metadata?: Json
          internal_notes?: string | null
          attachments?: Json
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          patient_id?: string
          title?: string
          description?: string
          status?: 'open' | 'in_progress' | 'resolved'
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          category?: 'general' | 'followup' | 'prescription' | 'test_results' | 'emergency'
          department?: 'primary_care' | 'specialty_care' | 'emergency' | 'surgery' | 'mental_health' | 'admin' | null
          metadata?: Json
          internal_notes?: string | null
          attachments?: Json
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      case_history: {
        Row: {
          id: string
          case_id: string
          actor_id: string
          action: string
          details: Json
          created_at: string
        }
        Insert: {
          id?: string
          case_id: string
          actor_id: string
          action: string
          details: Json
          created_at?: string
        }
        Update: {
          id?: string
          case_id?: string
          actor_id?: string
          action?: string
          details?: Json
          created_at?: string
        }
      }
      webhooks: {
        Row: {
          id: string
          url: string
          secret: string
          description: string | null
          events: string[]
          created_by: string
          created_at: string
          updated_at: string
          is_active: boolean
          last_triggered_at: string | null
          failure_count: number
        }
        Insert: {
          id?: string
          url: string
          secret: string
          description?: string | null
          events: string[]
          created_by: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
          last_triggered_at?: string | null
          failure_count?: number
        }
        Update: {
          id?: string
          url?: string
          secret?: string
          description?: string | null
          events?: string[]
          created_by?: string
          created_at?: string
          updated_at?: string
          is_active?: boolean
          last_triggered_at?: string | null
          failure_count?: number
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 