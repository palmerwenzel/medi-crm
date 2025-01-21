import { RoleBasedNav } from './role-based-nav'

// Navigation items by role
const NAV_ITEMS = [
  // Admin routes
  { title: 'Admin Dashboard', href: '/admin' },
  { title: 'User Management', href: '/admin/users' },
  { title: 'System Settings', href: '/admin/settings' },
  // Staff routes
  { title: 'Staff Dashboard', href: '/staff' },
  { title: 'Case Queue', href: '/cases' },
  { title: 'Patients', href: '/patients' },
  // Patient routes
  { title: 'My Dashboard', href: '/patient' },
  { title: 'My Cases', href: '/patient/cases' },
  { title: 'My Profile', href: '/patient/profile' },
]

interface SiteHeaderProps {
  userRole: string | null
}

export function SiteHeader({ userRole }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <RoleBasedNav items={NAV_ITEMS} userRole={userRole} />
      </div>
    </header>
  )
} 