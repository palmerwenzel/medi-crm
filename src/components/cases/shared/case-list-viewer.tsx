import { ScrollArea } from '@/components/ui/scroll-area'
import { motion } from 'framer-motion'
import { CaseListItem } from './case-list-item'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { CaseResponse } from '@/types/domain/cases'

interface CaseListViewerProps {
  cases: CaseResponse[]
  selectedCases?: string[]
  onSelect?: (id: string) => void
  showNotes?: boolean
  basePath?: string
  isStaffOrAdmin?: boolean
  hasMore?: boolean
  loadMoreRef?: React.RefObject<HTMLDivElement> | ((node?: Element | null) => void)
  className?: string
}

export function CaseListViewer({
  cases,
  selectedCases = [],
  onSelect,
  showNotes = false,
  basePath = '/cases',
  isStaffOrAdmin = false,
  hasMore = false,
  loadMoreRef,
  className
}: CaseListViewerProps) {
  return (
    <div className={cn('flex-1 min-h-0 relative', className)}>
      <ScrollArea className="h-full">
        <div 
          className="space-y-2 p-4" 
          role="list" 
          aria-label="Case list"
          aria-live="polite"
        >
          {cases.map((case_) => (
            <motion.div
              key={case_.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <CaseListItem
                case_={case_}
                isSelected={selectedCases.includes(case_.id)}
                onSelect={onSelect}
                showNotes={showNotes}
                basePath={basePath}
                isStaffOrAdmin={isStaffOrAdmin}
              />
            </motion.div>
          ))}
          {hasMore && (
            <div 
              ref={loadMoreRef} 
              className="h-20 flex items-center justify-center"
              aria-hidden="true"
            >
              <Skeleton className="h-12 w-full" />
            </div>
          )}
          {!hasMore && cases.length === 0 && (
            <div 
              className="text-center py-8 text-muted-foreground"
              role="status"
              aria-label="No cases found"
            >
              No cases found
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
} 