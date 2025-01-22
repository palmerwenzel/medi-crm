'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardHeader, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CalendarDays, FileText, MessageSquare, Plus } from 'lucide-react'
import { CaseList } from '@/components/cases/shared/case-list'
import Link from 'next/link'

export function PatientDashboard() {
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      }
      setIsLoading(false)
    }

    loadUser()
  }, [])

  if (isLoading || !user) return null

  return (
    <div className="space-y-8">
      {/* Header Section with Glassmorphic Effect */}
      <div className="rounded-lg border bg-background/95 p-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <h1 className="text-3xl font-bold tracking-tight">Patient Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your medical portal. View your cases and manage your healthcare journey.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/cases/new">
          <Card className="hover:bg-accent/5 transition-colors">
            <CardHeader>
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">New Case</h3>
                <CardDescription>Create a new medical case</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/messages">
          <Card className="hover:bg-accent/5 transition-colors">
            <CardHeader>
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-2 bg-primary/10 rounded-full">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Messages</h3>
                <CardDescription>Contact your healthcare team</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/appointments">
          <Card className="hover:bg-accent/5 transition-colors">
            <CardHeader>
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-2 bg-primary/10 rounded-full">
                  <CalendarDays className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Appointments</h3>
                <CardDescription>View upcoming appointments</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/documents">
          <Card className="hover:bg-accent/5 transition-colors">
            <CardHeader>
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-2 bg-primary/10 rounded-full">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold">Documents</h3>
                <CardDescription>Access medical records</CardDescription>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>

      {/* Recent Cases with Glassmorphic Effect */}
      <div className="rounded-lg border bg-background/95 p-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Cases</h2>
          <Button variant="outline" asChild>
            <Link href="/dashboard/cases">View All Cases</Link>
          </Button>
        </div>

        <CaseList 
          userRole="patient"
          userId={user.id}
          limit={3}
          isDashboard={true}
        />
      </div>
    </div>
  )
} 