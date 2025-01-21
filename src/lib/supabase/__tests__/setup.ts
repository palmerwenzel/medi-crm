import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

// Extend Jest timeout for async operations
jest.setTimeout(30000)

// Ensure required environment variables are present
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'TEST_USER_PASSWORD'
] as const

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}. Check .env.test file.`)
  }
}

// Initialize Supabase clients for tests
export const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Service role client for admin operations (bypasses RLS)
export const adminClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Helper function to generate unique test emails
export function generateTestEmail(prefix = 'test') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`
}

// Helper function to clean up test users
export async function cleanupTestUsers(emails: string[]) {
  try {
    const { error } = await adminClient
      .from('users')
      .delete()
      .in('email', emails)

    if (error) {
      console.error('Error cleaning up test users:', error)
    }
  } catch (err) {
    console.error('Failed to clean up test users:', err)
  }
}

// Verify database connection before tests
export async function verifyDatabaseConnection() {
  try {
    const { error } = await adminClient.from('users').select('count').limit(1)
    if (error) throw error
    return true
  } catch (err) {
    console.error('Failed to connect to database:', err)
    throw new Error('Database connection failed. Is Supabase running locally?')
  }
} 