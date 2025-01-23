/**
 * Type definitions for staff members and related functionality
 */

import type { StaffSpecialty } from '@/lib/validations/case'

/**
 * Represents a staff member in the system
 */
export interface StaffMember {
  /** Unique identifier for the staff member */
  id: string
  /** Display name of the staff member */
  name: string
  /** Staff member's role */
  role: 'staff'
  /** Staff member's specialties */
  specialties?: StaffSpecialty[]
} 