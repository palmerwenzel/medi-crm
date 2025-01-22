'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, FileText, CalendarDays, Bell } from 'lucide-react'
import Link from 'next/link'

export function StaffDashboard() {
  const [stats, setStats] = useState({
    activeCases: 0,
    totalPatients: 0,
    upcomingAppointments: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadDashboardStats() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get assigned cases count
      const { count: casesCount } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true })
        .eq('assigned_to', user.id)
        .eq('status', 'active')

      // Get total patients count
      const { count: patientsCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'patient')

      setStats({
        activeCases: casesCount || 0,
        totalPatients: patientsCount || 0,
        upcomingAppointments: 0, // To be implemented with appointments table
      })
      setIsLoading(false)
    }

    loadDashboardStats()
  }, [])

  return (
    <div className="space-y-8">
      {/* Header Section with Glassmorphic Effect */}
      <div className="rounded-lg border bg-background/95 p-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <h1 className="text-3xl font-bold tracking-tight">Staff Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your patients and cases efficiently.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Active Cases</h3>
            </div>
            <div className="mt-4">
              {isLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                <p className="text-3xl font-bold">{stats.activeCases}</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Total Patients</h3>
            </div>
            <div className="mt-4">
              {isLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                <p className="text-3xl font-bold">{stats.totalPatients}</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <CalendarDays className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Upcoming</h3>
            </div>
            <div className="mt-4">
              {isLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                <p className="text-3xl font-bold">{stats.upcomingAppointments}</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <Bell className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Notifications</h3>
            </div>
            <div className="mt-4">
              {isLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                <p className="text-3xl font-bold">0</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-background/95 p-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Quick Actions</h2>
          </div>
          <div className="grid gap-2">
            <Button asChild className="justify-start" variant="outline">
              <Link href="/cases/new">
                <FileText className="mr-2 h-4 w-4" />
                Create New Case
              </Link>
            </Button>
            <Button asChild className="justify-start" variant="outline">
              <Link href="/patients">
                <Users className="mr-2 h-4 w-4" />
                View All Patients
              </Link>
            </Button>
            <Button asChild className="justify-start" variant="outline">
              <Link href="/appointments">
                <CalendarDays className="mr-2 h-4 w-4" />
                Manage Appointments
              </Link>
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-background/95 p-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Recent Activity</h2>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                No recent activity to display.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 