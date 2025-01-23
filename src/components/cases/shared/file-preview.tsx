/**
 * Enhanced file preview component with progress tracking
 * Shows file metadata and preview using FileViewer
 */
'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { FileViewer } from './file-viewer'
import type { AllowedMimeType } from '@/lib/utils/file-validation'

interface FilePreviewProps {
  file: File
  url?: string
  progress?: number
  onRemove: () => void
  disabled?: boolean
  className?: string
}

export function FilePreview({ 
  file, 
  url, 
  progress, 
  onRemove, 
  disabled, 
  className 
}: FilePreviewProps) {
  const isUploading = typeof progress === 'number' && progress < 100
  const showPreview = !isUploading && url

  return (
    <div 
      className={cn(
        'rounded-md border bg-card p-3',
        disabled && 'opacity-60',
        className
      )}
    >
      {isUploading ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Uploading {file.name}...</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={disabled}
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Cancel upload</span>
            </Button>
          </div>
          <Progress value={progress} className="h-1" />
        </div>
      ) : showPreview ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Uploaded</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              disabled={disabled}
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove file</span>
            </Button>
          </div>
          <FileViewer
            url={url}
            mimeType={file.type as AllowedMimeType}
            fileName={file.name}
          />
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{file.name}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={disabled}
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove file</span>
          </Button>
        </div>
      )}
    </div>
  )
} 