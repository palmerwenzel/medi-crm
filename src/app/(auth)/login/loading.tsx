import { Skeleton } from '@/components/ui/skeleton'
import { Logo } from '@/components/ui/logo'

export default function LoginLoading() {
  return (
    <div className="mx-auto w-full px-4 py-8 sm:px-0 md:py-12">
      <div className="relative w-full max-w-sm space-y-6 rounded-lg border border-border bg-card p-4 shadow-md sm:max-w-md sm:p-6">
        <div className="space-y-2 text-center">
          <div className="flex justify-center">
            <Logo size="lg" />
          </div>
          <Skeleton className="mx-auto h-4 w-48" />
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          
          <Skeleton className="h-10 w-full" />
          
          <div className="flex justify-center space-x-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>
    </div>
  )
} 