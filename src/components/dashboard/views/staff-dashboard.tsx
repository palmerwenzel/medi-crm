'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { useToast } from '@/components/ui/use-toast'
import { getDashboardStats } from '@/lib/actions/staff'
import Link from 'next/link'

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Icons } from '@/components/ui/icons'
import { CaseManagementView } from '@/components/cases/case-management-view'
import { QuickActionsBar } from '@/components/dashboard/shared/quick-actions-bar'

interface DashboardStats {
  activeCases: number
  totalPatients: number
  upcomingAppointments: number
}

export function StaffDashboard() {
  const { user, userRole, loading } = useAuth()
  const { toast } = useToast()
  const [stats, setStats] = useState<DashboardStats>({
    activeCases: 0,
    totalPatients: 0,
    upcomingAppointments: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  // Move loadStats into useCallback to prevent it from changing on every render
  const loadStats = useCallback(async (userId: string) => {
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
  }, [toast])

  useEffect(() => {
    if (!user?.id) return
    loadStats(user.id)
  }, [user?.id, loadStats])

  // Only show for staff
  if (loading || !user || userRole !== 'staff') return null

  return (
    <div className="space-y-8">
      {/* Header Section with Glassmorphic Effect */}
      <div className="rounded-lg border bg-background/95 p-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <h1 className="text-3xl font-bold tracking-tight">Staff Dashboard</h1>
        <p className="text-muted-foreground">
          Manage your assigned cases and monitor patient progress.
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
      <QuickActionsBar variant="cards" />

      {/* Recent Cases with Glassmorphic Effect */}
      <div className="rounded-lg border bg-background/95 p-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Assigned Cases</h2>
          <Button variant="outline" asChild>
            <Link href="/cases">View All Cases</Link>
          </Button>
        </div>

        <CaseManagementView 
          isDashboard={true}
          viewType={'staff' as const}
          limit={5}
          showStaffTools={true}
        />
      </div>
    </div>
  )
} 