import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PlusIcon } from '@radix-ui/react-icons'
import { CasesList } from '@/components/cases/cases-list'
import { createClient } from '@/lib/supabase/server'
import type { CaseResponse } from '@/lib/validations/case'

export const metadata = {
  title: 'My Cases - MediCRM',
  description: 'View and manage your medical cases.',
}

export default async function PatientCasesPage() {
  const supabase = await createClient()
  const { data: cases, error } = await supabase
    .from('cases')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My Cases</h1>
          <p className="text-sm text-muted-foreground">
            View and manage your medical cases
          </p>
        </div>

        <Link href="/patient/cases/new">
          <Button>
            <PlusIcon className="mr-2 h-4 w-4" />
            Create New Case
          </Button>
        </Link>
      </div>

      <CasesList 
        cases={cases as CaseResponse[]} 
        error={error?.message}
      />
    </div>
  )
} 