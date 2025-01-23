'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LucideIcon, 
  Home, 
  Users, 
  FileText, 
  Settings, 
  LogOut,
  Calendar,
  BarChart,
  MessageSquare,
  UserCircle,
  PlusCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/providers/auth-provider"

interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  variant: "default" | "ghost"
  roles: Array<'patient' | 'staff' | 'admin'>
}

const navItems: NavItem[] = [
  {
    title: "Overview",
    href: "/dashboard",
    icon: Home,
    variant: "default",
    roles: ['patient', 'staff', 'admin']
  },
  {
    title: "My Cases",
    href: "/cases",
    icon: FileText,
    variant: "ghost",
    roles: ['patient']
  },
  {
    title: "New Case",
    href: "/cases/new",
    icon: PlusCircle,
    variant: "ghost",
    roles: ['patient']
  },
  {
    title: "Messages",
    href: "/messages",
    icon: MessageSquare,
    variant: "ghost",
    roles: ['patient', 'staff', 'admin']
  },
  {
    title: "My Profile",
    href: "/profile",
    icon: UserCircle,
    variant: "ghost",
    roles: ['patient', 'staff', 'admin']
  },
  // Staff & Admin items
  {
    title: "All Cases",
    href: "/cases",
    icon: FileText,
    variant: "ghost",
    roles: ['staff', 'admin']
  },
  {
    title: "Patients",
    href: "/patients",
    icon: Users,
    variant: "ghost",
    roles: ['staff', 'admin']
  },
  {
    title: "Schedule",
    href: "/schedule",
    icon: Calendar,
    variant: "ghost",
    roles: ['staff', 'admin']
  },
  // Admin only items
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart,
    variant: "ghost",
    roles: ['admin']
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    variant: "ghost",
    roles: ['admin']
  }
]

export function DashboardNav() {
  const pathname = usePathname()
  const { userRole, signOut } = useAuth()

  // Filter nav items based on user role
  const filteredItems = navItems.filter(
    item => userRole && item.roles.includes(userRole)
  )

  return (
    <nav className="grid items-start gap-2">
      {filteredItems.map((item, index) => {
        const Icon = item.icon
        return (
          <Link
            key={index}
            href={item.href}
          >
            <span className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === item.href ? "bg-accent" : "transparent",
              "transition-all duration-200"
            )}>
              <Icon className="mr-2 h-4 w-4" />
              <span>{item.title}</span>
            </span>
          </Link>
        )
      })}
      <Button 
        variant="destructive" 
        className="mt-4 hover:bg-destructive/90"
        onClick={() => signOut?.()}
      >
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </nav>
  )
}