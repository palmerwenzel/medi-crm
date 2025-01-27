export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      case_history: {
        Row: {
          activity_type: Database["public"]["Enums"]["case_activity_type"]
          actor_id: string
          case_id: string
          created_at: string
          id: string
          metadata: Json | null
          new_value: Json | null
          old_value: Json | null
        }
        Insert: {
          activity_type: Database["public"]["Enums"]["case_activity_type"]
          actor_id: string
          case_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
        }
        Update: {
          activity_type?: Database["public"]["Enums"]["case_activity_type"]
          actor_id?: string
          case_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          new_value?: Json | null
          old_value?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "case_history_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_history_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_actor"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_case"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      case_notes: {
        Row: {
          case_id: string
          content: string
          created_at: string
          id: string
          staff_id: string
          updated_at: string
        }
        Insert: {
          case_id: string
          content: string
          created_at?: string
          id?: string
          staff_id: string
          updated_at?: string
        }
        Update: {
          case_id?: string
          content?: string
          created_at?: string
          id?: string
          staff_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_notes_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_notes_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          assigned_to: string | null
          attachments: Json
          category: Database["public"]["Enums"]["case_category"]
          created_at: string
          department: Database["public"]["Enums"]["department"] | null
          description: string
          id: string
          internal_notes: string | null
          metadata: Json
          patient_id: string
          priority: Database["public"]["Enums"]["case_priority"]
          status: Database["public"]["Enums"]["case_status"]
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          attachments?: Json
          category?: Database["public"]["Enums"]["case_category"]
          created_at?: string
          department?: Database["public"]["Enums"]["department"] | null
          description: string
          id?: string
          internal_notes?: string | null
          metadata?: Json
          patient_id: string
          priority?: Database["public"]["Enums"]["case_priority"]
          status?: Database["public"]["Enums"]["case_status"]
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          attachments?: Json
          category?: Database["public"]["Enums"]["case_category"]
          created_at?: string
          department?: Database["public"]["Enums"]["department"] | null
          description?: string
          id?: string
          internal_notes?: string | null
          metadata?: Json
          patient_id?: string
          priority?: Database["public"]["Enums"]["case_priority"]
          status?: Database["public"]["Enums"]["case_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cases_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_conversations: {
        Row: {
          access: Json | null
          assigned_staff_id: string | null
          can_create_case: boolean | null
          case_id: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          patient_id: string
          status: Database["public"]["Enums"]["conversation_status"] | null
          topic: string | null
          updated_at: string | null
        }
        Insert: {
          access?: Json | null
          assigned_staff_id?: string | null
          can_create_case?: boolean | null
          case_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          patient_id: string
          status?: Database["public"]["Enums"]["conversation_status"] | null
          topic?: string | null
          updated_at?: string | null
        }
        Update: {
          access?: Json | null
          assigned_staff_id?: string | null
          can_create_case?: boolean | null
          case_id?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          patient_id?: string
          status?: Database["public"]["Enums"]["conversation_status"] | null
          topic?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_conversations_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          metadata: Json | null
          role: Database["public"]["Enums"]["message_role"]
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role: Database["public"]["Enums"]["message_role"]
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          role?: Database["public"]["Enums"]["message_role"]
        }
        Relationships: [
          {
            foreignKeyName: "medical_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "medical_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          channels: Database["public"]["Enums"]["notification_channel"][]
          created_at: string | null
          enabled: boolean
          id: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          channels?: Database["public"]["Enums"]["notification_channel"][]
          created_at?: string | null
          enabled?: boolean
          id?: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          channels?: Database["public"]["Enums"]["notification_channel"][]
          created_at?: string | null
          enabled?: boolean
          id?: string
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          priority: Database["public"]["Enums"]["notification_priority"]
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["notification_priority"]
          read_at?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["notification_priority"]
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          department: Database["public"]["Enums"]["department"] | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          role: Database["public"]["Enums"]["user_role"]
          specialty: Database["public"]["Enums"]["staff_specialty"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          department?: Database["public"]["Enums"]["department"] | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          specialty?: Database["public"]["Enums"]["staff_specialty"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          department?: Database["public"]["Enums"]["department"] | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          specialty?: Database["public"]["Enums"]["staff_specialty"] | null
          updated_at?: string
        }
        Relationships: []
      }
      webhooks: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          events: string[]
          failure_count: number
          id: string
          is_active: boolean
          last_triggered_at: string | null
          secret: string
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          events: string[]
          failure_count?: number
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          secret: string
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          events?: string[]
          failure_count?: number
          id?: string
          is_active?: boolean
          last_triggered_at?: string | null
          secret?: string
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhooks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_case: {
        Args: {
          case_id: string
          staff_id: string
        }
        Returns: undefined
      }
      send_notification: {
        Args: {
          p_user_id: string
          p_type: Database["public"]["Enums"]["notification_type"]
          p_title: string
          p_content: string
          p_metadata?: Json
          p_priority?: Database["public"]["Enums"]["notification_priority"]
        }
        Returns: string
      }
      sync_missing_users: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      case_activity_type:
        | "status_change"
        | "priority_change"
        | "category_change"
        | "department_change"
        | "assignment_change"
        | "note_added"
        | "file_added"
        | "file_removed"
        | "metadata_change"
      case_category:
        | "general"
        | "followup"
        | "prescription"
        | "test_results"
        | "emergency"
      case_priority: "low" | "medium" | "high" | "urgent"
      case_status: "open" | "in_progress" | "resolved"
      conversation_status: "active" | "archived"
      department:
        | "primary_care"
        | "specialty_care"
        | "emergency"
        | "surgery"
        | "mental_health"
        | "admin"
      message_role: "user" | "assistant"
      notification_channel: "in_app" | "email" | "browser"
      notification_priority: "low" | "medium" | "high" | "urgent"
      notification_type:
        | "new_message"
        | "case_assigned"
        | "case_updated"
        | "emergency_alert"
        | "handoff_request"
      staff_specialty:
        | "general_practice"
        | "pediatrics"
        | "cardiology"
        | "neurology"
        | "orthopedics"
        | "dermatology"
        | "psychiatry"
        | "oncology"
      user_role: "admin" | "staff" | "patient"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

