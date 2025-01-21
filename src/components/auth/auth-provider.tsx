'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase/client'
import { Database } from '@/types/supabase'

type UserWithRole = User & {
  role?: Database['public']['Tables']['users']['Row']['role']
}

type AuthContextType = {
  user: UserWithRole | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {}
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserWithRole | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        // Fetch user role from our users table
        supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            setUser({ ...session.user, role: data?.role })
          })
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Fetch user role when auth state changes
        const { data } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single()
        
        setUser({ ...session.user, role: data?.role })
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
} 