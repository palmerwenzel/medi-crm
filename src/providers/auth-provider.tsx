/**
 * Global authentication state provider
 * Manages client-side auth state using Supabase browser client
 * Gets user role from JWT app_metadata
 */

'use client'

import * as React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

type Role = Database['public']['Tables']['users']['Row']['role']

interface AuthState {
  user: User | null
  userRole: Role | null
  loading: boolean
}

interface AuthContextType extends AuthState {
  signOut?: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  loading: true
})

/**
 * Provider component that wraps your app and makes auth available to any
 * child component that calls useAuth().
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  console.log('[AuthProvider] Initializing')
  
  const [state, setState] = useState<AuthState>({
    user: null,
    userRole: null,
    loading: true
  })

  const supabase = createClient()

  useEffect(() => {
    console.log('[AuthProvider] Setting up auth subscriptions')
    
    // Get current user and role
    async function getInitialUser() {
      console.log('[AuthProvider] Getting initial user')
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (user) {
          console.log('[AuthProvider] Found user:', user.id)
          // Get user role from the users table
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

          console.log('[AuthProvider] User role:', userData?.role)
          setState({
            user,
            userRole: userData?.role ?? null,
            loading: false
          })
        } else {
          console.log('[AuthProvider] No user found')
          setState({
            user: null,
            userRole: null,
            loading: false
          })
        }
      } catch (error) {
        console.error('[AuthProvider] Error getting initial user:', error)
        setState(prev => ({ ...prev, loading: false }))
      }
    }

    getInitialUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthProvider] Auth state changed:', event)
        const user = session?.user ?? null
        
        if (user) {
          console.log('[AuthProvider] Session user:', user.id)
          // Get user role when auth state changes
          const { data: userData } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

          console.log('[AuthProvider] Updated user role:', userData?.role)
          setState({
            user,
            userRole: userData?.role ?? null,
            loading: false
          })
        } else {
          console.log('[AuthProvider] No session user')
          setState({
            user: null,
            userRole: null,
            loading: false
          })
        }
      }
    )

    return () => {
      console.log('[AuthProvider] Cleaning up subscriptions')
      subscription.unsubscribe()
    }
  }, [supabase])

  const value = {
    ...state,
    signOut: async () => {
      console.log('[AuthProvider] Signing out')
      await supabase.auth.signOut()
      setState({
        user: null,
        userRole: null,
        loading: false
      })
      console.log('[AuthProvider] Sign out complete')
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
  console.log('[useAuth] Current state:', {
    user: context.user?.id,
    role: context.userRole,
    loading: context.loading
  })
  return context
} 