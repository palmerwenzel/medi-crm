/**
 * File viewer component for previewing different file types
 * Supports images, PDFs, and office documents
 */
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Eye, Download, FileIcon, FileText, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { AllowedMimeType } from '@/lib/utils/file-validation'

interface FileViewerProps {
  url: string
  mimeType: AllowedMimeType
  fileName: string
  className?: string
}

function getFileIcon(mimeType: AllowedMimeType) {
  if (mimeType.startsWith('image/')) return ImageIcon
  if (mimeType === 'application/pdf') return FileText
  return FileIcon
}

export function FileViewer({ url, mimeType, fileName, className }: FileViewerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const Icon = getFileIcon(mimeType)
  const isImage = mimeType.startsWith('image/')
  const isPDF = mimeType === 'application/pdf'
  const isPreviewable = isImage || isPDF

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 truncate text-sm">{fileName}</span>
        <div className="flex items-center gap-1">
          {isPreviewable && (
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <Eye className="h-4 w-4" />
                  <span className="sr-only">Preview {fileName}</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                {isImage && (
                  <div className="relative aspect-video">
                    <Image
                      src={url}
                      alt={fileName}
                      fill
                      className="object-contain"
                      loading="lazy"
                      unoptimized={url.startsWith('blob:')}
                    />
                  </div>
                )}
                {isPDF && (
                  <iframe
                    src={`${url}#toolbar=0`}
                    className="h-[80vh] w-full"
                    title={fileName}
                  />
                )}
              </DialogContent>
            </Dialog>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            asChild
          >
            <a href={url} download={fileName} target="_blank" rel="noopener noreferrer">
              <Download className="h-4 w-4" />
              <span className="sr-only">Download {fileName}</span>
            </a>
          </Button>
        </div>
      </div>
      {isImage && (
        <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-muted">
          <Image
            src={url}
            alt={fileName}
            fill
            className="object-cover"
            loading="lazy"
            unoptimized={url.startsWith('blob:')}
          />
        </div>
      )}
    </div>
  )
} 