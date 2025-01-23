import { CaseList } from "@/components/cases/shared/case-list"

/**
 * Dashboard cases overview
 * Shows a role-filtered list of cases with quick actions
 * Relies on middleware for auth and client components for role checks
 */
export const metadata = {
  title: 'Cases Overview - MediCRM',
  description: 'View and manage your medical cases.',
}

export default function DashboardCasesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cases Overview</h1>
          <p className="text-muted-foreground">
            Manage your medical cases and patient care
          </p>
        </div>
      </div>

      <CaseList isDashboard={true} limit={5} />
    </div>
  )
} 