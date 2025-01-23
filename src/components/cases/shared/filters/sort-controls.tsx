/**
 * Sort controls component for case management
 */

import { ArrowDownAZ, ArrowUpAZ } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { SortControlsProps } from '@/types/filters'

const SORT_OPTIONS = [
  { value: 'created_at', label: 'Created Date' },
  { value: 'updated_at', label: 'Updated Date' },
  { value: 'priority', label: 'Priority' }
] as const

export function SortControls({
  sortBy,
  sortOrder,
  onSortChange,
  className
}: SortControlsProps) {
  const toggleSortOrder = () => {
    onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc')
  }

  const handleSortByChange = (value: typeof SORT_OPTIONS[number]['value']) => {
    onSortChange(value, sortOrder)
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Select
        value={sortBy}
        onValueChange={handleSortByChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map(option => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="icon"
        onClick={toggleSortOrder}
        className={cn(
          'h-10 w-10',
          sortOrder === 'asc' && 'border-primary/50'
        )}
      >
        {sortOrder === 'asc' ? (
          <ArrowUpAZ className="h-4 w-4" />
        ) : (
          <ArrowDownAZ className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
} 