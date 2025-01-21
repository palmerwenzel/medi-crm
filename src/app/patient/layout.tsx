import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  // Get session and user role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  // Redirect if not a patient
  if (userData?.role !== 'patient') {
    redirect('/')
  }

  return <>{children}</>
} 