/**
 * File upload zone component with drag and drop support
 * Handles file selection, preview, and upload progress
 */
'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { UploadCloud } from 'lucide-react'
import { validateFile, type AllowedMimeType } from '@/lib/utils/file-validation'
import { sanitizeFileName } from '@/lib/utils/sanitize'
import { FilePreview } from './file-preview'

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void
  onFileRemoved: (fileName: string) => void
  uploadProgress?: Record<string, number>
  fileUrls?: Record<string, string>
  maxFiles?: number
  maxSize?: number // in bytes
  acceptedTypes?: AllowedMimeType[]
  disabled?: boolean
  className?: string
}

export function FileUploadZone({
  onFilesSelected,
  onFileRemoved,
  uploadProgress = {},
  fileUrls = {},
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  disabled = false,
  className,
}: FileUploadZoneProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Check if adding new files would exceed maxFiles
      if (selectedFiles.length + acceptedFiles.length > maxFiles) {
        setError(`You can only upload up to ${maxFiles} files`)
        return
      }

      // Validate each file
      const validationResults = await Promise.all(
        acceptedFiles.map(async file => {
          const result = await validateFile(file, acceptedTypes)
          return {
            file,
            ...result,
          }
        })
      )

      // Filter out invalid files and collect error messages
      const validFiles: File[] = []
      const errors: string[] = []

      validationResults.forEach(({ file, isValid, error }) => {
        if (isValid) {
          validFiles.push(file)
        } else if (error) {
          errors.push(`${sanitizeFileName(file.name)}: ${error.message}`)
        }
      })

      if (errors.length > 0) {
        setError(errors.join('\n'))
        return
      }

      // Update selected files
      const newFiles = [...selectedFiles, ...validFiles]
      setSelectedFiles(newFiles)
      onFilesSelected(validFiles)
      setError(null)
    },
    [selectedFiles, maxFiles, acceptedTypes, onFilesSelected]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    disabled,
    maxFiles: maxFiles - selectedFiles.length,
  })

  const handleRemove = (fileName: string) => {
    setSelectedFiles((prev) => prev.filter((file) => file.name !== fileName))
    onFileRemoved(fileName)
    setError(null)
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'relative rounded-lg border-2 border-dashed border-muted-foreground/25 p-6',
          'transition-all duration-200 ease-in-out',
          isDragActive && 'border-primary/50 bg-primary/5 scale-[1.02]',
          disabled && 'cursor-not-allowed opacity-60',
          'hover:border-primary/50'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-1 text-center">
          <UploadCloud className="h-8 w-8 text-muted-foreground transition-transform duration-200 ease-in-out group-hover:scale-110" />
          <p className="text-sm text-muted-foreground">
            {isDragActive
              ? 'Drop the files here'
              : `Drag & drop files here, or click to select`}
          </p>
          <p className="text-xs text-muted-foreground">
            {acceptedTypes.join(', ')} up to {maxSize / 1024 / 1024}MB
          </p>
        </div>
      </div>

      {error && (
        <Alert 
          variant="destructive"
          className="animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <AlertDescription className="whitespace-pre-line">{error}</AlertDescription>
        </Alert>
      )}

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          {selectedFiles.map((file, index) => (
            <FilePreview
              key={file.name}
              file={file}
              url={fileUrls[file.name]}
              progress={uploadProgress[file.name]}
              onRemove={() => handleRemove(file.name)}
              disabled={disabled}
              className={cn(
                'animate-in fade-in slide-in-from-right-2',
                'transition-all duration-200 ease-in-out hover:bg-accent',
                { 'delay-150': index === 0 },
                { 'delay-300': index === 1 },
                { 'delay-500': index === 2 }
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
} 