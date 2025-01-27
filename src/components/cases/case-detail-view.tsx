'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Button } from '@/components/ui/button'
import { MessageSquare, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCase } from '@/hooks/cases/use-case'
import { useCaseHistory } from './shared/hooks/use-case-history'
import { CaseMetadata } from './case-metadata'
import { CaseStatusBadge } from './case-status-badge'
import { CaseTimeline } from './shared/case-timeline'
import { ChatPanel } from '@/components/chat/chat-panel'

interface CaseDetailViewProps {
  caseId: string
  initialPanel?: string
}

export function CaseDetailView({ caseId, initialPanel }: CaseDetailViewProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [showChat, setShowChat] = useState(initialPanel === 'chat')
  const { case_, isLoading: caseLoading, error: caseError } = useCase(caseId)
  const { 
    history, 
    isLoading: historyLoading, 
    hasMore,
    loadMore 
  } = useCaseHistory({ 
    caseId,
    limit: 20 // Start with a reasonable number of entries
  })

  // Update URL when chat panel visibility changes
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams)
    if (showChat) {
      newParams.set('panel', 'chat')
    } else {
      newParams.delete('panel')
    }
    router.replace(`${pathname}?${newParams.toString()}`)
  }, [showChat, pathname, router, searchParams])

  if (caseLoading) {
    return <div>Loading...</div>
  }

  if (caseError || !case_) {
    return <div>Error loading case</div>
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={60} minSize={40}>
          <div className="h-full p-6 space-y-8 overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold">{case_.title}</h1>
                <div className="flex items-center gap-2">
                  <CaseStatusBadge status={case_.status} />
                  {!showChat && case_.metadata && typeof case_.metadata === 'object' && 'chat_status' in case_.metadata && (
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "gap-2",
                        case_.metadata.chat_status === 'needs_response' && "border-red-500 text-red-500 hover:bg-red-500/10"
                      )}
                      onClick={() => setShowChat(true)}
                    >
                      <MessageSquare className="h-4 w-4" />
                      {case_.metadata.chat_status === 'needs_response' ? 'Needs Response' : 'Open Chat'}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Case Metadata */}
            <CaseMetadata
              case={case_}
              showAttachments={true}
              showAssignedTo={true}
              showCreatedAt={true}
              showUpdatedAt={true}
              showPatient={true}
              dateFormat="absolute"
              variant="default"
              iconSize="md"
            />

            {/* Case Description */}
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Description</h2>
              <p className="text-muted-foreground">{case_.description}</p>
            </div>

            {/* Case Timeline */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Timeline</h2>
              <CaseTimeline
                history={history}
                isLoading={historyLoading}
                hasMore={hasMore}
                onLoadMore={loadMore}
              />
            </div>
          </div>
        </ResizablePanel>

        {showChat && (
          <>
            <ResizableHandle />
            <ResizablePanel defaultSize={40} minSize={30}>
              <div className="h-full flex flex-col">
                <div className="p-2 border-b flex items-center justify-between">
                  <h2 className="font-semibold">Chat</h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowChat(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex-1">
                  <ChatPanel
                    caseId={caseId}
                    patientId={case_.patient_id}
                  />
                </div>
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  )
} 