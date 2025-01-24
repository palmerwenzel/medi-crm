'use client'

import { useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form'
import { Send } from 'lucide-react'

const formSchema = z.object({
  message: z.string().min(1).max(1000)
})

type FormData = z.infer<typeof formSchema>

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<void>
  onTyping?: (isTyping: boolean) => void
  isLoading?: boolean
  className?: string
}

export function ChatInput({
  onSendMessage,
  onTyping,
  isLoading,
  className
}: ChatInputProps) {
  const typingTimeoutRef = useRef<NodeJS.Timeout>()
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: ''
    }
  })

  // Handle typing indicator
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'message' && onTyping) {
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current)
        }

        onTyping(true)
        typingTimeoutRef.current = setTimeout(() => {
          onTyping(false)
        }, 1000)
      }
    })

    return () => subscription.unsubscribe()
  }, [form, onTyping])

  const onSubmit = async (data: FormData) => {
    try {
      await onSendMessage(data.message)
      form.reset()
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={cn('space-y-2 p-4', className)}
      >
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <div className="flex items-end space-x-2">
                  <Textarea
                    {...field}
                    placeholder="Type a message..."
                    className="min-h-[80px] flex-1 resize-none"
                    disabled={isLoading}
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={isLoading}
                  >
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send message</span>
                  </Button>
                </div>
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
} 