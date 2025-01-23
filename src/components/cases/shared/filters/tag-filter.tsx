'use client'

import { useState, useCallback } from 'react'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

interface TagFilterProps {
  values: string[] | 'all'
  onChange: (values: string[] | 'all') => void
  className?: string
}

export function TagFilter({ values, onChange, className }: TagFilterProps) {
  const [newTag, setNewTag] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const handleAddTag = useCallback(() => {
    if (!newTag.trim()) return
    
    const tag = newTag.trim().toLowerCase()
    if (values === 'all') {
      onChange([tag])
    } else if (!values.includes(tag)) {
      onChange([...values, tag])
    }
    setNewTag('')
  }, [newTag, values, onChange])

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    if (values === 'all') return
    onChange(values.filter(tag => tag !== tagToRemove))
  }, [values, onChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }, [handleAddTag])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={isOpen}
          className={cn('justify-between', className)}
        >
          <span>Tags</span>
          {values !== 'all' && values.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {values.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-4">
        <div className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add a tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <Button onClick={handleAddTag}>Add</Button>
          </div>
          {values !== 'all' && values.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {values.map(tag => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {tag} tag</span>
                  </Button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
} 