import type { User } from '@supabase/supabase-js'

import type { ProfileFormData } from '@/features/profile/types/profile'

export function getUserDisplayName(user: User | null): string {
  const metadata = user?.user_metadata
  const fullName = typeof metadata?.full_name === 'string' ? metadata.full_name.trim() : ''
  const username = typeof metadata?.username === 'string' ? metadata.username.trim() : ''
  const email = user?.email?.trim() ?? ''

  if (fullName) {
    return fullName
  }

  if (username) {
    return username
  }

  if (email.includes('@')) {
    return email.split('@')[0] ?? email
  }

  return email
}

export function getUserInitials(user: User | null): string {
  const value = getUserDisplayName(user)

  if (!value) {
    return 'U'
  }

  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function createProfileForm(user: User): ProfileFormData {
  return {
    name: getUserDisplayName(user),
    email: user.email ?? '',
  }
}
