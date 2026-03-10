import type { User } from '@supabase/supabase-js'

import { getAuthCallbackUrl } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import type {
  CancelPendingEmailChangePayload,
  PasswordFormData,
  ProfileFormData,
} from '@/types/profile'

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

  const attributes: Parameters<typeof supabase.auth.updateUser>[0] = {
    data: {
      ...user.user_metadata,
      full_name: name,
    },
  }

  if (email !== currentEmail) {
    attributes.email = email
  }

  const { data, error } = await supabase.auth.updateUser(
    attributes,
    {
      emailRedirectTo: getAuthCallbackUrl(),
    }
  )

  if (error) {
    throw new Error(error.message)
  }

  if (!data.user) {
    throw new Error('Unable to update your profile right now.')
  }

  return data.user
}

export async function cancelPendingEmailChange(
  payload: CancelPendingEmailChangePayload
): Promise<User> {
  const email = payload.email.trim().toLowerCase()

  if (!email) {
    throw new Error('The confirmed email is required to cancel the pending change.')
  }

  const { data, error } = await supabase.functions.invoke('cancel-pending-email-change', {
    body: { email },
  })

  if (error) {
    throw new Error(error.message)
  }

  if (data?.error) {
    throw new Error(data.error)
  }

  const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession()

  if (refreshError) {
    throw new Error(refreshError.message)
  }

  if (refreshData.user) {
    return refreshData.user
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

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

  const { error } = await supabase.auth.updateUser({
    password: formData.newPassword,
    current_password: formData.currentPassword,
  })

  if (error) {
    throw new Error(error.message)
  }
}
