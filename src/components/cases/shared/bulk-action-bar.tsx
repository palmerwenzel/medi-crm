/**
 * Bulk action bar component for case management
 * Provides multi-select operations like status updates and assignments
 * Only accessible to staff and admin roles
 */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Users, CheckSquare } from 'lucide-react'
import { useAuth } from '@/providers/auth-provider'

interface BulkActionBarProps {
  selectedCases: string[]
  onSelectAll: () => void
  onDeselectAll: () => void
  onStatusChange: (status: string) => void
  onAssignmentChange: (userId: string) => void
  className?: string
  staffMembers?: Array<{ id: string; name: string }>
}

const statusOptions = [
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
]

export function BulkActionBar({
  selectedCases,
  onSelectAll,
  onDeselectAll,
  onStatusChange,
  onAssignmentChange,
  className,
  staffMembers = [],
}: BulkActionBarProps) {
  const { user, userRole } = useAuth()
  const router = useRouter()
  const [isAllSelected, setIsAllSelected] = useState(false)

  // Only staff and admin can use bulk actions
  if (!user || !['staff', 'admin'].includes(userRole)) {
    router.push('/dashboard')
    return null
  }

  const handleSelectAllChange = () => {
    if (isAllSelected) {
      onDeselectAll()
    } else {
      onSelectAll()
    }
    setIsAllSelected(!isAllSelected)
  }

  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-md border bg-card p-4',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Checkbox
          checked={isAllSelected}
          onCheckedChange={handleSelectAllChange}
          aria-label="Select all cases"
        />
        <span className="text-sm text-muted-foreground">
          {selectedCases.length} selected
        </span>
      </div>

      <div className="flex flex-1 items-center gap-2">
        <Select onValueChange={onStatusChange}>
          <SelectTrigger className="w-[180px]">
            <CheckSquare className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Update Status" />
          </SelectTrigger>
          <SelectContent>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select onValueChange={onAssignmentChange}>
          <SelectTrigger className="w-[180px]">
            <Users className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Assign To" />
          </SelectTrigger>
          <SelectContent>
            {staffMembers.map((staff) => (
              <SelectItem key={staff.id} value={staff.id}>
                {staff.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
} 