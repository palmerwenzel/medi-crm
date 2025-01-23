/**
 * StaffToolbar Component
 * Integrates all staff tools for case management
 * Only accessible to staff and admin roles
 */
'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { CaseAssignmentDialog } from './case-assignment-dialog'
import { PriorityManager } from './priority-manager'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from '@/providers/auth-provider'

interface StaffMember {
  id: string
  name: string
}

interface StaffToolbarProps {
  selectedCases: string[]
  onUpdate: () => void
  className?: string
}

export function StaffToolbar({
  selectedCases,
  onUpdate,
  className
}: StaffToolbarProps) {
  const { user, userRole } = useAuth()
  const router = useRouter()
  const [staffMembers, setStaffMembers] = React.useState<StaffMember[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  // Only staff and admin can access this component
  if (!user || !['staff', 'admin'].includes(userRole || '')) {
    router.push('/dashboard')
    return null
  }

  // Load staff members
  React.useEffect(() => {
    async function loadStaffMembers() {
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name')
        .eq('role', 'staff')
        .order('first_name')

      if (error) {
        console.error('Failed to load staff members:', error)
        toast({
          title: 'Error',
          description: 'Failed to load staff members',
          variant: 'destructive',
        })
        return
      }

      setStaffMembers(
        data.map(staff => ({
          id: staff.id,
          name: `${staff.first_name || ''} ${staff.last_name || ''}`.trim()
        }))
      )
      setIsLoading(false)
    }

    loadStaffMembers()
  }, [])

  return (
    <div className={className}>
      <div className="flex items-center gap-4 p-4 rounded-lg border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CaseAssignmentDialog
          selectedCases={selectedCases}
          staffMembers={staffMembers}
          onAssign={onUpdate}
        />
        
        <PriorityManager
          caseIds={selectedCases}
          onUpdate={onUpdate}
        />

        <div className="ml-auto">
          <Button
            variant="outline"
            size="sm"
            disabled={selectedCases.length === 0}
            onClick={() => {
              // Clear selection
              onUpdate()
            }}
          >
            Clear Selection ({selectedCases.length})
          </Button>
        </div>
      </div>
    </div>
  )
} 