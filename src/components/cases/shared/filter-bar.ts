import type { CaseStatus, CasePriority } from '@/lib/validations/case'

export interface CaseFilters {
  status?: CaseStatus | 'all'
  priority?: CasePriority | 'all'
  search?: string
  sortBy?: 'created_at' | 'updated_at' | 'title' | 'priority' | 'status'
  sortOrder?: 'asc' | 'desc'
  dateRange?: {
    from?: string
    to?: string
  }
} 