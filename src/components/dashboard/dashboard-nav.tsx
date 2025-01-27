'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LucideIcon, 
  Home, 
  Users, 
  FileText, 
  Settings, 
  Calendar,
  BarChart,
  MessageSquare,
  UserCircle,
  PlusCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
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

  // Filter items based on user role
  const filteredNavItems = navItems.filter(
    item => userRole && item.roles.includes(userRole)
  )

  return (
    <nav className="group absolute w-[80px] hover:w-64 h-[calc(100vh-80px)] transition-all duration-300 ease-in-out border-r border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
      {/* Content Container */}
      <div className="h-full py-6 px-4 cursor-pointer flex flex-col overflow-y-auto">
        {/* Navigation Items */}
        <div className="flex-1 flex flex-col gap-3 items-center group-hover:items-start">
          {filteredNavItems.map((item, index) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-4 rounded-lg px-3 py-3 text-sm transition-colors whitespace-nowrap min-h-[48px] w-full",
                  isActive 
                    ? "glass text-white font-medium" 
                    : "text-foreground glass-sm-hover",
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden">
                  {item.title}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}