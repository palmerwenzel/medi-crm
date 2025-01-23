/**
 * Staff Case Queue Page
 * Provides a dedicated view for staff to manage and process cases
 */
import { Metadata } from 'next'
import { CaseQueueView } from '@/components/cases/staff/case-queue-view'

export const metadata: Metadata = {
  title: 'Staff Case Queue | MediCRM',
  description: 'Manage and process patient cases efficiently',
}

export default function StaffQueuePage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Case Queue</h1>
        <p className="text-muted-foreground">
          Manage and process patient cases efficiently
        </p>
      </div>
      
      <CaseQueueView />
    </div>
  )
} 