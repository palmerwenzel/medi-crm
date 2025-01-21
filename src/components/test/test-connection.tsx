'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface TestConnectionProps {
  initialMessage: string
  hasError: boolean
}

export function TestConnection({ initialMessage, hasError }: TestConnectionProps) {
  const [message, setMessage] = useState(initialMessage)
  const [isError, setIsError] = useState(hasError)

  const testConnection = async () => {
    try {
      const response = await fetch('/api/test')
      const data = await response.json()

      if (!response.ok) throw new Error(data.error)

      setMessage(data.message)
      setIsError(false)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to test connection')
      setIsError(true)
    }
  }

  return (
    <div className="space-y-4">
      <Button onClick={testConnection}>
        Test Connection
      </Button>
      
      {message && (
        <p className={isError ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}>
          {message}
        </p>
      )}
    </div>
  )
} 