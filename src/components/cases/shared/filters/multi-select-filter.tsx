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
  selected,
  onChange,
  placeholder = 'Select...',
  emptyMessage = 'No options found.'
}: MultiSelectFilterProps<T>) {
  const selectedCount = selected.length
  const buttonLabel = selectedCount > 0 ? `${label} (${selectedCount})` : label

  const handleSelect = (value: T) => {
    const currentValues = [...selected]
    const index = currentValues.indexOf(value)
    
    if (index === -1) {
      currentValues.push(value)
    } else {
      currentValues.splice(index, 1)
    }
    
    onChange(currentValues)
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
            selectedCount > 0 && 'border-primary/50 font-medium'
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
                  {selected.includes(option) && (
                    <Check className="h-3 w-3" />
                  )}
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