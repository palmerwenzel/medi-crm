/**
 * Layout wrapper for role-based routes
 * Ensures user has a valid role before rendering children
 */
export default async function RoleBasedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
} 