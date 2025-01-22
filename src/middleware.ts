import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { rateLimitMiddleware } from '@/middleware/rate-limit'

export async function middleware(request: NextRequest) {
  // Apply rate limiting first
  const rateLimitResponse = await rateLimitMiddleware(request)
  if (rateLimitResponse.status === 429) {
    return rateLimitResponse
  }

  // Then handle session updates
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 