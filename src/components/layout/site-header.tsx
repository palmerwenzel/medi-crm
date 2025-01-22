import { RoleBasedNav } from './role-based-nav'

// Navigation items by role
const NAV_ITEMS = {
  admin: [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Cases', href: '/cases' },
    { title: 'Patients', href: '/patients' },
    { title: 'Users', href: '/users' },
    { title: 'Settings', href: '/settings' }
  ],
  staff: [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Cases', href: '/cases' },
    { title: 'Patients', href: '/patients' }
  ],
  patient: [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'My Cases', href: '/cases' },
    { title: 'Profile', href: '/profile' }
  ]
}

interface SiteHeaderProps {
  userRole: string | null
}

export function SiteHeader({ userRole }: SiteHeaderProps) {
  // Get role-specific navigation items or empty array if role not found
  const navItems = userRole ? NAV_ITEMS[userRole as keyof typeof NAV_ITEMS] || [] : []

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <RoleBasedNav items={navItems} userRole={userRole} />
      </div>
    </header>
  )
} 