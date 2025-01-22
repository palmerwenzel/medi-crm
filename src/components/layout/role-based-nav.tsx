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

  if (!userRole || !items.length) return null

  return (
    <nav className="flex gap-2">
      {items.map((item) => (
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