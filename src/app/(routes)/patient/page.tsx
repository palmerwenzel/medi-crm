import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { PlusIcon } from '@radix-ui/react-icons'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Patient Dashboard - MediCRM',
  description: 'Manage your medical cases and health information',
}

export default async function PatientDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Your Patient Dashboard</CardTitle>
          <CardDescription>
            Manage your medical cases and health information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Hello {user?.email}, welcome to your patient dashboard. Here you can:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Create and manage your cases</li>
            <li>Track your appointments</li>
            <li>View your medical history</li>
            <li>Communicate with healthcare providers</li>
          </ul>
          <div className="mt-6 space-x-4">
            <Link href="/patient/cases/new">
              <Button>
                <PlusIcon className="mr-2 h-4 w-4" />
                Create New Case
              </Button>
            </Link>
            <Link href="/patient/cases">
              <Button variant="outline">
                View My Cases
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 