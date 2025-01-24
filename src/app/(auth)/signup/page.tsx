import { SignUpForm } from './signup-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign Up | TonIQ',
  description: 'Create your TonIQ account',
}

export default function SignUpPage() {
  return <SignUpForm />
} 