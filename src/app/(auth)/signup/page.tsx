import { SignUpForm } from '@/components/auth/signup-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up | MediCRM',
  description: 'Create your MediCRM account',
}

export default function SignUpPage() {
  return <SignUpForm />
} 