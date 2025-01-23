import { CasesList } from "@/components/cases/cases-list"

export const metadata = {
  title: 'Cases - MediCRM',
  description: 'View and manage medical cases.',
}

/**
 * Cases list page
 * Shows different views based on role
 * Relies on middleware for auth and client components for role checks
 */
export default async function CasesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cases</h1>
          <p className="text-muted-foreground">
            View and manage medical cases
          </p>
        </div>
      </div>

      <CasesList />
    </div>
  )
} 