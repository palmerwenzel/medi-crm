'use client'

import { RoleGuard } from '@/components/auth/role-guard'

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleGuard allowedRoles={['patient']}>
      {children}
    </RoleGuard>
  )
} 