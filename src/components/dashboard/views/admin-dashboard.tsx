'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Settings, Activity, BarChart } from 'lucide-react'
import Link from 'next/link'

export function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCases: 0,
    activeStaff: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadSystemStats() {
      // Get total users count
      const { count: usersCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      // Get total cases count
      const { count: casesCount } = await supabase
        .from('cases')
        .select('*', { count: 'exact', head: true })

      // Get active staff count
      const { count: staffCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'staff')

      setStats({
        totalUsers: usersCount || 0,
        totalCases: casesCount || 0,
        activeStaff: staffCount || 0,
      })
      setIsLoading(false)
    }

    loadSystemStats()
  }, [])

  return (
    <div className="space-y-8">
      {/* Header Section with Glassmorphic Effect */}
      <div className="rounded-lg border bg-background/95 p-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          System overview and management controls.
        </p>
      </div>

      {/* System Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Total Users</h3>
            </div>
            <div className="mt-4">
              {isLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <Activity className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Total Cases</h3>
            </div>
            <div className="mt-4">
              {isLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                <p className="text-3xl font-bold">{stats.totalCases}</p>
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
              <h3 className="font-semibold">Active Staff</h3>
            </div>
            <div className="mt-4">
              {isLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                <p className="text-3xl font-bold">{stats.activeStaff}</p>
              )}
            </div>
          </div>
        </Card>

        <Card className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="p-6">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-primary/10 rounded-full">
                <BarChart className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">System Load</h3>
            </div>
            <div className="mt-4">
              {isLoading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                <p className="text-3xl font-bold">Normal</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Admin Controls */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-background/95 p-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">System Management</h2>
          </div>
          <div className="grid gap-2">
            <Button asChild className="justify-start" variant="outline">
              <Link href="/admin/users">
                <Users className="mr-2 h-4 w-4" />
                User Management
              </Link>
            </Button>
            <Button asChild className="justify-start" variant="outline">
              <Link href="/admin/settings">
                <Settings className="mr-2 h-4 w-4" />
                System Settings
              </Link>
            </Button>
            <Button asChild className="justify-start" variant="outline">
              <Link href="/admin/analytics">
                <BarChart className="mr-2 h-4 w-4" />
                Analytics
              </Link>
            </Button>
          </div>
        </div>

        <div className="rounded-lg border bg-background/95 p-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">System Status</h2>
            <Button variant="outline" size="sm" asChild>
              <Link href="/admin/logs">View Logs</Link>
            </Button>
          </div>
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-muted animate-pulse rounded" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                  <span>Database Status</span>
                  <span className="text-green-500">Healthy</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                  <span>API Status</span>
                  <span className="text-green-500">Operational</span>
                </div>
                <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                  <span>Storage Status</span>
                  <span className="text-green-500">Available</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 