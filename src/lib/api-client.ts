import { createClient } from '@supabase/supabase-js'
import type { User } from '@supabase/supabase-js'
import type { DbUserRole } from '@/types/domain/db'
import type { Database } from '@/types/supabase' // Needed only for createClient generic

export type ApiClient = {
  supabase: ReturnType<typeof createClient<Database>>
  user: User | null
  role: DbUserRole | null
}

export async function createApiClient(): Promise<ApiClient> {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: { user } } = await supabase.auth.getUser()
  
  // Get user role from database
  const { data: userData } = user ? await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single() : { data: null }

  return {
    supabase,
    user,
    role: userData?.role ?? null
  }
} 