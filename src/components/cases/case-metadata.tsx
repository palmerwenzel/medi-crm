import { AlertCircle, Clock, FileText } from 'lucide-react'
import type { CaseResponse } from '@/lib/validations/case'

interface CaseMetadataProps {
  case: CaseResponse
  showAttachments?: boolean
}

export function CaseMetadata({ case: caseData, showAttachments = true }: CaseMetadataProps) {
  // Format patient name
  const patientName = caseData.patient
    ? `${caseData.patient.first_name || ''} ${caseData.patient.last_name || ''}`.trim()
    : 'Unknown Patient'

  return (
    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
      <div className="flex items-center gap-1">
        <AlertCircle className="h-4 w-4" />
        <span>Patient: {patientName}</span>
      </div>
      
      <div className="flex items-center gap-1">
        <Clock className="h-4 w-4" />
        <span>{new Date(caseData.created_at).toLocaleDateString()}</span>
      </div>

      {showAttachments && caseData.attachments && Array.isArray(caseData.attachments) && caseData.attachments.length > 0 && (
        <div className="flex items-center gap-1">
          <FileText className="h-4 w-4" />
          <span>{caseData.attachments.length} attachments</span>
        </div>
      )}
    </div>
  )
} 