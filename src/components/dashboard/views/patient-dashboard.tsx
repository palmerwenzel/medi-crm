'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardHeader, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CalendarDays, FileText, MessageSquare, Plus } from 'lucide-react'
import Link from 'next/link'

export function PatientDashboard() {
  const [recentCases, setRecentCases] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadRecentCases() {
      const { data: cases } = await supabase
        .from('cases')
        .select(`
          *,
          assigned_to:users!cases_assigned_to_fkey (
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(3)

      setRecentCases(cases || [])
      setIsLoading(false)
    }

    loadRecentCases()
  }, [])

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
            <Link href="/cases">View All Cases</Link>
          </Button>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            // Loading skeleton
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-16 bg-muted rounded-lg" />
                </div>
              ))}
            </div>
          ) : recentCases.length > 0 ? (
            recentCases.map((case_) => (
              <Link key={case_.id} href={`/cases/${case_.id}`}>
                <Card className="hover:bg-accent/5 transition-colors">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{case_.title}</h3>
                        <CardDescription className="mt-1">
                          {case_.description?.slice(0, 100)}...
                        </CardDescription>
                        {case_.assigned_to && (
                          <p className="text-sm mt-2">
                            Assigned to: {case_.assigned_to.full_name}
                          </p>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(case_.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">
              No recent cases found. Create a new case to get started.
            </p>
          )}
        </div>
      </div>
    </div>
  )
} 