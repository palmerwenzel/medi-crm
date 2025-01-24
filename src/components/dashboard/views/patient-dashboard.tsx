'use client'

import { useAuth } from '@/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { QuickActionsBar } from '@/components/dashboard/shared/quick-actions-bar'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { ChatContainer } from '@/components/chat/chat-container'
import { Skeleton } from '@/components/ui/skeleton'

export function PatientDashboard() {
  const { user, loading } = useAuth()

  // Show loading state while auth is initializing
  if (loading) {
    return (
      <div className="h-full overflow-y-auto p-4 md:p-6 lg:p-8 space-y-8">
        <div className="rounded-lg border bg-background/95 p-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Skeleton className="h-8 w-[250px] mb-4" />
          <Skeleton className="h-4 w-[350px]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-[100px]" />
          <Skeleton className="h-[100px]" />
          <Skeleton className="h-[100px]" />
        </div>
        <div className="rounded-lg border bg-background/95 p-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <Skeleton className="h-6 w-[200px] mb-2" />
          <Skeleton className="h-4 w-[300px] mb-4" />
          <Skeleton className="h-[600px]" />
        </div>
      </div>
    )
  }

  // Return null if no user (will redirect in middleware)
  if (!user) return null

  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 lg:p-8 space-y-8">
      {/* Header Section with Glassmorphic Effect */}
      <div className="rounded-lg border bg-background/95 p-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <h1 className="text-3xl font-bold tracking-tight">Patient Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your medical portal. Chat with our AI assistant to provide your medical information.
        </p>
      </div>

      {/* Quick Actions */}
      <QuickActionsBar variant="cards" />

      {/* EXCLUDE FOR NOW: Recent Cases with Glassmorphic Effect 
      <div className="rounded-lg border bg-background/95 p-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Recent Cases</h2>
          <Button variant="outline" asChild>
            <Link href="/cases">View All Cases</Link>
          </Button>
        </div>

        <CaseManagementView 
          isDashboard={true}
          viewType={'patient' as const}
          limit={5}
        />
      </div>
      */}

      {/* Medical Intake Chatbot with Glassmorphic Effect */}
      <div className="rounded-lg border bg-background/95 p-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Medical Assistant</h2>
          <p className="text-sm text-muted-foreground">
            Chat with our AI assistant to provide preliminary medical information.
          </p>
        </div>
        <ChatContainer 
          patientId={user.id}
          className="min-h-[600px]"
        />
      </div>
    </div>
  )
} 