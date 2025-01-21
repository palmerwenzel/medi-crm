'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Define role-specific home routes
const roleHomeRoutes = {
  patient: '/patient',
  staff: '/staff',
  admin: '/admin'
} as const

// Form validation schema
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: LoginFormValues) {
    try {
      setIsLoading(true)
      setError(null)

      const { data: { session }, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (signInError) {
        throw signInError
      }

      if (!session?.user) {
        throw new Error('No session found')
      }

      // Get user role
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (userError) {
        throw userError
      }

      if (!userData?.role) {
        throw new Error('User role not found')
      }

      // Refresh the page to update auth state
      router.refresh()
      
      // Redirect based on user role
      router.push(roleHomeRoutes[userData.role as keyof typeof roleHomeRoutes])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log in')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full px-4 py-8 sm:px-0 md:py-12">
      <div className="relative w-full max-w-sm space-y-6 rounded-lg border border-border bg-card p-4 shadow-md transition-all hover:shadow-lg focus-within:shadow-lg focus-within:ring-2 focus-within:ring-ring sm:max-w-md sm:p-6">
        <div className="space-y-2 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email to log in to your account
          </p>
        </div>
        
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onSubmit)} 
            className="space-y-4 animate-in fade-in-50"
            aria-label="Login form"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      autoComplete="email"
                      disabled={isLoading}
                      aria-describedby="email-error"
                      className="w-full transition-colors focus-visible:ring-2 focus-visible:ring-ring hover:border-border/80"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage id="email-error" className="text-sm" />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={isLoading}
                      aria-describedby="password-error"
                      className="w-full transition-colors focus-visible:ring-2 focus-visible:ring-ring hover:border-border/80"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage id="password-error" className="text-sm" />
                </FormItem>
              )}
            />

            {error && (
              <Alert 
                variant="destructive"
                role="alert"
                aria-live="polite"
                className="animate-in fade-in-0 slide-in-from-top-1"
              >
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-primary text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isLoading}
              aria-disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="sr-only">Signing in...</span>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  <span aria-hidden="true">Signing in...</span>
                </>
              ) : (
                'Log in'
              )}
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link 
                href="/signup" 
                className="font-medium text-primary hover:text-primary/90 hover:underline focus-visible:underline"
              >
                Sign up
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
} 