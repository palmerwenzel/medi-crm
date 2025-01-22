/**
 * New Case Form Component
 * Client component for creating new medical cases
 * Uses server actions for data mutations
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { createCase } from '@/lib/actions/cases'
import { createCaseSchema, type CreateCaseInput } from '@/lib/validations/case'
import { useToast } from '@/hooks/use-toast'

export function NewCaseForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<CreateCaseInput>({
    resolver: zodResolver(createCaseSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  })

  async function onSubmit(data: CreateCaseInput) {
    try {
      setIsLoading(true)

      const result = await createCase(data)

      if (!result.success) {
        throw new Error(result.error || 'Failed to create case')
      }

      toast({
        title: 'Case created',
        description: 'Your case has been submitted successfully.',
      })

      // Optimistic update
      router.refresh()
      router.push('/dashboard/cases')
    } catch (err) {
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to create case',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="mx-auto w-full max-w-xl">
      <CardHeader>
        <CardTitle>Create New Case</CardTitle>
        <CardDescription>
          Submit a new case for medical review. We'll respond as soon as possible.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onSubmit)} 
            className="space-y-4 animate-in fade-in-50"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Brief description of your case"
                      disabled={isLoading}
                      {...field}
                    />
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
                    <Textarea
                      placeholder="Provide more details about your case"
                      className="min-h-[100px] resize-y"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="sr-only">Creating case...</span>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  <span>Creating case...</span>
                </>
              ) : (
                'Create Case'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 