/**
 * Global authentication state provider
 * Manages client-side auth state using Supabase browser client
 * Gets user role from JWT app_metadata
 */

'use client'

import * as React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User, Session } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

type Role = Database['public']['Tables']['users']['Row']['role']

interface AuthState {
  user: User | null
  session: Session | null
  userRole: Role | null
  loading: boolean
}

interface AuthContextType extends AuthState {
  signOut?: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  userRole: null,
  loading: true
})

/**
 * Provider component that wraps your app and makes auth available to any
 * child component that calls useAuth().
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    userRole: null,
    loading: true
  })

  const supabase = createClient()

  useEffect(() => {
    // Get current session and user role
    async function getInitialSession() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          // Get user role from the users table
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single()

          setState({
            session,
            user: session.user,
            userRole: userData?.role ?? null,
            loading: false
          })
        } else {
          setState({
            session: null,
            user: null,
            userRole: null,
            loading: false
          })
        }
      } catch (error) {
        console.error('Error:', error)
        setState(prev => ({ ...prev, loading: false }))
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Get user role when auth state changes
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', session.user.id)
            .single()

          setState({
            session,
            user: session.user,
            userRole: userData?.role ?? null,
            loading: false
          })
        } else {
          setState({
            session: null,
            user: null,
            userRole: null,
            loading: false
          })
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const value = {
    ...state,
    signOut: async () => {
      await supabase.auth.signOut()
      setState({
        session: null,
        user: null,
        userRole: null,
        loading: false
      })
    }
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook that lets you access the current auth state and methods.
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 