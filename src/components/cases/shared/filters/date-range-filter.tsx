/**
 * Date range filter component with calendar popover
 */

import { Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { DateRangeFilterProps } from '@/types/filters'
import type { DateRange } from 'react-day-picker'

export function DateRangeFilter({
  value,
  onChange,
  className
}: DateRangeFilterProps) {
  const hasDateRange = value?.from && value?.to
  const buttonLabel = hasDateRange && value.from && value.to
    ? `${format(value.from, 'LLL dd')} - ${format(value.to, 'LLL dd')}`
    : 'Date Range'

  const handleSelect = (range: DateRange | undefined) => {
    onChange(range ? { from: range.from, to: range.to } : undefined)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-between',
            hasDateRange && 'border-primary/50 font-medium',
            className
          )}
        >
          <span className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            {buttonLabel}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          initialFocus
          mode="range"
          defaultMonth={new Date()}
          selected={value && value.from && value.to ? { from: value.from, to: value.to } as DateRange : undefined}
          onSelect={handleSelect}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  )
} 