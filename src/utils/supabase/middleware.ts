import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

// Define route access patterns
const publicRoutes = ['/auth/login', '/auth/signup', '/auth/verify-email']
const patientRoutes = ['/patient', '/profile']
const staffRoutes = ['/staff', '/cases', '/patients']
const adminRoutes = ['/admin', '/settings']

// Define home routes for each role
const roleHomeRoutes = {
  patient: '/patient',
  staff: '/staff',
  admin: '/admin'
} as const

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient<Database>(
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
              headers: request.headers,
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
              headers: request.headers,
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

  // IMPORTANT: Get user immediately after client creation
  const { data: { user } } = await supabase.auth.getUser()

  // Get URL info
  const { pathname } = request.nextUrl

  // Get user role if logged in
  let userRole: keyof typeof roleHomeRoutes | undefined
  if (user) {
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()
    userRole = userData?.role as keyof typeof roleHomeRoutes
  }

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    // If user is already logged in, redirect to their role-specific home
    if (user && userRole) {
      return NextResponse.redirect(new URL(roleHomeRoutes[userRole], request.url))
    }
    return response
  }

  // Check authentication
  if (!user) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (!userRole) {
    throw new Error('User role not found')
  }

  // Handle role-based access
  switch (userRole) {
    case 'admin':
      // Admins can access all routes
      return response

    case 'staff':
      // Staff can access staff routes and patient routes
      if ([...staffRoutes, ...patientRoutes].some(route => pathname.startsWith(route))) {
        return response
      }
      break

    case 'patient':
      // Patients can only access patient routes
      if (patientRoutes.some(route => pathname.startsWith(route))) {
        return response
      }
      break
  }

  // Redirect unauthorized access to role-specific home
  return NextResponse.redirect(new URL(roleHomeRoutes[userRole], request.url))
} 