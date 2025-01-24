import { Metadata } from 'next'
import { ProfileContent } from './profile-content'

export const metadata: Metadata = {
  title: 'Profile - TonIQ',
  description: 'Manage your account settings and preferences.',
}

export default function ProfilePage() {
  return <ProfileContent />
} 