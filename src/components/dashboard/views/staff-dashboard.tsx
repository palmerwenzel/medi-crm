'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { useToast } from '@/components/ui/use-toast'
import { getDashboardStats } from '@/lib/actions/staff'
import Link from 'next/link'

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Icons } from '@/components/ui/icons'
import { CaseManagementView } from '@/components/cases/shared/case-management-view'
import { QuickActionsBar } from '@/components/dashboard/shared/quick-actions-bar'

interface DashboardStats {
  activeCases: number
  totalPatients: number
  upcomingAppointments: number
}

export function StaffDashboard() {
  const { user, userRole } = useAuth()
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
      <QuickActionsBar />

      {/* Recent Cases */}
      <div className="rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Cases</h2>
          <Button variant="outline" asChild>
            <Link href="/cases">View All Cases</Link>
          </Button>
        </div>
        
        <CaseManagementView 
          isDashboard={true}
          viewType="staff"
          showBulkActions={false}
          showStaffTools={true}
          limit={5}
        />
      </div>
    </div>
  )
} 