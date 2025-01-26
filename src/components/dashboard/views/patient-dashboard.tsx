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
      <div className="h-full">
        <div>
          <Skeleton className="h-8 w-[250px] mb-4" />
          <Skeleton className="h-4 w-[350px]" />
        </div>
        <div className="mt-6 h-[calc(100vh-16rem)]">
          <Skeleton className="h-full rounded-lg" />
        </div>
      </div>
    )
  }

  // Return null if no user (will redirect in middleware)
  if (!user) return null

  return (
    <div className="h-full">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Patient Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Chat with our AI assistant to provide preliminary medical information.
        </p>
      </div>

      {/* Main Content */}
      <div className="mt-6 h-[calc(100vh-16rem)]">
        {/* Medical Intake Chatbot */}
        <div className="rounded-lg bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 overflow-hidden h-full">
          <ChatContainer 
            patientId={user.id}
            className="h-full"
          />
        </div>
      </div>
    </div>
  )
} 