'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'
import { getDashboardStats } from '@/lib/actions/staff'

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Icons } from '@/components/ui/icons'

interface DashboardStats {
  activeCases: number
  totalPatients: number
  upcomingAppointments: number
}

export function StaffDashboard() {
  const { user, userRole } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [stats, setStats] = useState<DashboardStats>({
    activeCases: 0,
    totalPatients: 0,
    upcomingAppointments: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  // Move loadStats outside useEffect for better type safety
  const loadStats = async (userId: string) => {
    try {
      const stats = await getDashboardStats(userId)
      setStats(stats)
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
      toast({
        title: 'Error',
        description: 'Failed to load dashboard statistics',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!user?.id) return
    loadStats(user.id)
  }, [user?.id, toast])

  if (!user || userRole !== 'staff') {
    return null
  }

  const firstName = user?.user_metadata?.first_name || 'Staff Member'

  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col gap-2 rounded-lg bg-gradient-to-r from-blue-600/10 via-blue-800/10 to-purple-800/10 p-6 backdrop-blur-sm">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="text-muted-foreground">
          Here's an overview of your assigned cases and patient statistics
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <Icons.cases className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats.activeCases}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Icons.users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalPatients}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <Icons.calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats.upcomingAppointments}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button onClick={() => router.push('/cases/new')}>
          <Icons.plus className="mr-2 h-4 w-4" />
          Create New Case
        </Button>
        <Button onClick={() => router.push('/patients')} variant="outline">
          <Icons.users className="mr-2 h-4 w-4" />
          View All Patients
        </Button>
        <Button onClick={() => router.push('/schedule')} variant="outline">
          <Icons.calendar className="mr-2 h-4 w-4" />
          Manage Appointments
        </Button>
      </div>

      {/* Recent Activity */}
      <div className="rounded-lg border p-6">
        <h2 className="mb-4 text-lg font-semibold">Recent Activity</h2>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No recent activity</p>
        )}
      </div>
    </div>
  )
} 