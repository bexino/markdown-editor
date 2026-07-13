import type { User } from '@supabase/supabase-js'

import { getAuthCallbackUrl } from '@/shared/lib/auth'
import { supabase } from '@/shared/services/supabase'
import type {
  CancelPendingEmailChangePayload,
  PasswordFormData,
  ProfileFormData,
} from '@/features/profile/types/profile'

export function createPasswordForm(): PasswordFormData {
  return {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  }
}

export async function updateProfile(user: User, formData: ProfileFormData): Promise<User> {
  const name = formData.name.trim()
  const email = formData.email.trim().toLowerCase()
  const currentEmail = user.email?.trim().toLowerCase() ?? ''

  if (!name || !email) {
    throw new Error('Please fill in all fields.')
  }

  const supabaseClient = supabase!

  const attributes: Parameters<typeof supabaseClient.auth.updateUser>[0] = {
    data: {
      ...user.user_metadata,
      full_name: name,
    },
  }

  if (email !== currentEmail) {
    attributes.email = email
  }

  const { data, error } = await supabaseClient.auth.updateUser(attributes, {
    emailRedirectTo: getAuthCallbackUrl(),
  })

  if (error) {
    throw new Error(error.message)
  }

  if (!data.user) {
    throw new Error('Unable to update your profile right now.')
  }

  return data.user
}

export async function cancelPendingEmailChange(
  payload: CancelPendingEmailChangePayload,
): Promise<User> {
  const email = payload.email.trim().toLowerCase()

  if (!email) {
    throw new Error('The confirmed email is required to cancel the pending change.')
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase!.auth.getSession()

  if (sessionError) {
    throw new Error(sessionError.message)
  }

  if (!session?.access_token) {
    throw new Error(
      'Your session expired. Sign in again before canceling the pending email change.',
    )
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cancel-pending-email-change`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ email }),
    },
  )

  let data: { error?: string } | null = null

  try {
    data = (await response.json()) as { error?: string }
  } catch {
    data = null
  }

  if (!response.ok) {
    throw new Error(
      data?.error ??
        'The cancel email change function returned an unexpected response. Check the Edge Function logs and environment variables.',
    )
  }

  if (data?.error) {
    throw new Error(data.error)
  }

  const { data: refreshData, error: refreshError } = await supabase!.auth.refreshSession()

  if (refreshError) {
    throw new Error(refreshError.message)
  }

  if (refreshData.user) {
    return refreshData.user
  }

  const {
    data: { user },
    error: userError,
  } = await supabase!.auth.getUser()

  if (userError) {
    throw new Error(userError.message)
  }

  if (!user) {
    throw new Error('Unable to refresh your profile right now.')
  }

  return user
}

export async function changePassword(formData: PasswordFormData): Promise<void> {
  if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
    throw new Error('Please fill in all password fields.')
  }

  if (formData.newPassword.length < 6) {
    throw new Error('New password must be at least 6 characters.')
  }

  if (formData.newPassword !== formData.confirmPassword) {
    throw new Error('New passwords do not match.')
  }

  const { error } = await supabase!.auth.updateUser({
    password: formData.newPassword,
    current_password: formData.currentPassword,
  })

  if (error) {
    throw new Error(error.message)
  }
}
