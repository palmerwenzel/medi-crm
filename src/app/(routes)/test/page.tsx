'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TestPage() {
  const [testMessage, setTestMessage] = useState<string>('')
  const [error, setError] = useState<string>('')

  const testConnection = async () => {
    try {
      // Test query to check if we can connect to the users table
      const { data, error } = await supabase
        .from('users')
        .select('id, email, role')
        .limit(1)

      if (error) throw error

      setTestMessage(
        data?.length 
          ? `Successfully connected! Found user with role: ${data[0].role}`
          : 'Connected successfully! No users found yet.'
      )
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to Supabase')
      setTestMessage('')
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Supabase Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testConnection}>
            Test Connection
          </Button>
          
          {testMessage && (
            <p className="text-green-600 dark:text-green-400">{testMessage}</p>
          )}
          
          {error && (
            <p className="text-red-600 dark:text-red-400">{error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 