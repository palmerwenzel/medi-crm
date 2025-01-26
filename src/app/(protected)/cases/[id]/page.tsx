import { CaseDetailView } from '@/components/cases/case-detail-view'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Case Details',
  description: 'View and manage case details',
}

interface CaseDetailPageProps {
  params: {
    id: string
  }
  searchParams: {
    panel?: string
  }
}

export default function CaseDetailPage({ params, searchParams }: CaseDetailPageProps) {
  return (
    <CaseDetailView 
      caseId={params.id} 
      initialPanel={searchParams.panel}
    />
  )
} 