/**
 * Form for creating a new case with rich text description and file attachments
 * Only accessible to patients
 */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createCaseSchema } from '@/lib/validations/case'
import type { CreateCaseInput } from '@/lib/validations/case'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/providers/auth-provider'
import { createCase } from '@/lib/actions/cases'
import { RichTextEditor } from './shared/rich-text-editor'
import { FileUploadZone } from './shared/file-upload'

export function NewCaseForm() {
  const { toast } = useToast()
  const router = useRouter()
  const { user, userRole } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  // Only patients can create cases
  if (!user || userRole !== 'patient') {
    router.push('/dashboard')
    return null
  }

  const form = useForm<CreateCaseInput>({
    resolver: zodResolver(createCaseSchema),
    defaultValues: {
      title: '',
      description: '',
      attachments: [],
    },
  })

  const handleFilesSelected = (files: File[]) => {
    // Simulate upload progress for each file
    files.forEach((file) => {
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          const currentProgress = prev[file.name] || 0
          if (currentProgress >= 100) {
            clearInterval(interval)
            return prev
          }
          return {
            ...prev,
            [file.name]: currentProgress + 10,
          }
        })
      }, 500)
    })

    // In a real implementation, you would upload files to your storage service here
    // and update the form's attachments field with the returned URLs
    form.setValue(
      'attachments',
      files.map((file) => URL.createObjectURL(file))
    )
  }

  const handleFileRemoved = (fileName: string) => {
    const attachments = form.getValues('attachments') || []
    form.setValue(
      'attachments',
      attachments.filter((url) => !url.includes(fileName))
    )
    setUploadProgress((prev) => {
      const { [fileName]: removed, ...rest } = prev
      return rest
    })
  }

  const onSubmit = async (data: CreateCaseInput) => {
    try {
      setIsSubmitting(true)
      await createCase(data)
      toast({
        title: 'Success',
        description: 'Case created successfully',
      })
      form.reset()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create case. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter case title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <RichTextEditor
                  content={field.value}
                  onChange={field.onChange}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="attachments"
          render={() => (
            <FormItem>
              <FormLabel>Attachments</FormLabel>
              <FormControl>
                <FileUploadZone
                  onFilesSelected={handleFilesSelected}
                  onFileRemoved={handleFileRemoved}
                  uploadProgress={uploadProgress}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Case'}
        </Button>
      </form>
    </Form>
  )
} 