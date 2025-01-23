/**
 * Global authentication state provider
 * Manages client-side auth state using Supabase browser client
 * Gets user role from JWT app_metadata
 */

'use client'

import * as React from "react"
import { createContext, useContext, useEffect, useState, useMemo } from "react"
import { createClient } from "@/utils/supabase/client"
import type { User, Session, AuthChangeEvent } from "@supabase/supabase-js"
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

// Development-only logging
const log = process.env.NODE_ENV === 'development' 
  ? (...args: any[]) => console.log('[Auth]:', ...args)
  : () => {}

// Add utility for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Add retry utility with backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  initialDelay = 1000
): Promise<T> {
  let attempt = 1
  let lastError: any

  while (attempt <= maxAttempts) {
    try {
      if (attempt > 1) {
        const backoffDelay = initialDelay * Math.pow(2, attempt - 2)
        await delay(backoffDelay)
        log(`Retry attempt ${attempt} after ${backoffDelay}ms delay`)
      }
      return await fn()
    } catch (error) {
      lastError = error
      attempt++
    }
  }
  throw lastError
}

// Add debounce utility at the top with other utilities
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => fn(...args), wait)
  }
}

/**
 * Provider component that wraps your app and makes auth available to any
 * child component that calls useAuth().
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    userRole: null,
    loading: true
  })

  // Memoize Supabase client
  const supabase = useMemo(() => createClient(), [])

  // Memoize the role fetch function to share between handlers
  const fetchUserRole = useMemo(() => async (user: User) => {
    log('Fetching user role...')
    log('Using user ID:', user.id)
    
    // Add initial delay to allow session to establish
    await delay(500)
    
    try {
      const { data: userData, error: roleError } = await retryWithBackoff<{
        data: Database['public']['Tables']['users']['Row'] | null,
        error: any
      }>(
        async () => {
          const rolePromise = supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single()

          const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error('Role fetch timed out after 5s')), 5000)
          })

          return Promise.race([rolePromise, timeoutPromise]) as Promise<{
            data: Database['public']['Tables']['users']['Row'] | null,
            error: any
          }>
        },
        3,  // max attempts
        1000 // initial delay
      )

      if (roleError) {
        log('Error fetching role after retries:', roleError)
        setState(prev => ({
          user,
          userRole: null,
          loading: false
        }))
        return
      }

      if (!userData) {
        log('No user data found in users table for ID:', user.id)
        setState(prev => ({
          user,
          userRole: null,
          loading: false
        }))
        return
      }

      log('Role fetch result:', { userData, error: roleError })

      // Only update state if data has changed
      setState(prev => {
        const newRole = userData?.role ?? null
        log('Updating state:', { user, newRole, loading: false })
        if (prev.user?.id !== user.id || prev.userRole !== newRole || prev.loading) {
          return {
            user,
            userRole: newRole,
            loading: false
          }
        }
        return prev
      })
    } catch (error) {
      log('All role fetch retries failed:', error)
      setState(prev => ({
        user,
        userRole: null,
        loading: false
      }))
    }
  }, [supabase])

  // Debounced version of fetchUserRole
  const debouncedFetchUserRole = useMemo(
    () => debounce((user: User) => fetchUserRole(user), 100),
    [fetchUserRole]
  )

  useEffect(() => {
    // Get current user and role
    async function getInitialUser() {
      try {
        log('Fetching initial user...')
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        log('Initial user fetch result:', { user, error: userError })
        
        if (user) {
          await fetchUserRole(user)
        } else {
          log('No user found, setting loading to false')
          setState(prev => ({
            user: null,
            userRole: null,
            loading: false
          }))
        }
      } catch (error) {
        log('Error getting initial user:', error)
        setState(prev => ({ 
          user: null,
          userRole: null,
          loading: false 
        }))
      }
    }

    getInitialUser()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        log('Auth state changed:', { event, session })
        const user = session?.user ?? null
        
        if (user) {
          // Use debounced version for auth state changes
          debouncedFetchUserRole(user)
        } else {
          log('No user in session, setting loading to false')
          setState(prev => ({
            user: null,
            userRole: null,
            loading: false
          }))
        }
      }
    )

    return () => {
      log('Cleaning up auth subscription')
      subscription.unsubscribe()
    }
  }, [supabase, fetchUserRole, debouncedFetchUserRole])

  const value = useMemo(() => ({
    ...state,
    signOut: async () => {
      await supabase.auth.signOut()
      setState({
        user: null,
        userRole: null,
        loading: false
      })
    }
  }), [state, supabase])

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