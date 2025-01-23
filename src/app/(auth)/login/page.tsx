import { Metadata } from 'next'
import { LoginForm } from './login-form'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to your account',
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <LoginForm />
    </div>
  )
} 