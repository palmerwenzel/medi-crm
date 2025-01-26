import { NewCaseForm } from "@/components/cases/new-case-form"

/**
 * New case creation page
 * Relies on middleware for auth and client components for role checks
 */
export const metadata = {
  title: 'Create New Case - TonIQ',
  description: 'Submit a new medical case for review.',
}

export default async function NewCasePage() {
  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Case</h1>
          <p className="text-muted-foreground">
            Submit a new case and we&apos;ll get back to you as soon as possible.
          </p>
        </div>

        <NewCaseForm />
      </div>
    </div>
  )
} 