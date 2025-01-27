'use client'

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { signUpUser } from './actions'

// Constants for form options
const DEPARTMENTS = [
  'primary_care',
  'emergency',
  'pediatrics',
  'cardiology',
  'neurology',
  'orthopedics',
  'internal_medicine',
] as const

const SPECIALTIES = [
  'general_practice',
  'emergency_medicine',
  'pediatrics',
  'cardiology',
  'neurology',
  'orthopedics',
  'internal_medicine',
] as const

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
    .min(6, 'Password must be at least 6 characters')
    .max(72, 'Password is too long'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  role: z.enum(['patient', 'staff'], {
    required_error: 'Please select a role',
  }),
  department: z.enum(DEPARTMENTS).optional(),
  specialty: z.enum(SPECIALTIES).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don&apos;t match",
  path: ['confirmPassword'],
}).refine((data) => {
  if (data.role === 'staff') {
    return data.department && data.specialty
  }
  return true
}, {
  message: 'Department and specialty are required for staff members',
  path: ['department'],
})

type SignUpFormValues = z.infer<typeof signupSchema>

export function SignUpForm() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [failedAttempts, setFailedAttempts] = useState(0)
  const router = useRouter()

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'patient',
    },
  })

  const watchRole = form.watch('role')

  async function onSubmit(data: SignUpFormValues) {
    try {
      if (failedAttempts > 3) {
        await new Promise(resolve => setTimeout(resolve, Math.min(failedAttempts * 1000, 5000)))
      }

      setIsLoading(true)
      setError(null)

      const result = await signUpUser(data)

      if (result?.error) {
        setFailedAttempts(prev => prev + 1)
        throw new Error(result.error)
      }

      setFailedAttempts(0)

      if (result.success) {
        router.replace('/dashboard')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account. Please try again.')
    } finally {
      setIsLoading(false)
      if (error) {
        form.setValue('password', '')
        form.setValue('confirmPassword', '')
      }
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
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your account type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="patient">Patient</SelectItem>
                      <SelectItem value="staff">Medical Staff</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose whether you're a patient or medical staff member
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
            
            {watchRole === 'staff' && (
              <>
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your department" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DEPARTMENTS.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept.split('_').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="specialty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialty</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your specialty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SPECIALTIES.map((specialty) => (
                            <SelectItem key={specialty} value={specialty}>
                              {specialty.split('_').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' ')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

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
              disabled={isLoading}
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link
                href="/login"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                Log in
              </Link>
            </p>
          </form>
        </Form>
      </div>
    </div>
  )
} 