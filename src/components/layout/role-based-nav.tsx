'use client'

import { useAuth } from '@/components/auth/auth-provider'
import { RoleGuard } from '@/components/auth/role-guard'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

// Navigation items by role
const NAV_ITEMS = {
  admin: [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/users', label: 'User Management' },
    { href: '/admin/settings', label: 'System Settings' },
  ],
  staff: [
    { href: '/staff', label: 'Dashboard' },
    { href: '/cases', label: 'Case Queue' },
    { href: '/patients', label: 'Patients' },
  ],
  patient: [
    { href: '/patient', label: 'My Dashboard' },
    { href: '/patient/cases', label: 'My Cases' },
    { href: '/patient/profile', label: 'My Profile' },
  ],
}

type NavItemProps = {
  href: string
  label: string
  isActive?: boolean
}

/**
 * Individual navigation item with active state styling
 */
function NavItem({ href, label, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'px-4 py-2 text-sm font-medium rounded-md transition-colors',
        'hover:bg-secondary/80 hover:text-secondary-foreground',
        isActive && 'bg-secondary text-secondary-foreground',
        !isActive && 'text-muted-foreground'
      )}
    >
      {label}
    </Link>
  )
}

/**
 * Role-specific navigation section
 */
function RoleNavSection({ role }: { role: keyof typeof NAV_ITEMS }) {
  const pathname = usePathname()
  const items = NAV_ITEMS[role]

  return (
    <nav className="flex items-center space-x-4">
      {items.map((item) => (
        <NavItem
          key={item.href}
          href={item.href}
          label={item.label}
          isActive={pathname === item.href}
        />
      ))}
    </nav>
  )
}

/**
 * Main navigation component that renders based on user role
 */
export function RoleBasedNav() {
  const { user } = useAuth()

  if (!user?.role) return null

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        {/* Admin Navigation */}
        <RoleGuard allowedRoles={['admin']}>
          <RoleNavSection role="admin" />
        </RoleGuard>

        {/* Staff Navigation */}
        <RoleGuard allowedRoles={['staff', 'admin']}>
          <RoleNavSection role="staff" />
        </RoleGuard>

        {/* Patient Navigation */}
        <RoleGuard allowedRoles={['patient']}>
          <RoleNavSection role="patient" />
        </RoleGuard>
      </div>
    </header>
  )
} 