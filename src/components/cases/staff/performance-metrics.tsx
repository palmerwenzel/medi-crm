/**
 * Performance Metrics Component
 * Displays staff performance statistics and SLA compliance metrics
 * 
 * @example
 * ```tsx
 * <PerformanceMetrics cases={cases} timeframe="week" />
 * ```
 */
'use client'

import { useMemo } from 'react'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Clock, CheckCircle2, AlertTriangle, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CaseResponse } from '@/types/domain/cases'

// Type guard for SLA metadata
function hasSLAMetadata(metadata: unknown): metadata is { 
  sla: { 
    last_updated: string; 
    resolution_target: string; 
  } 
} {
  return (
    typeof metadata === 'object' &&
    metadata !== null &&
    'sla' in metadata &&
    typeof metadata.sla === 'object' &&
    metadata.sla !== null &&
    'last_updated' in metadata.sla &&
    'resolution_target' in metadata.sla &&
    typeof metadata.sla.last_updated === 'string' &&
    typeof metadata.sla.resolution_target === 'string'
  )
}

/**
 * Time periods for metric calculations
 */
type TimeFrame = 'day' | 'week' | 'month'

/**
 * Props for the Performance Metrics component
 */
interface PerformanceMetricsProps {
  cases: CaseResponse[]
  timeframe?: TimeFrame
  isLoading?: boolean
  className?: string
}

/**
 * Props for individual metric cards
 */
interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ComponentType<{ className?: string }>
  trend?: {
    direction: 'up' | 'down'
    value: number
  }
  className?: string
}

/**
 * Calculated metrics from case data
 */
interface CaseMetrics {
  total: number
  resolved: number
  inProgress: number
  slaCompliance: number
  avgResolutionTime: number
}

/**
 * Individual metric card component
 */
function MetricCard({ title, value, description, icon: Icon, trend, className }: MetricCardProps) {
  return (
    <Card className={cn('p-4 relative overflow-hidden', className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h4 className="text-2xl font-bold mt-1">{value}</h4>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      {trend && (
        <div className={cn(
          'text-xs font-medium mt-2',
          trend.direction === 'up' ? 'text-green-500' : 'text-red-500'
        )}>
          {trend.direction === 'up' ? '↑' : '↓'} {trend.value}%
        </div>
      )}
    </Card>
  )
}

/**
 * Calculates metrics from case data
 */
function calculateMetrics(cases: CaseResponse[]): CaseMetrics | null {
  if (!cases.length) return null

  const total = cases.length
  const resolved = cases.filter(c => c.status === 'resolved').length
  const inProgress = cases.filter(c => c.status === 'in_progress').length
  
  // Calculate SLA metrics
  const slaBreached = cases.filter(c => 
    hasSLAMetadata(c.metadata) && 
    new Date(c.metadata.sla.last_updated) > new Date(c.metadata.sla.resolution_target)
  ).length
  const slaCompliance = total ? ((total - slaBreached) / total) * 100 : 100
  
  // Calculate average resolution time (in hours)
  const resolutionTimes = cases
    .filter(c => c.status === 'resolved' && c.created_at && c.updated_at)
    .map(c => {
      const start = new Date(c.created_at)
      const end = new Date(c.updated_at)
      return (end.getTime() - start.getTime()) / (1000 * 60 * 60) // hours
    })
  
  const avgResolutionTime = resolutionTimes.length
    ? resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length
    : 0

  return {
    total,
    resolved,
    inProgress,
    slaCompliance,
    avgResolutionTime
  }
}

/**
 * Performance Metrics component
 * Displays key performance indicators for case management
 */
export function PerformanceMetrics({ 
  cases, 
  timeframe = 'week',
  isLoading,
  className 
}: PerformanceMetricsProps) {
  const metrics = useMemo(() => calculateMetrics(cases), [cases])

  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </Card>
        ))}
      </div>
    )
  }

  if (!metrics) return null

  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      <MetricCard
        title="Total Cases"
        value={metrics.total}
        icon={BarChart3}
        description={`Active cases this ${timeframe}`}
      />
      <MetricCard
        title="Resolution Rate"
        value={`${((metrics.resolved / metrics.total) * 100).toFixed(1)}%`}
        icon={CheckCircle2}
        description={`${metrics.resolved} of ${metrics.total} cases resolved`}
      />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <MetricCard
                title="SLA Compliance"
                value={`${metrics.slaCompliance.toFixed(1)}%`}
                icon={AlertTriangle}
                description="Cases within SLA targets"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Percentage of cases handled within SLA time limits</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <MetricCard
                title="Avg. Resolution Time"
                value={`${metrics.avgResolutionTime.toFixed(1)}h`}
                icon={Clock}
                description="Average time to resolve"
              />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Average time taken to resolve cases</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
} 