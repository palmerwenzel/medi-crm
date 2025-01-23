import type { CaseStatus, CasePriority } from '@/lib/validations/case'

export function getStatusVariant(status: CaseStatus): 'default' | 'secondary' | 'destructive' {
  switch (status) {
    case 'open':
      return 'default'
    case 'in_progress':
      return 'secondary'
    case 'resolved':
      return 'destructive'
    default:
      return 'default'
  }
}

export function getPriorityVariant(priority: CasePriority): 'default' | 'secondary' | 'destructive' {
  switch (priority) {
    case 'low':
      return 'default'
    case 'medium':
      return 'secondary'
    case 'high':
    case 'urgent':
      return 'destructive'
    default:
      return 'default'
  }
}

export function formatStatus(status: CaseStatus) {
  return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
}

export function formatPriority(priority: CasePriority) {
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const statusColors = {
  open: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  in_progress: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  resolved: 'bg-green-500/10 text-green-500 border-green-500/20'
} as const

export const priorityColors = {
  low: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
  medium: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  high: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
  urgent: 'bg-red-500/10 text-red-500 border-red-500/20'
} as const 