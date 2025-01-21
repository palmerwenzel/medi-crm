export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'staff' | 'patient'
          first_name: string | null
          last_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          role?: 'admin' | 'staff' | 'patient'
          first_name?: string | null
          last_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'staff' | 'patient'
          first_name?: string | null
          last_name?: string | null
          created_at?: string
          updated_at?: string
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