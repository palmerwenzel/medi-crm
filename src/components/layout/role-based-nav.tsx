'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'

interface NavItem {
  title: string
  href: string
  disabled?: boolean
}

interface RoleBasedNavProps {
  items: NavItem[]
  userRole: string | null
}

export function RoleBasedNav({ items, userRole }: RoleBasedNavProps) {
  const pathname = usePathname()

  const roleBasedItems = items.filter(item => {
    if (!userRole) return false
    
    // Admin can access all routes
    if (userRole === 'admin') return true
    
    // Staff can access staff and patient routes
    if (userRole === 'staff') {
      return !item.href.startsWith('/admin')
    }
    
    // Patients can only access patient routes
    if (userRole === 'patient') {
      return item.href.startsWith('/patient')
    }

    return false
  })

  return (
    <nav className="flex gap-2">
      {roleBasedItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            pathname === item.href
              ? 'bg-muted hover:bg-muted'
              : 'hover:bg-transparent hover:underline',
            'justify-start'
          )}
        >
          {item.title}
        </Link>
      ))}
    </nav>
  )
} 