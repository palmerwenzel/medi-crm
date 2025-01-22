/**
 * CaseAssignmentDialog Component
 * Provides a modal interface for assigning cases to staff members
 */
'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { assignCases } from '@/lib/actions/cases'

// Form schema
const assignmentSchema = z.object({
  staffId: z.string().uuid('Invalid staff member selected'),
})

type AssignmentFormValues = z.infer<typeof assignmentSchema>

interface CaseAssignmentDialogProps {
  selectedCases: string[]
  staffMembers: Array<{ id: string; name: string }>
  onAssign: () => void
  trigger?: React.ReactNode
}

export function CaseAssignmentDialog({
  selectedCases,
  staffMembers,
  onAssign,
  trigger
}: CaseAssignmentDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const form = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
  })

  async function onSubmit(data: AssignmentFormValues) {
    try {
      setIsLoading(true)
      
      const result = await assignCases(selectedCases, data.staffId)
      
      if (!result.success) {
        throw new Error(result.error)
      }

      toast({
        title: 'Cases Assigned',
        description: `Successfully assigned ${selectedCases.length} case(s).`,
      })

      setOpen(false)
      onAssign()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to assign cases',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" disabled={selectedCases.length === 0}>
            Assign Cases
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Cases</DialogTitle>
          <DialogDescription>
            Assign {selectedCases.length} selected case(s) to a staff member.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="staffId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Staff Member</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a staff member" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {staffMembers.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={isLoading || selectedCases.length === 0}
              >
                {isLoading ? 'Assigning...' : 'Assign Cases'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 