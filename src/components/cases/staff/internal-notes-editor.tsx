/**
 * InternalNotesEditor Component
 * Rich text editor for staff internal notes with history and attribution
 */
'use client'

import * as React from 'react'
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
import { createClient } from '@/lib/supabase/client'

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
  currentUserId: string
  className?: string
}

export function InternalNotesEditor({
  caseId,
  currentUserId,
  className
}: InternalNotesEditorProps) {
  const [notes, setNotes] = React.useState<Note[]>([])
  const [isLoading, setIsLoading] = React.useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const form = useForm<NotesFormValues>({
    resolver: zodResolver(notesSchema),
    defaultValues: {
      content: '',
    },
  })

  // Load notes
  React.useEffect(() => {
    async function loadNotes() {
      const { data, error } = await supabase
        .from('case_notes')
        .select(`
          id,
          content,
          created_at,
          staff:users(id, first_name, last_name)
        `)
        .eq('case_id', caseId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading notes:', error)
        return
      }

      // Transform staff data
      const transformedNotes = data.map(note => ({
        ...note,
        staff: {
          id: note.staff.id,
          full_name: `${note.staff.first_name || ''} ${note.staff.last_name || ''}`.trim()
        }
      }))

      setNotes(transformedNotes)
    }

    loadNotes()
  }, [caseId])

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
          // Reload notes on any change
          const { data, error } = await supabase
            .from('case_notes')
            .select(`
              id,
              content,
              created_at,
              staff:users(id, first_name, last_name)
            `)
            .eq('case_id', caseId)
            .order('created_at', { ascending: false })

          if (error) {
            console.error('Error reloading notes:', error)
            return
          }

          // Transform staff data
          const transformedNotes = data.map(note => ({
            ...note,
            staff: {
              id: note.staff.id,
              full_name: `${note.staff.first_name || ''} ${note.staff.last_name || ''}`.trim()
            }
          }))

          setNotes(transformedNotes)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [caseId])

  async function onSubmit(data: NotesFormValues) {
    try {
      setIsLoading(true)

      const { error } = await supabase
        .from('case_notes')
        .insert({
          case_id: caseId,
          staff_id: currentUserId,
          content: data.content,
        })

      if (error) throw error

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
          <h4 className="text-sm font-medium mb-4">Note History</h4>
          <ScrollArea className="h-[300px] pr-4">
            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 rounded-lg border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <p className="text-sm font-medium">{note.staff.full_name}</p>
                    <time className="text-sm text-muted-foreground">
                      {format(new Date(note.created_at), 'MMM d, yyyy h:mm a')}
                    </time>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {note.content}
                  </p>
                </div>
              ))}
              {notes.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No notes yet
                </p>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
} 