export type UserRole = 'admin' | 'staff' | 'patient'

export interface User {
  id: string
  email: string
  role: UserRole
  firstName?: string
  lastName?: string
  createdAt: Date
  updatedAt: Date
}

export interface AuthUser extends User {
  accessToken: string
  refreshToken: string
} 