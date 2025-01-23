/**
 * SLA Indicator Component
 * Displays SLA status and time remaining for case response/resolution
 * 
 * @example
 * ```tsx
 * <SLAIndicator sla={case.metadata.sla} showDetails />
 * ```
 */
'use client'

import { useMemo } from 'react'
import { differenceInMinutes, formatDistanceToNow } from 'date-fns'
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { SLAMetadata } from '@/lib/validations/case'

/**
 * Props for the SLA Indicator component
 * @property sla - SLA metadata containing targets and status
 * @property showDetails - Whether to show detailed timing information
 * @property className - Optional CSS class names
 */
interface SLAIndicatorProps {
  sla: SLAMetadata
  showDetails?: boolean
  className?: string
}

/**
 * Calculates minutes remaining until a target date
 * @param target - The target date to calculate remaining time for
 * @returns Number of minutes remaining (negative if passed)
 */
function getTimeRemaining(target: Date): number {
  return differenceInMinutes(target, new Date())
}

/**
 * SLA status types for internal tracking
 */
type SLAStatus = 'breached' | 'at_risk' | 'on_track'

/**
 * Configuration for different SLA status displays
 */
interface StatusConfig {
  icon: React.ComponentType<{ className?: string }>
  color: 'destructive' | 'default' | 'secondary'
  label: string
}

/**
 * Determines the current SLA status based on metadata
 * @param sla - The SLA metadata to evaluate
 * @returns Current status of the SLA
 */
function getSLAStatus(sla: SLAMetadata): SLAStatus {
  if (sla.sla_breached) return 'breached'
  
  const responseTarget = new Date(sla.response_target)
  const resolutionTarget = new Date(sla.resolution_target)
  
  const responseRemaining = getTimeRemaining(responseTarget)
  const resolutionRemaining = getTimeRemaining(resolutionTarget)
  
  if (responseRemaining < 0 || resolutionRemaining < 0) return 'breached'
  
  // Consider "at risk" if within specific thresholds
  const isResponseAtRisk = responseRemaining <= 15 // Within 15 minutes
  const isResolutionAtRisk = resolutionRemaining <= 60 // Within 1 hour
  
  return (isResponseAtRisk || isResolutionAtRisk) ? 'at_risk' : 'on_track'
}

/**
 * SLA Indicator component
 * Displays the current SLA status with optional detailed timing information
 */
export function SLAIndicator({ sla, className, showDetails = false }: SLAIndicatorProps) {
  const status = useMemo(() => getSLAStatus(sla), [sla])
  
  const statusConfig: Record<SLAStatus, StatusConfig> = {
    breached: {
      icon: AlertTriangle,
      color: 'destructive',
      label: 'SLA Breached'
    },
    at_risk: {
      icon: Clock,
      color: 'secondary',
      label: 'At Risk'
    },
    on_track: {
      icon: CheckCircle,
      color: 'default',
      label: 'On Track'
    }
  }
  
  const { icon: Icon, color, label } = statusConfig[status]
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('flex items-center gap-2', className)}>
            <Badge variant={color} className="gap-1">
              <Icon className="h-3 w-3" />
              <span>{label}</span>
            </Badge>
            {showDetails && (
              <div className="text-sm text-muted-foreground">
                {status !== 'breached' && (
                  <>
                    {!sla.first_response_at && (
                      <div>
                        Response due: {formatDistanceToNow(new Date(sla.response_target))}
                      </div>
                    )}
                    <div>
                      Resolution due: {formatDistanceToNow(new Date(sla.resolution_target))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-medium">SLA Details</p>
            <p>Tier: {sla.sla_tier}</p>
            {!sla.first_response_at && (
              <p>Response Target: {new Date(sla.response_target).toLocaleString()}</p>
            )}
            <p>Resolution Target: {new Date(sla.resolution_target).toLocaleString()}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
} 