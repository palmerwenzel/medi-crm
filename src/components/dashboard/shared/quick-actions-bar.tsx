/**
 * Quick Actions Bar Component
 * Provides role-based quick actions for dashboard views
 */
'use client'

import Link from 'next/link'
import { useAuth } from '@/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardDescription } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'
import { cn } from '@/lib/utils'

interface QuickAction {
  title: string
  description: string
  href: string
  icon: keyof typeof Icons
  variant?: 'default' | 'outline' | 'ghost'
  roles: Array<'patient' | 'staff' | 'admin'>
}

const quickActions: QuickAction[] = [
  {
    title: 'New Case',
    description: 'Create a new medical case',
    href: '/cases/new',
    icon: 'plus',
    variant: 'default',
    roles: ['patient', 'staff', 'admin']
  },
  {
    title: 'Messages',
    description: 'Contact your healthcare team',
    href: '/messages',
    icon: 'messageSquare',
    variant: 'outline',
    roles: ['patient', 'staff', 'admin']
  },
  {
    title: 'Appointments',
    description: 'View upcoming appointments',
    href: '/schedule',
    icon: 'calendar',
    variant: 'outline',
    roles: ['patient', 'staff', 'admin']
  },
  {
    title: 'Documents',
    description: 'Access medical records',
    href: '/documents',
    icon: 'fileText',
    variant: 'outline',
    roles: ['patient']
  },
  {
    title: 'All Cases',
    description: 'View and manage all cases',
    href: '/cases',
    icon: 'cases',
    variant: 'outline',
    roles: ['staff', 'admin']
  },
  {
    title: 'Patients',
    description: 'View all patients',
    href: '/patients',
    icon: 'users',
    variant: 'outline',
    roles: ['staff', 'admin']
  }
]

interface QuickActionsBarProps {
  variant?: 'default' | 'cards'
  className?: string
}

export function QuickActionsBar({ 
  variant = 'default',
  className 
}: QuickActionsBarProps) {
  const { userRole } = useAuth()

  // Filter actions based on user role
  const filteredActions = quickActions.filter(
    action => userRole && action.roles.includes(userRole)
  )

  if (variant === 'cards') {
    return (
      <div className={cn('grid gap-4 md:grid-cols-2 lg:grid-cols-4', className)}>
        {filteredActions.map((action) => {
          const Icon = Icons[action.icon]
          return (
            <Link key={action.href} href={action.href}>
              <Card className="hover:bg-accent/5 transition-colors">
                <CardHeader>
                  <div className="flex flex-col items-center text-center space-y-2">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold">{action.title}</h3>
                    <CardDescription>{action.description}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn('flex flex-wrap gap-4', className)}>
      {filteredActions.map((action) => {
        const Icon = Icons[action.icon]
        return (
          <Button
            key={action.href}
            variant={action.variant}
            asChild
          >
            <Link href={action.href}>
              <Icon className="mr-2 h-4 w-4" />
              {action.title}
            </Link>
          </Button>
        )
      })}
    </div>
  )
} 