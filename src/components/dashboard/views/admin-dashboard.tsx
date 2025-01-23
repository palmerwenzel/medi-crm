'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/providers/auth-provider'
import { getSystemStats } from '@/lib/actions/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import { Users, FileText, UserCheck } from 'lucide-react'

interface SystemStats {
  totalUsers: number
  totalCases: number
  activeStaff: number
}

export function AdminDashboard() {
  const { user, userRole } = useAuth()
  const { toast } = useToast()
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalCases: 0,
    activeStaff: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        setIsLoading(true)
        const data = await getSystemStats()
        setStats(data)
      } catch (error) {
        console.error('Error loading system stats:', error)
        toast({
          title: 'Error',
          description: 'Failed to load system statistics',
          variant: 'destructive'
        })
      } finally {
        setIsLoading(false)
      }
    }

    // Only load stats if user is an admin
    if (userRole === 'admin') {
      loadStats()
    }
  }, [toast, userRole])

  // Only render for admin users
  if (!user || userRole !== 'admin') return null

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats.totalCases}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Staff</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-7 w-20" />
            ) : (
              <div className="text-2xl font-bold">{stats.activeStaff}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 