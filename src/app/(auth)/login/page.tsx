import { LoginForm } from './login-form'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Login | MediCRM',
  description: 'Login to your MediCRM account',
}

export default function LoginPage() {
  return <LoginForm />
} 