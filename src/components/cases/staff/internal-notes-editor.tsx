/**
 * InternalNotesEditor Component
 * Rich text editor for staff internal notes with history and attribution
 * Only accessible to staff and admin roles
 * Uses server actions for data mutations and client for real-time updates
 */
'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form'
import { ScrollArea } from '@/components/ui/scroll-area'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from '@/providers/auth-provider'
import { loadCaseNotes, addCaseNote } from '@/lib/actions/case-notes'

// Form schema
const notesSchema = z.object({
  content: z.string().min(1, 'Note content is required').max(2000),
})

type NotesFormValues = z.infer<typeof notesSchema>

interface Note {
  id: string
  content: string
  created_at: string
  staff: {
    id: string
    full_name: string
  }
}

interface InternalNotesEditorProps {
  caseId: string
  className?: string
}

export function InternalNotesEditor({
  caseId,
  className
}: InternalNotesEditorProps) {
  const { user, userRole } = useAuth()
  const router = useRouter()
  const [notes, setNotes] = React.useState<Note[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  // Only staff and admin can access this component
  if (!user || !['staff', 'admin'].includes(userRole || '')) {
    router.push('/dashboard')
    return null
  }

  const form = useForm<NotesFormValues>({
    resolver: zodResolver(notesSchema),
    defaultValues: {
      content: '',
    },
  })

  // Load notes using server action
  React.useEffect(() => {
    async function fetchNotes() {
      try {
        const data = await loadCaseNotes(caseId)
        setNotes(data)
      } catch (error) {
        console.error('Error loading notes:', error)
        toast({
          title: 'Error',
          description: 'Failed to load notes. Please try again.',
          variant: 'destructive',
        })
      }
    }

    fetchNotes()
  }, [caseId, toast])

  // Subscribe to realtime updates
  React.useEffect(() => {
    const channel = supabase
      .channel('case_notes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'case_notes',
          filter: `case_id=eq.${caseId}`,
        },
        async () => {
          // Reload notes on any change using server action
          try {
            const data = await loadCaseNotes(caseId)
            setNotes(data)
          } catch (error) {
            console.error('Error reloading notes:', error)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [caseId, supabase])

  async function onSubmit(data: NotesFormValues) {
    if (!user) return

    try {
      setIsLoading(true)
      await addCaseNote(caseId, user.id, data.content)
      form.reset()
      toast({
        title: 'Note Added',
        description: 'Your note has been added successfully.',
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add note',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Internal Notes</CardTitle>
        <CardDescription>
          Add internal notes for staff collaboration. These notes are not visible to patients.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="Add a note..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? 'Adding Note...' : 'Add Note'}
            </Button>
          </form>
        </Form>

        <div className="border-t pt-4">
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {notes.map((note) => (
                <div key={note.id} className="space-y-1">
                  <div className="text-sm text-muted-foreground">
                    {note.staff.full_name} • {format(new Date(note.created_at), 'MMM d, yyyy h:mm a')}
                  </div>
                  <div className="text-sm">{note.content}</div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
} 