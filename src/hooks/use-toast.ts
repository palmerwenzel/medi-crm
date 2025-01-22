/**
 * Toast hook for consistent notifications
 * Uses shadcn/ui toast component
 */

import { useToast as useToastUI } from '@/components/ui/use-toast'

export function useToast() {
  return useToastUI()
} 