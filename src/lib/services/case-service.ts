import { createClient } from '@/utils/supabase/client'
import type { CaseResponse } from '@/lib/validations/case'

const supabase = createClient()

/**
 * Claims a case and assigns it to the current staff member
 */
export async function claimCase(caseId: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No authenticated user')

  const { error } = await supabase.rpc('claim_case', {
    case_id: caseId,
    staff_id: user.id
  })

  if (error) {
    if (error.message.includes('already assigned')) {
      throw new Error('Case is already assigned to another staff member')
    }
    throw error
  }
}

/**
 * Releases a claimed case
 */
export async function releaseClaim(caseId: string): Promise<void> {
  const { error } = await supabase
    .from('cases')
    .update({ 
      assigned_to: null,
      metadata: {
        chat_status: 'needs_response',
        last_chat_update: new Date().toISOString()
      }
    })
    .eq('id', caseId)

  if (error) throw error
} 