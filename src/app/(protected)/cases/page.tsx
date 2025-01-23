import { CaseGridView } from "@/components/cases/case-grid-view"

export const metadata = {
  title: 'Cases - MediCRM',
  description: 'View and manage medical cases.',
}

/**
 * Cases list page
 * Shows different views based on role
 * Relies on middleware for auth and client components for role checks
 */
export default function CasesPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Cases</h1>
      <CaseGridView />
    </div>
  )
} 