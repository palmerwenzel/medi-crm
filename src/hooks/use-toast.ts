/**
 * Toast hook wrapper
 * Re-exports the toast hook with our custom configuration
 */

import { useToast as useToastUI } from '@/components/ui/use-toast'

export function useToast() {
  return useToastUI()
}

export { toast } from '@/components/ui/use-toast' 