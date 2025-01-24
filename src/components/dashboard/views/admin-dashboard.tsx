'use client'

import { useAuth } from '@/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { CaseManagementView } from '@/components/cases/case-management-view'
import { QuickActionsBar } from '@/components/dashboard/shared/quick-actions-bar'
import Link from 'next/link'

export function AdminDashboard() {
  const { user, userRole, loading } = useAuth()

  // Only show for admin
  if (loading || !user || userRole !== 'admin') return null

  return (
    <div className="space-y-8">
      {/* Header Section with Glassmorphic Effect */}
      <div className="rounded-lg border bg-background/95 p-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor system activity and manage all cases.
        </p>
      </div>

      {/* Quick Actions */}
      <QuickActionsBar variant="cards" />

      {/* Recent Cases with Glassmorphic Effect */}
      <div className="rounded-lg border bg-background/95 p-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Cases</h2>
          <Button variant="outline" asChild>
            <Link href="/cases">View All Cases</Link>
          </Button>
        </div>

        <CaseManagementView 
          isDashboard={true}
          viewType={'admin' as const}
          limit={5}
          showBulkActions={true}
          showStaffTools={true}
        />
      </div>
    </div>
  )
} 