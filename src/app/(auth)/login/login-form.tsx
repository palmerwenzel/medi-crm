'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
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
import { loginUser } from './actions'

// Form validation schema
const loginSchema = z.object({
  email: z
    .string()
    .trim() // Prevent whitespace-based attacks
    .min(1, 'Email is required')
    .max(255, 'Email is too long')
    .email('Please enter a valid email address')
    .transform(val => val.toLowerCase()), // Normalize email
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(72, 'Password is too long'), // bcrypt max length
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: LoginFormValues) {
    try {
      // Prevent brute force by adding delay after failed attempts
      if (failedAttempts > 3) {
        await new Promise(resolve => setTimeout(resolve, Math.min(failedAttempts * 1000, 5000)))
      }

      setIsLoading(true)
      setError(null)

      // Use the server action directly with the form data
      const result = await loginUser({
        email: data.email, // Email is already normalized by Zod
        password: data.password,
      })
      
      if (result?.error) {
        setFailedAttempts(prev => prev + 1)
        throw new Error(result.error)
      }

      // Reset failed attempts on success
      setFailedAttempts(0)

      // Router.refresh() and redirect are handled by the server action
    } catch (err) {
      // Generic error message for security
      setError('Invalid email or password')
    } finally {
      setIsLoading(false)
      // Clear password field on error
      if (error) {
        form.setValue('password', '')
      }
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
                      maxLength={255}
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
                      maxLength={72}
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
              disabled={isLoading || failedAttempts > 10} // Prevent excessive attempts
              aria-disabled={isLoading || failedAttempts > 10}
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