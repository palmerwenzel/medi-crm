'use client'

import { useState } from 'react'
import { Check, Loader2, UserPlus2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { CaseStatus } from '@/lib/validations/case'
import type { StaffMember } from '@/types/staff'

interface BulkOperationsBarProps {
  selectedCount: number
  staffMembers: StaffMember[]
  onStatusChange: (status: CaseStatus) => Promise<void>
  onAssignmentChange: (userId: string) => Promise<void>
  onDeselectAll: () => void
  className?: string
}

export function BulkOperationsBar({
  selectedCount,
  staffMembers,
  onStatusChange,
  onAssignmentChange,
  onDeselectAll,
  className
}: BulkOperationsBarProps) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [isAssigning, setIsAssigning] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<CaseStatus>()
  const [selectedStaffId, setSelectedStaffId] = useState<string>()

  const handleStatusChange = async () => {
    if (!selectedStatus) return
    
    setIsUpdatingStatus(true)
    try {
      await onStatusChange(selectedStatus)
      setSelectedStatus(undefined)
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleAssignment = async () => {
    if (!selectedStaffId) return
    
    setIsAssigning(true)
    try {
      await onAssignmentChange(selectedStaffId)
      setSelectedStaffId(undefined)
    } finally {
      setIsAssigning(false)
    }
  }

  if (selectedCount === 0) return null

  return (
    <div className={cn('fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 p-4 rounded-lg border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-lg', className)}>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="rounded-lg">
          {selectedCount} selected
        </Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDeselectAll}
        >
          Clear
        </Button>
      </div>

      <div className="h-6 w-px bg-border" />

      <div className="flex items-center gap-2">
        <Select
          value={selectedStatus}
          onValueChange={(value: CaseStatus) => setSelectedStatus(value)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Change status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="secondary"
              disabled={!selectedStatus || isUpdatingStatus}
            >
              {isUpdatingStatus ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Update Status
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Update Case Status</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to change the status of {selectedCount} cases to "{selectedStatus}"?
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleStatusChange}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="h-6 w-px bg-border" />

      <div className="flex items-center gap-2">
        <Select
          value={selectedStaffId}
          onValueChange={setSelectedStaffId}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Assign to staff" />
          </SelectTrigger>
          <SelectContent>
            {staffMembers.map(staff => (
              <SelectItem key={staff.id} value={staff.id}>
                {staff.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="secondary"
              disabled={!selectedStaffId || isAssigning}
            >
              {isAssigning ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus2 className="mr-2 h-4 w-4" />
              )}
              Assign Cases
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Assign Cases</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to assign {selectedCount} cases to {
                  staffMembers.find(s => s.id === selectedStaffId)?.name
                }? This will override any existing assignments.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleAssignment}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
} 