import { NextResponse } from 'next/server'
import { createApiClient, handleApiError } from '@/lib/supabase/api'

// Mark route as dynamic
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { supabase } = await createApiClient()

    const { data, error } = await supabase
      .from('users')
      .select('id, email, role')
      .limit(1)

    if (error) throw error

    return NextResponse.json({ 
      message: data?.length 
        ? `Successfully connected! Found user with role: ${data[0].role}`
        : 'Connected successfully! No users found yet.',
      data 
    })
  } catch (error) {
    return handleApiError(error)
  }
} 