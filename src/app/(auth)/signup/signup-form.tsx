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
import { signUpUser } from './actions'

// Form validation schema
const signupSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s-']+$/, 'First name can only contain letters, spaces, hyphens, and apostrophes'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s-']+$/, 'Last name can only contain letters, spaces, hyphens, and apostrophes'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .max(255, 'Email is too long')
    .email('Please enter a valid email address')
    .transform(val => val.toLowerCase()),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password is too long') // bcrypt max length
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
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
  const [signupAttempts, setSignupAttempts] = useState(0)

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  async function onSubmit(data: SignUpFormValues) {
    try {
      // Prevent rapid signup attempts
      if (signupAttempts > 3) {
        await new Promise(resolve => setTimeout(resolve, Math.min(signupAttempts * 1000, 5000)))
      }

      setIsLoading(true)
      setError(null)

      const result = await signUpUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      })

      if (result?.error) {
        setSignupAttempts(prev => prev + 1)
        // Use generic error messages to prevent information disclosure
        if (result.error.toLowerCase().includes('email')) {
          throw new Error('This email cannot be used. Please try another.')
        }
        throw new Error('Failed to create account. Please try again.')
      }

      // Router.refresh() and redirect are handled by the server action
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      // Clear password fields on error
      form.setValue('password', '')
      form.setValue('confirmPassword', '')
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
            Enter your details below to create your account
          </p>
        </div>
        
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onSubmit)} 
            className="space-y-4 animate-in fade-in-50"
            aria-label="Sign up form"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">First Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="John"
                        autoComplete="given-name"
                        disabled={isLoading}
                        aria-describedby="firstName-error"
                        className="w-full transition-colors focus-visible:ring-2 focus-visible:ring-ring hover:border-border/80"
                        maxLength={50}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage id="firstName-error" className="text-sm" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Last Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Doe"
                        autoComplete="family-name"
                        disabled={isLoading}
                        aria-describedby="lastName-error"
                        className="w-full transition-colors focus-visible:ring-2 focus-visible:ring-ring hover:border-border/80"
                        maxLength={50}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage id="lastName-error" className="text-sm" />
                  </FormItem>
                )}
              />
            </div>

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
                      placeholder="Create a password"
                      autoComplete="new-password"
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
                      maxLength={72}
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
              disabled={isLoading || signupAttempts > 5} // Prevent excessive attempts
              aria-disabled={isLoading || signupAttempts > 5}
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