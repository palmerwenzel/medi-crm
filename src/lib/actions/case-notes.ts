/**
 * Server actions for case notes management
 * Access control handled by RLS policies
 */
'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

interface StaffMember {
  id: string
  first_name: string | null
  last_name: string | null
}

interface CaseNote {
  id: string
  content: string
  created_at: string
  staff: StaffMember
}

interface FormattedCaseNote {
  id: string
  content: string
  created_at: string
  staff: {
    id: string
    full_name: string
  }
}

export async function loadCaseNotes(caseId: string): Promise<FormattedCaseNote[]> {
  const supabase = await createClient()
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
    .returns<CaseNote[]>()

  if (error) {
    console.error('Error loading notes:', error)
    throw error
  }

  if (!data) return []

  return data.map(note => ({
    ...note,
    staff: {
      id: note.staff.id,
      full_name: `${note.staff.first_name || ''} ${note.staff.last_name || ''}`.trim()
    }
  }))
}

export async function addCaseNote(caseId: string, staffId: string, content: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('case_notes')
    .insert({
      case_id: caseId,
      staff_id: staffId,
      content,
    })

  if (error) {
    console.error('Error adding note:', error)
    throw error
  }

  revalidatePath(`/cases/${caseId}`)
} 