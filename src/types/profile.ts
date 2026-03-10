export interface ProfileFormData {
  name: string
  email: string
}

export interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface CancelPendingEmailChangePayload {
  email: string
}
