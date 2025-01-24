import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Minimal middleware for basic auth protection
 * Only checks if user has a valid session token
 */
export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log(`[MIDDLEWARE] Processing route: ${pathname}`)

  // Create a new headers object with only safe headers
  const safeHeaders = new Headers()
  request.headers.forEach((value, key) => {
    // Only forward safe headers, explicitly exclude auth-related ones
    if (!key.toLowerCase().includes('authorization') && 
        !key.toLowerCase().includes('cookie') &&
        !key.toLowerCase().includes('auth')) {
      safeHeaders.set(key, value)
    }
  })

  // Create initial response with sanitized headers
  let response = NextResponse.next({
    request: {
      headers: safeHeaders,
    },
  })

  // Create Supabase client with proper cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: safeHeaders,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: safeHeaders,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Skip auth check for public routes and assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.match(/\.(ico|png|jpg|jpeg|gif|svg)$/) ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup')
  ) {
    return response
  }

  // Refresh session and verify auth
  const { data: { session } } = await supabase.auth.getSession()

  // Redirect to login if accessing protected route without session
  if (!session) {
    const redirectUrl = new URL('/login', request.url)
    return NextResponse.redirect(redirectUrl)
  }

  return response
} 