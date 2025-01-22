import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

type Role = Database['public']['Tables']['users']['Row']['role']

// Define route access patterns
const publicRoutes = ['/login', '/signup']
const protectedRoutes = {
  patient: ['/dashboard/cases'],
  staff: ['/dashboard/cases', '/dashboard/patients'],
  admin: ['/dashboard/cases', '/dashboard/patients', '/dashboard/settings']
} as const

// Define home routes for each role
const roleHomeRoutes = {
  patient: '/dashboard',
  staff: '/dashboard',
  admin: '/dashboard'
} as const

function logRedirect(from: string, to: string, reason: string) {
  console.log(`[REDIRECT] From: ${from} -> To: ${to} | Reason: ${reason}`)
}

/**
 * Middleware for route protection and role-based access control
 * Uses Supabase auth for secure session management
 */
export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl
  console.log(`[MIDDLEWARE] Processing route: ${pathname}`)

  // Create initial response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
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
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.delete({
            name,
            ...options,
          })
        },
      },
    }
  )

  // Allow public assets and API routes
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api/') ||
    pathname.startsWith('/static/') ||
    pathname.match(/\.(ico|png|jpg|jpeg|gif|svg)$/)
  ) {
    return response
  }

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  console.log(`[MIDDLEWARE] User authenticated: ${!!user}`)

  // Handle public routes
  if (publicRoutes.includes(pathname)) {
    // If authenticated, redirect to dashboard
    if (user) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/dashboard'
      logRedirect(pathname, '/dashboard', 'Authenticated user accessing public route')
      return NextResponse.redirect(redirectUrl)
    }
    return response
  }

  // Handle root path
  if (pathname === '/') {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = user ? '/dashboard' : '/login'
    logRedirect(pathname, redirectUrl.pathname, user ? 'Root path with auth' : 'Root path without auth')
    return NextResponse.redirect(redirectUrl)
  }

  // Require authentication for all other routes
  if (!user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/login'
    logRedirect(pathname, '/login', 'Unauthenticated user accessing protected route')
    return NextResponse.redirect(redirectUrl)
  }

  // Only fetch role for dashboard routes
  if (pathname.startsWith('/dashboard')) {
    // Get user role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = userData?.role as Role
    console.log(`[MIDDLEWARE] User role: ${role}`)

    if (!role) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/login'
      logRedirect(pathname, '/login', 'User without role')
      return NextResponse.redirect(redirectUrl)
    }

    // Check if user has access to this route
    const hasAccess = protectedRoutes[role]?.some(route => 
      pathname.startsWith(route)
    )

    if (!hasAccess && pathname !== '/dashboard') {
      // Redirect to role-specific home if trying to access unauthorized route
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/dashboard'
      logRedirect(pathname, '/dashboard', `User role ${role} not authorized for this route`)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
} 