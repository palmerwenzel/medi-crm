/**
 * Form for creating a new case with rich text description and file attachments
 * Only accessible to patients
 */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { casesInsertSchema } from '@/lib/validations/cases'
import type { CaseInsert, CaseDepartment } from '@/types/domain/cases'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/providers/auth-provider'
import { createCase } from '@/lib/actions/cases'
import { RichTextEditor } from './shared/rich-text-editor'
import { FileUploadZone } from './shared/file-upload'

type FormData = Omit<CaseInsert, 'attachments' | 'department' | 'patient_id' | 'status' | 'category'> & {
  attachments: string[]
  department: CaseDepartment
}

export function NewCaseForm() {
  const { toast } = useToast()
  const router = useRouter()
  const { user, userRole } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  const form = useForm<FormData>({
    resolver: zodResolver(casesInsertSchema.omit({ patient_id: true, status: true, category: true })),
    defaultValues: {
      title: '',
      description: '',
      department: 'primary_care',
      priority: 'low',
      attachments: [],
    },
  })

  // Handle unauthorized access
  useEffect(() => {
    if (!user || userRole !== 'patient') {
      router.push('/dashboard')
    }
  }, [router, user, userRole])

  // Only patients can create cases
  if (!user || userRole !== 'patient') {
    return null
  }

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
    const attachments = form.getValues('attachments')
    form.setValue(
      'attachments',
      attachments.filter(url => !url.includes(fileName))
    )
    setUploadProgress((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [fileName]: ignored, ...rest } = prev
      return rest
    })
  }

  const onSubmit = async (data: FormData) => {
    try {
      console.log('Starting case creation with data:', data);
      setIsSubmitting(true);
      const loadingToast = toast({
        title: 'Creating case...',
        description: 'Please wait while we create your case.',
        variant: 'loading',
      });

      // Add required fields that are not in the form
      const fullData = {
        ...data,
        patient_id: user.id,
        status: 'open' as const,
        category: 'general' as const,
      };

      console.log('Calling createCase server action with:', fullData);
      const result = await createCase(fullData);
      console.log('Got result from createCase:', result);
      
      if (!result.success) {
        console.error('Case creation failed:', result.error);
        loadingToast.dismiss();
        toast({
          title: 'Error',
          description: result.error || 'Failed to create case',
          variant: 'destructive',
        });
        return;
      }

      console.log('Case created successfully:', result.data);
      loadingToast.dismiss();
      toast({
        title: 'Success',
        description: 'Case created successfully',
      });
      form.reset();
      router.push('/cases');
    } catch (error) {
      console.error('Error in case creation:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create case. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
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
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Priority</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {['low', 'medium', 'high'].map(priority => (
                    <SelectItem key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {['primary_care', 'specialty_care', 'emergency', 'surgery', 'mental_health'].map(dept => (
                    <SelectItem key={dept} value={dept}>
                      {dept.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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