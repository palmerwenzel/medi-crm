import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

type Role = Database['public']['Tables']['users']['Row']['role']

// Define route access patterns
const publicRoutes = ['/login', '/signup']
const patientRoutes = ['/dashboard']
const staffRoutes = ['/dashboard']
const adminRoutes = ['/dashboard']

// Define route prefixes for protected features
const protectedRoutes = {
  patient: ['/dashboard/cases'],
  staff: ['/dashboard/cases', '/dashboard/patients'],
  admin: ['/dashboard/cases', '/dashboard/patients', '/dashboard/settings']
}

// Define home routes for each role
const roleHomeRoutes = {
  patient: '/dashboard',
  staff: '/dashboard',
  admin: '/dashboard'
} as const

/**
 * Middleware for route protection and role-based access control
 * Uses Supabase auth for secure session management
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create Supabase client with minimal cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { pathname } = request.nextUrl
  const { data: { user } } = await supabase.auth.getUser()

  // Handle public routes
  if (publicRoutes.some(route => pathname === route)) {
    // Redirect authenticated users to their home page
    if (user) {
      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (data?.role && data.role in roleHomeRoutes) {
        return NextResponse.redirect(
          new URL(roleHomeRoutes[data.role as keyof typeof roleHomeRoutes], request.url)
        )
      }
    }
    return response
  }

  // Require authentication for all other routes
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Get and validate user role
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = userData?.role as Role

  if (!role) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Handle role-based access
  switch (role) {
    case 'admin':
      // Admins can access all routes under /dashboard
      if (pathname.startsWith('/dashboard')) {
        return response
      }
      break

    case 'staff':
      // Staff can access their routes and patient routes
      if ([...protectedRoutes.staff, ...protectedRoutes.patient].some(route => pathname.startsWith(route))) {
        return response
      }
      break

    case 'patient':
      // Patients can only access patient routes
      if (protectedRoutes.patient.some(route => pathname.startsWith(route))) {
        return response
      }
      break
  }

  // Redirect unauthorized access to role-specific home
  return NextResponse.redirect(new URL(roleHomeRoutes[role], request.url))
} 