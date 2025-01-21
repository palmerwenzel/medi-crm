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
    async function initializeAuth() {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          // Fetch user role from our users table
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single()
          
          setUser({ ...session.user, role: userData?.role })
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setLoading(false)
      }
    }

    // Initialize auth state
    initializeAuth()

    // Listen for auth changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session?.user) {
          // Fetch user role when auth state changes
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single()
          
          setUser({ ...session.user, role: userData?.role })
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error handling auth change:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
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