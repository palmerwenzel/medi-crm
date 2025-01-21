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

// Form validation schema
const signupSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type SignUpFormValues = z.infer<typeof signupSchema>

export function SignUpForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: SignUpFormValues) {
    try {
      setIsLoading(true)
      setError(null)

      // Sign up the user with Supabase Auth
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            role: 'patient' // Store role in auth metadata
          }
        }
      })

      if (signUpError) throw signUpError
      if (!authData.user) throw new Error('No user data returned')

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id, // Important: Use the auth user's ID
            email: data.email,
            role: 'patient'
          }
        ])
        .select()
        .single()

      if (profileError) {
        // If profile creation fails, clean up the auth user
        await supabase.auth.signOut()
        throw profileError
      }

      // Refresh the page to update auth state
      router.refresh()
      
      // Redirect to patient dashboard (since all new signups are patients)
      router.push('/patient')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mx-auto w-full px-4 py-8 sm:px-0 md:py-12">
      <div className="relative w-full max-w-sm space-y-6 rounded-lg border border-border bg-card p-4 shadow-md transition-all hover:shadow-lg focus-within:shadow-lg focus-within:ring-2 focus-within:ring-ring sm:max-w-md sm:p-6">
        <div className="space-y-2 text-center">
          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">Create an account</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email below to create your account
          </p>
        </div>
        
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onSubmit)} 
            className="space-y-4 animate-in fade-in-50"
            aria-label="Sign up form"
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
                      placeholder="Create a password"
                      autoComplete="new-password"
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

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Confirm Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      disabled={isLoading}
                      aria-describedby="confirm-password-error"
                      className="w-full transition-colors focus-visible:ring-2 focus-visible:ring-ring hover:border-border/80"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage id="confirm-password-error" className="text-sm" />
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
                  <span className="sr-only">Creating account...</span>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  <span aria-hidden="true">Creating account...</span>
                </>
              ) : (
                'Create account'
              )}
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link 
                href="/login" 
                className="font-medium text-primary hover:text-primary/90 hover:underline focus-visible:underline"
              >
                Log in
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
} 