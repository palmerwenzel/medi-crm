/**
 * Multi-select filter component with popover and command menu
 */

import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Command, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { MultiSelectFilterProps } from '@/types/filters'

export function MultiSelectFilter<T extends string>({
  label,
  options,
  values,
  onChange,
  emptyMessage = 'No options found.',
  className
}: MultiSelectFilterProps<T>) {
  const selectedCount = values === 'all' ? options.length : values.length
  const buttonLabel = selectedCount > 0 ? `${label} (${selectedCount})` : label

  const handleSelect = (value: T) => {
    if (values === 'all') {
      // If all was selected, deselect all except the clicked value
      onChange([value])
      return
    }
    
    const currentValues = [...values]
    const index = currentValues.indexOf(value)
    
    if (index === -1) {
      currentValues.push(value)
    } else {
      currentValues.splice(index, 1)
    }
    
    onChange(currentValues.length === 0 ? 'all' : currentValues)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={false}
          className={cn(
            'justify-between',
            selectedCount > 0 && 'border-primary/50 font-medium',
            className
          )}
        >
          {buttonLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandGroup>
            {options.map(option => (
              <CommandItem
                key={option}
                onSelect={() => handleSelect(option)}
                className="flex items-center gap-2"
              >
                <div className="flex h-4 w-4 items-center justify-center rounded border">
                  {values === 'all' || values.includes(option) ? (
                    <Check className="h-3 w-3" />
                  ) : null}
                </div>
                <span>{option}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 