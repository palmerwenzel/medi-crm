/**
 * Shared case list component with role-based filtering
 * Used by both dashboard and full case management views
 */
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Clock, FileText } from 'lucide-react'
import Link from 'next/link'

// Type definitions based on database schema
type CaseStatus = 'open' | 'in_progress' | 'resolved'
type CasePriority = 'low' | 'medium' | 'high' | 'urgent'
type CaseCategory = 'general' | 'followup' | 'prescription' | 'test_results' | 'emergency'

interface Case {
  id: string
  title: string
  description: string
  status: CaseStatus
  priority: CasePriority
  category: CaseCategory
  created_at: string
  attachments: string[]
  assigned_to: { id: string; full_name: string } | null
  patient: { id: string; full_name: string }
}

interface CaseListProps {
  userRole: string
  userId: string
  limit?: number
  showActions?: boolean
  isDashboard?: boolean
}

export function CaseList({ 
  userRole, 
  userId, 
  limit, 
  showActions = true,
  isDashboard = false 
}: CaseListProps) {
  const [cases, setCases] = useState<Case[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // Status badge colors
  const statusColors: Record<CaseStatus, string> = {
    open: 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
    in_progress: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
    resolved: 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
  }

  // Priority badge colors
  const priorityColors: Record<CasePriority, string> = {
    low: 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20',
    medium: 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
    high: 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20',
    urgent: 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
  }

  useEffect(() => {
    async function loadCases() {
      let query = supabase
        .from('cases')
        .select(`
          *,
          assigned_to:users!cases_assigned_to_fkey(id, first_name, last_name),
          patient:users!cases_patient_id_fkey(id, first_name, last_name)
        `)
        .order('created_at', { ascending: false })

      // Role-based filtering
      switch (userRole) {
        case 'patient':
          query = query.eq('patient_id', userId)
          break
        case 'staff':
          query = query.eq('assigned_to', userId)
          break
        // Admin sees all cases
      }

      if (limit) {
        query = query.limit(limit)
      }

      const { data, error } = await query
      
      if (error) {
        console.error('Failed to fetch cases:', error)
      }

      // Transform the data to combine first_name and last_name into full_name
      const transformedData = data?.map(case_ => ({
        ...case_,
        assigned_to: case_.assigned_to ? {
          id: case_.assigned_to.id,
          full_name: `${case_.assigned_to.first_name || ''} ${case_.assigned_to.last_name || ''}`.trim()
        } : null,
        patient: {
          id: case_.patient.id,
          full_name: `${case_.patient.first_name || ''} ${case_.patient.last_name || ''}`.trim()
        }
      })) || []

      setCases(transformedData)
      setIsLoading(false)
    }

    loadCases()
  }, [userRole, userId, limit])

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-16 bg-muted rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  const basePath = isDashboard ? '/dashboard/cases' : '/cases'

  return (
    <div className="space-y-4">
      {cases.map((case_) => (
        <Link key={case_.id} href={`${basePath}/${case_.id}`}>
          <Card className="hover:bg-accent/5 transition-colors">
            <CardHeader>
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{case_.title}</h3>
                    <Badge 
                      variant="secondary"
                      className={statusColors[case_.status]}
                    >
                      {case_.status.replace('_', ' ')}
                    </Badge>
                    {case_.priority === 'high' || case_.priority === 'urgent' ? (
                      <Badge 
                        variant="secondary"
                        className={priorityColors[case_.priority]}
                      >
                        {case_.priority}
                      </Badge>
                    ) : null}
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {case_.description?.slice(0, 100)}...
                  </p>

                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {case_.assigned_to ? (
                      <div className="flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>Assigned: {case_.assigned_to.full_name}</span>
                      </div>
                    ) : null}
                    
                    {case_.patient && (
                      <div className="flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        <span>Patient: {case_.patient.full_name}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(case_.created_at).toLocaleDateString()}</span>
                    </div>

                    {case_.attachments?.length > 0 && (
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4" />
                        <span>{case_.attachments.length} attachments</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>
      ))}

      {showActions && cases.length > 0 && (
        <div className="flex justify-end">
          <Button variant="outline" asChild>
            <Link href={basePath}>
              View All Cases
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
} 