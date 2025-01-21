import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .limit(1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      message: 'Supabase connection successful',
      data 
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to connect to Supabase' },
      { status: 500 }
    )
  }
} 