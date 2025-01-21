import { RoleGuard } from '@/components/auth/role-guard'
import { NewCaseForm } from '@/components/cases/new-case-form'

export const metadata = {
  title: 'Create New Case - MediCRM',
  description: 'Submit a new medical case for review.',
}

export default function NewCasePage() {
  return (
    <RoleGuard allowedRoles={['patient']}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Create New Case</h1>
          <p className="text-sm text-muted-foreground">
            Submit a new case and we'll get back to you as soon as possible.
          </p>
        </div>

        <NewCaseForm />
      </div>
    </RoleGuard>
  )
} 