import type { User } from '@supabase/supabase-js'

import { getAuthCallbackUrl } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import type { PasswordFormData, ProfileFormData } from '@/types/profile'

export function createPasswordForm(): PasswordFormData {
  return {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  }
}

export async function updateProfile(user: User, formData: ProfileFormData): Promise<User> {
  const name = formData.name.trim()
  const email = formData.email.trim()

  if (!name || !email) {
    throw new Error('Please fill in all fields.')
  }

  const { data, error } = await supabase.auth.updateUser(
    {
      email,
      data: {
        ...user.user_metadata,
        full_name: name,
      },
    },
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
